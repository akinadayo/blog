import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
import { RetroGame } from './RetroGame';

export function GameLauncher() {
  const [isGameOpen, setIsGameOpen] = useState(false);

  useEffect(() => {
    const open = () => setIsGameOpen(true);
    window.addEventListener('open-neulog-game', open);
    return () => window.removeEventListener('open-neulog-game', open);
  }, []);

  return (
    <>
      <button onClick={() => setIsGameOpen(true)} className="pixel-button pixel-button--pink game-launcher-button">
        <span className="game-launcher-icon" aria-hidden="true">▶</span>
        <span>ブロック崩しで遊ぶ</span>
      </button>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isGameOpen && <RetroGame onClose={() => setIsGameOpen(false)} />}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
