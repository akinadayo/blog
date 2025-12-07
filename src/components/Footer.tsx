import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t-4 border-primary bg-card">
      <div className="h-2 bg-accent" />

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
            <span>&copy; {currentYear} NeU.dev</span>
            <span>&bull;</span>
            <span>MADE WITH</span>
            <motion.span
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <Heart size={12} className="text-destructive fill-current inline" />
            </motion.span>
            <span>USING ASTRO & REACT</span>
          </p>
          <motion.p
            className="text-xs text-accent font-display"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            PRESS ANY KEY TO CONTINUE
          </motion.p>
        </motion.div>
      </div>

      <div className="h-2 bg-secondary" />
    </footer>
  );
}
