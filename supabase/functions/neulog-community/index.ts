import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Headers": "content-type, x-neulog-visitor",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};
const allowedOrigins = new Set([
  "https://neu-dev.net",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
]);
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", data)))
    .map(byte => byte.toString(16).padStart(2, "0")).join("");
}
function visitorSource(req: Request) {
  const visitor = (req.headers.get("x-neulog-visitor") || "").slice(0, 80);
  const forwarded = (req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "").split(",")[0].trim();
  return `${visitor}:${forwarded}:${Deno.env.get("VISITOR_SALT") || "neulog"}`;
}
function validPollKey(value: string) {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value);
}
async function rateLimit(visitorHash: string, action: string, limit: number, minutes: number) {
  const now = Date.now();
  const { data } = await supabase.from("neulog_rate_limits").select("*").eq("visitor_hash", visitorHash).eq("action", action).maybeSingle();
  if (!data || now - new Date(data.window_started_at).getTime() > minutes * 60_000) {
    await supabase.from("neulog_rate_limits").upsert({ visitor_hash: visitorHash, action, request_count: 1, window_started_at: new Date().toISOString() });
    return true;
  }
  if (data.request_count >= limit) return false;
  await supabase.from("neulog_rate_limits").update({ request_count: data.request_count + 1 }).eq("visitor_hash", visitorHash).eq("action", action);
  return true;
}
async function reactionCounts(slug?: string) {
  let query = supabase.from("neulog_reactions").select("article_slug,reaction");
  if (slug) query = query.eq("article_slug", slug);
  const { data, error } = await query;
  if (error) throw error;
  const counts: Record<string, Record<string, number>> = {};
  for (const row of data || []) {
    counts[row.article_slug] ||= { spark: 0, try: 0, broke: 0 };
    counts[row.article_slug][row.reaction] += 1;
  }
  return counts;
}
async function leaderboard() {
  const { data, error } = await supabase.from("neulog_scores").select("player_name,score,updated_at").order("score", { ascending: false }).order("updated_at", { ascending: true }).limit(10);
  if (error) throw error;
  return data || [];
}
async function pollResults(articleSlug: string, pollId: string, visitorHash: string) {
  const [{ data: votes, error: votesError }, { data: selected, error: selectedError }] = await Promise.all([
    supabase.from("neulog_poll_votes").select("option_index").eq("article_slug", articleSlug).eq("poll_id", pollId),
    supabase.from("neulog_poll_votes").select("option_index").eq("article_slug", articleSlug).eq("poll_id", pollId).eq("visitor_hash", visitorHash).maybeSingle(),
  ]);
  if (votesError) throw votesError;
  if (selectedError) throw selectedError;
  const counts = Array.from({ length: 6 }, () => 0);
  for (const vote of votes || []) counts[vote.option_index] += 1;
  return {
    counts,
    total: counts.reduce((sum, count) => sum + count, 0),
    selected: selected?.option_index ?? null,
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const responseHeaders = {
    ...headers,
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://neu-dev.net",
    "Vary": "Origin",
  };
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: responseHeaders });
  if (req.method === "OPTIONS") return new Response("ok", { headers: responseHeaders });
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "";
    if (req.method === "GET" && action === "reactions") return json({ reactions: await reactionCounts(url.searchParams.get("slug") || undefined) });
    if (req.method === "GET" && action === "leaderboard") return json({ leaderboard: await leaderboard() });
    if (req.method === "GET" && action === "poll-results") {
      const articleSlug = String(url.searchParams.get("slug") || "");
      const pollId = String(url.searchParams.get("pollId") || "");
      if (!/^[^<>]{1,240}$/.test(articleSlug) || !validPollKey(pollId)) return json({ error: "invalid_poll" }, 400);
      const visitorHash = await sha256(visitorSource(req));
      return json({ poll: await pollResults(articleSlug, pollId, visitorHash) });
    }
    if (req.method !== "POST") return json({ error: "not_found" }, 404);

    const visitorHash = await sha256(visitorSource(req));
    const body = await req.json().catch(() => ({}));

    if (action === "visit") {
      const slug = String(body.slug || "");
      if (!/^[^<>]{1,240}$/.test(slug)) return json({ error: "invalid_visit" }, 400);
      if (!await rateLimit(visitorHash, "visit", 60, 60)) return json({ error: "slow_down" }, 429);
      const { data, error } = await supabase.rpc("record_neulog_article_visit", {
        p_article_slug: slug,
        p_visitor_hash: visitorHash,
      });
      if (error) throw error;
      return json({ visitNumber: data });
    }

    if (action === "react") {
      const slug = String(body.slug || "");
      const reaction = String(body.reaction || "");
      if (!/^[^<>]{1,240}$/.test(slug) || !["spark", "try", "broke"].includes(reaction)) return json({ error: "invalid_reaction" }, 400);
      if (!await rateLimit(visitorHash, "reaction", 24, 60)) return json({ error: "slow_down" }, 429);
      const { error } = await supabase.from("neulog_reactions").upsert({ article_slug: slug, reaction, visitor_hash: visitorHash });
      if (error) throw error;
      return json({ reactions: await reactionCounts(slug) });
    }

    if (action === "poll-vote") {
      const articleSlug = String(body.slug || "");
      const pollId = String(body.pollId || "");
      const optionIndex = Number(body.optionIndex);
      if (!/^[^<>]{1,240}$/.test(articleSlug) || !validPollKey(pollId) || !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex > 5) {
        return json({ error: "invalid_poll_vote" }, 400);
      }
      if (!await rateLimit(visitorHash, "poll_vote", 18, 60)) return json({ error: "slow_down" }, 429);
      const { error } = await supabase.from("neulog_poll_votes").insert({
        article_slug: articleSlug,
        poll_id: pollId,
        option_index: optionIndex,
        visitor_hash: visitorHash,
      });
      if (error && error.code !== "23505") throw error;
      return json({ poll: await pollResults(articleSlug, pollId, visitorHash) });
    }

    if (action === "start-game") {
      if (!await rateLimit(visitorHash, "start_game", 20, 60)) return json({ error: "slow_down" }, 429);
      const { data, error } = await supabase.from("neulog_game_sessions").insert({ visitor_hash: visitorHash }).select("id").single();
      if (error) throw error;
      return json({ sessionId: data.id });
    }

    if (action === "submit-score") {
      if (!await rateLimit(visitorHash, "submit_score", 12, 60)) return json({ error: "slow_down" }, 429);
      const name = String(body.name || "").trim().replace(/[<>]/g, "").slice(0, 12);
      const score = Number(body.score);
      const sessionId = String(body.sessionId || "");
      if (!name || !Number.isInteger(score) || score < 0 || score > 2_000_000 || !/^[0-9a-f-]{36}$/.test(sessionId)) return json({ error: "invalid_score" }, 400);
      const { data: session } = await supabase.from("neulog_game_sessions").select("*").eq("id", sessionId).eq("visitor_hash", visitorHash).is("used_at", null).maybeSingle();
      if (!session || Date.now() - new Date(session.started_at).getTime() < 10_000 || Date.now() - new Date(session.started_at).getTime() > 3_600_000) return json({ error: "invalid_session" }, 400);
      await supabase.from("neulog_game_sessions").update({ used_at: new Date().toISOString() }).eq("id", sessionId);
      const { data: existing } = await supabase.from("neulog_scores").select("score").eq("visitor_hash", visitorHash).maybeSingle();
      if (!existing || score > existing.score) {
        const { error } = await supabase.from("neulog_scores").upsert({ visitor_hash: visitorHash, player_name: name, score, updated_at: new Date().toISOString() }, { onConflict: "visitor_hash" });
        if (error) throw error;
      }
      return json({ leaderboard: await leaderboard(), saved: !existing || score > existing.score });
    }
    return json({ error: "not_found" }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: "temporary_unavailable" }, 500);
  }
});
