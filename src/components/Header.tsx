import React from 'react';

interface HeaderProps {
  currentPage?: string;
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="/" className="brand" aria-label="NeULOG home">
          <span className="brand__mark" aria-hidden="true">N</span>
          <span className="brand__name">NeULOG</span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a className={currentPage === 'home' ? 'is-active' : ''} href="/">HOME</a>
          <a className={currentPage === 'about' ? 'is-active' : ''} href="/about/">ABOUT</a>
        </nav>
      </div>
    </header>
  );
}
