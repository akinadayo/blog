import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Headers": "content-type, x-neulog-dashboard, x-neulog-visitor",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};
const allowedOrigins = new Set([
  "https://neu-dev.net",
  "http://localhost:4321",
  "http://127.0.0.1:4321",
  "null",
]);
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", data)))
    .map(byte => byte.toString(16).padStart(2, "0")).join("");
}
async function secureEqual(left: string, right: string) {
  const encode = (value: string) => new TextEncoder().encode(value);
  const [leftDigest, rightDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encode(left)),
    crypto.subtle.digest("SHA-256", encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftDigest);
  const rightBytes = new Uint8Array(rightDigest);
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
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

type VisitRow = { article_slug: string; visitor_hash: string; created_at: string };
type ActivityRow = { article_slug: string; created_at: string };

let analyticsCache: { expiresAt: number; snapshot: unknown } | null = null;

async function fetchAllRows<T>(table: string, columns: string) {
  const rows: T[] = [];
  const pageSize = 1000;
  for (let page = 0; page < 100; page += 1) {
    const from = page * pageSize;
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .order("created_at", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...((data || []) as T[]));
    if (!data || data.length < pageSize) break;
  }
  return rows;
}

function tokyoDateKey(value: string | number | Date) {
  return new Date(new Date(value).getTime() + 9 * 60 * 60_000).toISOString().slice(0, 10);
}

async function analyticsSnapshot() {
  if (analyticsCache && analyticsCache.expiresAt > Date.now()) return analyticsCache.snapshot;

  const [visits, reactions, pollVotes] = await Promise.all([
    fetchAllRows<VisitRow>("neulog_article_visits", "article_slug,visitor_hash,created_at"),
    fetchAllRows<ActivityRow>("neulog_reactions", "article_slug,created_at"),
    fetchAllRows<ActivityRow>("neulog_poll_votes", "article_slug,created_at"),
  ]);
  const homepageSlug = "site/neulog";
  const articleVisits = visits.filter(row => row.article_slug !== homepageSlug);
  const visitors = new Set(visits.map(row => row.visitor_hash));
  const homepageVisitors = new Set(visits.filter(row => row.article_slug === homepageSlug).map(row => row.visitor_hash));
  const articleVisitors = new Set(articleVisits.map(row => row.visitor_hash));
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60_000;
  const last7Visitors = new Set(visits.filter(row => new Date(row.created_at).getTime() >= sevenDaysAgo).map(row => row.visitor_hash));
  const pagesPerVisitor = new Map<string, Set<string>>();
  for (const row of visits) {
    if (!pagesPerVisitor.has(row.visitor_hash)) pagesPerVisitor.set(row.visitor_hash, new Set());
    pagesPerVisitor.get(row.visitor_hash)!.add(row.article_slug);
  }

  const articleMap = new Map<string, {
    slug: string;
    readers: number;
    reactions: number;
    pollVotes: number;
    lastReadAt: string | null;
  }>();
  const articleEntry = (slug: string) => {
    if (!articleMap.has(slug)) {
      articleMap.set(slug, { slug, readers: 0, reactions: 0, pollVotes: 0, lastReadAt: null });
    }
    return articleMap.get(slug)!;
  };
  for (const row of articleVisits) {
    const entry = articleEntry(row.article_slug);
    entry.readers += 1;
    if (!entry.lastReadAt || row.created_at > entry.lastReadAt) entry.lastReadAt = row.created_at;
  }
  for (const row of reactions) articleEntry(row.article_slug).reactions += 1;
  for (const row of pollVotes) articleEntry(row.article_slug).pollVotes += 1;

  const todayTokyo = new Date(Date.now() + 9 * 60 * 60_000);
  todayTokyo.setUTCHours(0, 0, 0, 0);
  const daily = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(todayTokyo.getTime() - (13 - index) * 24 * 60 * 60_000).toISOString().slice(0, 10);
    return { date, visitors: 0, articleReads: 0 };
  });
  const dailyMap = new Map(daily.map(day => [day.date, { day, visitors: new Set<string>() }]));
  for (const row of visits) {
    const bucket = dailyMap.get(tokyoDateKey(row.created_at));
    if (!bucket) continue;
    bucket.visitors.add(row.visitor_hash);
    if (row.article_slug !== homepageSlug) bucket.day.articleReads += 1;
  }
  for (const bucket of dailyMap.values()) bucket.day.visitors = bucket.visitors.size;

  const snapshot = {
    generatedAt: new Date().toISOString(),
    metrics: {
      totalVisitors: visitors.size,
      last7Visitors: last7Visitors.size,
      homepageVisitors: homepageVisitors.size,
      articleVisitors: articleVisitors.size,
      articleReads: articleVisits.length,
      returningVisitors: Array.from(pagesPerVisitor.values()).filter(pages => pages.size > 1).length,
      reactions: reactions.length,
      pollVotes: pollVotes.length,
    },
    daily,
    articles: Array.from(articleMap.values()).sort((left, right) =>
      right.readers - left.readers ||
      (right.reactions + right.pollVotes) - (left.reactions + left.pollVotes) ||
      left.slug.localeCompare(right.slug)
    ),
    coverage: {
      startedAt: visits[0]?.created_at || null,
      articleTrackingStartedOn: "2026-08-25",
      note: "記事別の閲覧数は、記事ページ計測の公開後から蓄積されます。",
    },
  };
  analyticsCache = { expiresAt: Date.now() + 60_000, snapshot };
  return snapshot;
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
    if (req.method === "GET" && action === "analytics") {
      const expectedKey = Deno.env.get("DASHBOARD_ACCESS_KEY") || "";
      const suppliedKey = req.headers.get("x-neulog-dashboard") || "";
      if (!expectedKey || !suppliedKey || !await secureEqual(expectedKey, suppliedKey)) {
        return json({ error: "unauthorized" }, 401);
      }
      try {
        return json({ analytics: await analyticsSnapshot() });
      } catch (error) {
        console.error("analytics_snapshot_failed", error);
        return json({ error: "temporary_unavailable" }, 500);
      }
    }
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
