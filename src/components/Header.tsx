import React from 'react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentPage?: string;
}

export function Header({ currentPage = 'home' }: HeaderProps) {
  return (
    <header className="md:sticky md:top-0 z-50 w-full border-b-2 md:border-b-4 border-primary bg-card shadow-[0_0_20px_rgba(168,85,247,0.4)]">
      <div className="container flex h-12 md:h-16 items-center justify-between px-2 md:px-4 max-w-7xl mx-auto">
        <motion.a
          href="/"
          className="cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span
            className="text-base md:text-xl text-accent font-display"
            style={{ textShadow: '1px 1px 0 hsl(280 100% 60%)' }}
          >
            NeULOG
          </span>
        </motion.a>

        <div className="flex items-center gap-1 md:gap-2">
          {[
            { id: 'home', label: 'HOME', href: '/' },
            { id: 'about', label: 'ABOUT', href: '/about/' },
          ].map((item) => (
            <motion.a
              key={item.id}
              href={item.href}
              className={`px-2 py-1 md:px-4 md:py-2 text-[10px] md:text-xs border-2 md:border-4 transition-all font-display ${
                currentPage === item.id
                  ? 'bg-primary text-primary-foreground border-accent shadow-[2px_2px_0_0_hsl(50_100%_60%)] md:shadow-[4px_4px_0_0_hsl(50_100%_60%)]'
                  : 'bg-card text-foreground border-primary hover:bg-primary hover:text-primary-foreground'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              {item.label}
            </motion.a>
          ))}

          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-2 bg-muted border-2 border-accent">
            <span className="text-xs text-accent font-display">SCORE:</span>
            <motion.span
              className="text-xs text-secondary font-sans font-semibold"
              animate={{
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              999999
            </motion.span>
          </div>
        </div>
      </div>

      <motion.div
        className="h-1 bg-accent"
        animate={{
          scaleX: [1, 0.95, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
    </header>
  );
}
