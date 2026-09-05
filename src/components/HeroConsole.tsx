import { useEffect, useRef } from 'react';

export function HeroConsole() {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    // Keep WebGL out of SSR and out of article-page bundles.
    import('../lib/hero-console').then(({ mountHeroConsole }) => {
      if (!disposed && rootRef.current) cleanup = mountHeroConsole(rootRef.current);
    }).catch(() => {
      const status = rootRef.current?.querySelector('[role="status"]');
      if (status) status.textContent = 'ゲーム機を2Dで表示しています。下のボタンからゲームで遊べます。';
    });
    return () => { disposed = true; cleanup?.(); };
  }, []);
  return (
    <div ref={rootRef} className="hero-console">
      <div className="console-stage" hidden>
        <button type="button" className="console-touch" aria-label="ブロック崩しの自動プレイを一時停止">
          <span className="sr-only">画面を押すと自動プレイを一時停止。矢印キーで向きを調整、Homeキーで元に戻せます。</span>
        </button>
      </div>
      <div className="console-fallback" role="group" aria-label="NEU-BOY ブロック崩しのゲーム機">
        <div className="console-fallback__label"><b>NEU-BOY</b><span>● POWER</span></div>
        <button type="button" className="console-fallback-toggle" aria-label="ブロック崩しの自動プレイを一時停止"><canvas width={768} height={440} /></button>
        <div className="console-fallback__keys" aria-hidden="true"><span>✚</span><b>B</b><b>A</b></div>
      </div>
      <span className="sr-only" role="status" />
    </div>
  );
}
