import React, { useEffect, useState } from 'react';
import { communityApi } from '../lib/community';

const SITE_VISITOR_KEY = 'site/neulog';

export function VisitorTicket() {
  const [visitNumber, setVisitNumber] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    communityApi<{ visitNumber: number }>('visit', { method: 'POST', body: { slug: SITE_VISITOR_KEY } })
      .then(data => setVisitNumber(data.visitNumber))
      .catch(() => setOffline(true));
  }, []);

  if (offline) return null;

  return <aside className={`visitor-ticket visitor-ticket--home ${visitNumber === null ? 'is-loading' : ''}`} aria-live="polite">
    <div className="visitor-ticket__stub"><span>ようこそ</span><b>♥</b><i>プレイヤー</i></div>
    <div className="visitor-ticket__main">
      <span>NeULOGへようこそ</span>
      <strong>No. {visitNumber === null ? '····' : String(visitNumber).padStart(4, '0')}</strong>
      <p>{visitNumber === null ? '番号を読み込み中…' : `あなたはこのブログを訪れた ${visitNumber}人目のプレイヤーです`}</p>
    </div>
    <div className="visitor-ticket__holes" aria-hidden="true">••••••</div>
  </aside>;
}
