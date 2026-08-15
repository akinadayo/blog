import React from 'react';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__marquee" aria-hidden="true">
        <span>MAKE ✦ BREAK ✦ DISCOVER ✦&nbsp;</span>
        <span>MAKE ✦ BREAK ✦ DISCOVER ✦&nbsp;</span>
      </div>
      <div className="site-footer__inner">
        <a href="/" className="brand brand--small"><span className="brand__mark">N</span><span>NeULOG</span></a>
        <p>© {new Date().getFullYear()} NeU.dev — Astroと好奇心で制作。</p>
        <a href="#top" className="footer-top">↑ ページ上部へ</a>
      </div>
    </footer>
  );
}
