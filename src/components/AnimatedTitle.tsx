import React from 'react';
import { motion } from 'motion/react';

export function AnimatedTitle() {
  return (
    <div className="space-y-2 md:space-y-4">
      <motion.p
        className="text-4xl md:text-5xl lg:text-6xl text-secondary leading-tight font-display"
        style={{
          textShadow: '4px 4px 0 hsl(280 100% 60%), 8px 8px 0 hsl(180 100% 50%)',
        }}
        animate={{
          textShadow: [
            '4px 4px 0 hsl(280 100% 60%), 8px 8px 0 hsl(180 100% 50%)',
            '4px 4px 0 hsl(180 100% 50%), 8px 8px 0 hsl(280 100% 60%)',
            '4px 4px 0 hsl(280 100% 60%), 8px 8px 0 hsl(180 100% 50%)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        NeU.dev
      </motion.p>
      <div className="pt-2 md:pt-4">
        <h1 className="text-xl md:text-4xl text-secondary font-display" style={{ textShadow: '2px 2px 0 hsl(280 100% 60%)' }}>
          TECH & LIFE
        </h1>
        <h2 className="text-xl md:text-4xl text-secondary font-display" style={{ textShadow: '2px 2px 0 hsl(280 100% 60%)' }}>
          JOURNEY
        </h2>
      </div>
    </div>
  );
}
