import React, { useEffect, useState } from 'react';
import { communityApi } from '../lib/community';

export function VisitorTicket({ slug }: { slug: string }) {
  const [visitNumber, setVisitNumber] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    communityApi<{ visitNumber: number }>('visit', { method: 'POST', body: { slug } })
      .then(data => setVisitNumber(data.visitNumber))
      .catch(() => setOffline(true));
  }, [slug]);

  if (offline) return null;

  return <aside className={`visitor-ticket ${visitNumber === null ? 'is-loading' : ''}`} aria-live="polite">
    <div className="visitor-ticket__stub"><span>ADMIT</span><b>♥</b><i>ONE</i></div>
    <div className="visitor-ticket__main">
      <span>NeULOG VISITOR PASS</span>
      <strong>No. {visitNumber === null ? '····' : String(visitNumber).padStart(4, '0')}</strong>
      <p>{visitNumber === null ? '入場記録をロード中…' : `あなたはこの記事を訪れた ${visitNumber}人目の探索者です`}</p>
    </div>
    <div className="visitor-ticket__holes" aria-hidden="true">••••••</div>
  </aside>;
}
