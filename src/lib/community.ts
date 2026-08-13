export const COMMUNITY_URL = 'https://jyfqjuldwjcrvhnwfviw.supabase.co/functions/v1/neulog-community';

export type ReactionCounts = Record<string, Record<string, number>>;
export type CommunityScore = { player_name: string; score: number };

export function visitorId() {
  let id = localStorage.getItem('neulog-visitor');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('neulog-visitor', id);
  }
  return id;
}

export async function communityApi<T>(action: string, options?: { method?: 'GET' | 'POST'; body?: object; params?: Record<string, string> }): Promise<T> {
  const method = options?.method || 'GET';
  const query = new URLSearchParams({ action, ...options?.params });
  const response = await fetch(`${COMMUNITY_URL}?${query}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-neulog-visitor': visitorId() },
    body: method === 'POST' ? JSON.stringify(options?.body || {}) : undefined,
  });
  if (!response.ok) throw new Error(`community_${response.status}`);
  return response.json();
}

let allReactionsRequest: Promise<ReactionCounts> | undefined;

export function getAllReactionCounts() {
  if (!allReactionsRequest) {
    allReactionsRequest = communityApi<{ reactions: ReactionCounts }>('reactions')
      .then(data => data.reactions)
      .catch(error => {
        allReactionsRequest = undefined;
        throw error;
      });
  }
  return allReactionsRequest;
}
