import React, { useEffect, useState } from 'react';
import { communityApi, type CommunityScore } from '../lib/community';

export function Leaderboard() {
  const [scores, setScores] = useState<CommunityScore[]>([]);
  const [offline, setOffline] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);

  useEffect(() => {
    const readPersonalBest = () => setPersonalBest(Number(localStorage.getItem('brickBreaker_highScore') || 0));
    communityApi<{ leaderboard: CommunityScore[] }>('leaderboard').then(data => setScores(data.leaderboard)).catch(() => setOffline(true));
    readPersonalBest();
    const update = (event: Event) => {
      setScores((event as CustomEvent<CommunityScore[]>).detail);
      readPersonalBest();
    };
    const updatePersonalBest = (event: Event) => setPersonalBest((event as CustomEvent<number>).detail);
    window.addEventListener('neulog-score-updated', update);
    window.addEventListener('neulog-personal-best', updatePersonalBest);
    return () => {
      window.removeEventListener('neulog-score-updated', update);
      window.removeEventListener('neulog-personal-best', updatePersonalBest);
    };
  }, []);

  const visibleScores = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);
  const topScore = visibleScores[0]?.score || 0;
  const gap = topScore && personalBest ? Math.max(0, topScore - personalBest) : null;

  return <section className="leaderboard-section">
    <div className="section-kicker"><span>ONE RUN / 1面勝負</span><b>ブロック崩しランキング</b></div>
    <div className="leaderboard-rules" aria-label="得点ルール">
      <span>端打ち <b>次の破壊 ×2</b></span>
      <span>連続破壊 <b>最大 ×4</b></span>
      <span>速攻・残機 <b>クリア加点</b></span>
    </div>
    <div className="leaderboard-summary">
      <span>あなたの端末ベスト</span>
      <b>{personalBest ? personalBest.toLocaleString() : '未挑戦'}</b>
      <em>{gap === null ? 'まずは1面クリア！' : gap === 0 ? '現在トップ圏内！' : `首位まで あと ${gap.toLocaleString()}`}</em>
    </div>
    <div className="leaderboard-board">{visibleScores.length ? visibleScores.map((row, i) => {
      const leaderGap = Math.max(0, topScore - row.score);
      const meter = topScore ? Math.max(8, (row.score / topScore) * 100) : 0;
      return <div className={`leaderboard-row leaderboard-row--${Math.min(i + 1, 4)}`} key={`${row.player_name}-${i}`}>
        <span className="leaderboard-rank">{i === 0 ? '♛' : String(i + 1).padStart(2, '0')}</span>
        <span className="leaderboard-player"><b>{row.player_name}</b><small>{i === 0 ? 'トップを防衛中' : `首位差 ${leaderGap.toLocaleString()}`}</small></span>
        <span className="leaderboard-score"><em>{row.score.toLocaleString()}</em><i><u style={{ width: `${meter}%` }} /></i></span>
      </div>;
    }) : <div className="leaderboard-empty"><span>--</span><b>最初のプレイヤーになろう</b><em>0</em></div>}</div>
    <button className="pixel-button pixel-button--pink" onClick={() => window.dispatchEvent(new Event('open-neulog-game'))}>▶ 1面勝負に挑戦</button>
    {offline && <small>オフライン中 / ブログとゲームはそのまま楽しめます</small>}
  </section>;
}
