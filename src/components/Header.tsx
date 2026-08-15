import React from 'react';

interface HeaderProps {
  currentPage?: string;
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="/" className="brand" aria-label="NeULOG ホーム">
          <span className="brand__mark" aria-hidden="true">N</span>
          <span className="brand__name">NeULOG</span>
        </a>
        <nav className="site-nav" aria-label="メインメニュー">
          <a className={currentPage === 'home' ? 'is-active' : ''} href="/">ホーム</a>
          <a className={currentPage === 'about' ? 'is-active' : ''} href="/about/">プロフィール</a>
        </nav>
      </div>
    </header>
  );
}
