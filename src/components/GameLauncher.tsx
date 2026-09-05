import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'motion/react';
const RetroGame = lazy(() => import('./RetroGame').then(module => ({ default: module.RetroGame })));

export function GameLauncher({ showButton = true }: { showButton?: boolean }) {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const open = () => setIsGameOpen(true);
    window.addEventListener('open-neulog-game', open);
    return () => window.removeEventListener('open-neulog-game', open);
  }, []);

  useEffect(() => {
    document.body.dataset.neulogGameOpen = String(isGameOpen);
    window.dispatchEvent(new CustomEvent('neulog-game-visibility', { detail: isGameOpen }));
    if (!isGameOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const controls = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]'));
      const first = controls[0], last = controls.at(-1);
      if (!first || !last) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', trapFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.dataset.neulogGameOpen = 'false';
      window.dispatchEvent(new CustomEvent('neulog-game-visibility', { detail: false }));
      document.removeEventListener('keydown', trapFocus);
      previousFocus?.focus();
    };
  }, [isGameOpen]);

  return (
    <>
      {showButton && <button onClick={() => setIsGameOpen(true)} className="pixel-button game-launcher-button">
        <span className="game-launcher-icon" aria-hidden="true">▶</span>
        <span>ブロック崩しで遊ぶ</span>
        <span aria-hidden="true">↗</span>
      </button>}
      {typeof document !== 'undefined' && isGameOpen && createPortal(
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="ブロック崩し" tabIndex={-1}>
          <Suspense fallback={<div className="game-loading"><p role="status">ゲームを読み込み中…</p><button className="pixel-button" onClick={() => setIsGameOpen(false)}>閉じる</button></div>}>
            <AnimatePresence>
              <RetroGame onClose={() => setIsGameOpen(false)} />
            </AnimatePresence>
          </Suspense>
        </div>, document.body,
      )}
    </>
  );
}
