import React from 'react';

interface HeaderProps {
  currentPage?: string;
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="/" className="brand" aria-label="NeULOG ホーム" aria-current={currentPage === 'home' ? 'page' : undefined}>
          <span className="brand__mark" aria-hidden="true">N</span>
          <span className="brand__name">NeULOG</span>
        </a>
        <nav className="site-nav" aria-label="メインメニュー">
          <a className={currentPage === 'tech' ? 'is-active' : ''} aria-current={currentPage === 'tech' ? 'page' : undefined} href="/tech/">技術</a>
          <a className={currentPage === 'diary' ? 'is-active' : ''} aria-current={currentPage === 'diary' ? 'page' : undefined} href="/diary/">日記</a>
          <a className={currentPage === 'about' ? 'is-active' : ''} aria-current={currentPage === 'about' ? 'page' : undefined} href="/about/">プロフィール</a>
        </nav>
      </div>
    </header>
  );
}
