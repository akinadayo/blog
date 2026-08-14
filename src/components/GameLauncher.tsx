import React, { useEffect, useState } from 'react';
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
        <span aria-hidden="true">▶</span> PRESS START<span className="game-launcher-suffix"> · PLAY</span>
      </button>
      <AnimatePresence>
        {isGameOpen && <RetroGame onClose={() => setIsGameOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
