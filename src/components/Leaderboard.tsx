import React, { useEffect, useState } from 'react';
import { communityApi, type CommunityScore } from '../lib/community';

export function Leaderboard() {
  const [scores, setScores] = useState<CommunityScore[]>([]);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    communityApi<{ leaderboard: CommunityScore[] }>('leaderboard').then(data => setScores(data.leaderboard)).catch(() => setOffline(true));
    const update = (event: Event) => setScores((event as CustomEvent<CommunityScore[]>).detail);
    window.addEventListener('neulog-score-updated', update);
    return () => window.removeEventListener('neulog-score-updated', update);
  }, []);
  return <section className="leaderboard-section"><div className="section-kicker"><span>NEULOG ARCADE / ALL TIME</span><b>HALL OF FAME</b></div>
    <div className="leaderboard-board">{scores.length ? scores.map((row, i) => <div key={`${row.player_name}-${i}`}><span>{String(i + 1).padStart(2, '0')}</span><b>{row.player_name}</b><em>{row.score.toLocaleString()}</em></div>) : <div className="leaderboard-empty"><span>--</span><b>BE THE FIRST PLAYER</b><em>0</em></div>}</div>
    <button className="pixel-button pixel-button--pink" onClick={() => window.dispatchEvent(new Event('open-neulog-game'))}>▶ CHALLENGE THE RANKING</button>
    {offline && <small>OFFLINE MODE / ブログとゲームはそのまま楽しめます</small>}
  </section>;
}
