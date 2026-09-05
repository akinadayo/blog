import React from 'react';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <a href="/" className="brand brand--small"><span className="brand__mark">n.</span><span>NeULOG</span></a>
        <p>© {new Date().getFullYear()} NeU.dev — Astroと好奇心で制作。</p>
        <button type="button" className="quest-button" data-side-quest>⚄ おまけを引く</button>
        <a href="#top" className="footer-top">↑ ページ上部へ</a>
        <p className="side-quest-message" data-side-quest-message aria-live="polite" />
      </div>
    </footer>
  );
}
