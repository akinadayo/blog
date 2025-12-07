import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RetroGame } from './RetroGame';

export function GameLauncher() {
  const [isGameOpen, setIsGameOpen] = useState(false);

  return (
    <>
      {/* INSERT COIN ボタン */}
      <motion.button
        onClick={() => setIsGameOpen(true)}
        className="w-full px-4 py-2 md:px-8 md:py-4 bg-accent text-accent-foreground border-2 md:border-4 border-primary font-display text-[10px] md:text-sm"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 10px hsl(50 100% 60%)',
            '0 0 20px hsl(50 100% 60%)',
            '0 0 10px hsl(50 100% 60%)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      >
        INSERT COIN
      </motion.button>

      {/* ゲームモーダル */}
      <AnimatePresence>
        {isGameOpen && (
          <RetroGame onClose={() => setIsGameOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
