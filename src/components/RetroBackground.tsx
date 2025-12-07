import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export function RetroBackground() {
  // 固定の星の位置（ハイドレーションの不整合を防ぐ）
  const stars = useMemo(() => [
    { left: 5, top: 10, duration: 2.1, delay: 0.3 },
    { left: 15, top: 25, duration: 1.8, delay: 1.2 },
    { left: 25, top: 5, duration: 2.5, delay: 0.8 },
    { left: 35, top: 45, duration: 1.5, delay: 1.5 },
    { left: 45, top: 15, duration: 2.3, delay: 0.5 },
    { left: 55, top: 35, duration: 1.9, delay: 1.8 },
    { left: 65, top: 8, duration: 2.7, delay: 0.2 },
    { left: 75, top: 55, duration: 1.6, delay: 1.0 },
    { left: 85, top: 20, duration: 2.2, delay: 1.4 },
    { left: 95, top: 40, duration: 1.7, delay: 0.7 },
    { left: 10, top: 60, duration: 2.4, delay: 1.1 },
    { left: 20, top: 75, duration: 1.4, delay: 0.4 },
    { left: 30, top: 85, duration: 2.6, delay: 1.6 },
    { left: 40, top: 70, duration: 1.3, delay: 0.9 },
    { left: 50, top: 90, duration: 2.0, delay: 1.3 },
    { left: 60, top: 65, duration: 1.8, delay: 0.6 },
    { left: 70, top: 80, duration: 2.1, delay: 1.7 },
    { left: 80, top: 95, duration: 1.5, delay: 0.1 },
    { left: 90, top: 72, duration: 2.3, delay: 1.9 },
    { left: 3, top: 88, duration: 1.9, delay: 0.8 },
    { left: 12, top: 42, duration: 2.5, delay: 1.2 },
    { left: 22, top: 58, duration: 1.7, delay: 0.3 },
    { left: 32, top: 32, duration: 2.2, delay: 1.5 },
    { left: 42, top: 52, duration: 1.6, delay: 0.7 },
    { left: 52, top: 78, duration: 2.4, delay: 1.0 },
    { left: 62, top: 48, duration: 1.4, delay: 1.8 },
    { left: 72, top: 28, duration: 2.6, delay: 0.5 },
    { left: 82, top: 62, duration: 1.8, delay: 1.4 },
    { left: 92, top: 18, duration: 2.0, delay: 0.9 },
    { left: 8, top: 38, duration: 1.5, delay: 1.6 },
    { left: 18, top: 92, duration: 2.3, delay: 0.2 },
    { left: 28, top: 68, duration: 1.9, delay: 1.1 },
    { left: 38, top: 22, duration: 2.1, delay: 0.6 },
    { left: 48, top: 82, duration: 1.7, delay: 1.3 },
    { left: 58, top: 12, duration: 2.5, delay: 0.4 },
    { left: 68, top: 58, duration: 1.3, delay: 1.7 },
    { left: 78, top: 38, duration: 2.2, delay: 1.0 },
    { left: 88, top: 85, duration: 1.6, delay: 0.8 },
    { left: 98, top: 52, duration: 2.4, delay: 1.5 },
    { left: 2, top: 72, duration: 1.8, delay: 0.3 },
  ], []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* グリッドパターン - 薄く表示 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(280 60% 75%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(280 60% 75%) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 動く星（ドット） */}
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent rounded-full"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
}
