import React from 'react';
import { motion } from 'motion/react';

interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  collection: 'tech' | 'diary';
  coverImage?: string;
  index?: number;
  featured?: boolean;
}

export function PostCard({ title, excerpt, date, category, slug, collection, coverImage, index = 0, featured = false }: PostCardProps) {
  return (
    <motion.article
      className={`log-card ${featured ? 'log-card--featured' : ''}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.28) }}
    >
      <a href={`/${collection}/${slug}/`}>
        <div className="log-card__media">
          {coverImage ? <img src={coverImage} alt="" loading="lazy" /> : (
            <div className="log-card__placeholder" aria-hidden="true">
              <span>{collection === 'tech' ? '&lt;/&gt;' : ':-)'}</span>
              <i />
            </div>
          )}
          <span className={`log-card__category log-card__category--${collection}`}>{category.toUpperCase()}</span>
          <span className="log-card__number">LOG {String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="log-card__body">
          <time>{date}</time>
          <h3>{title}</h3>
          {excerpt && <p>{excerpt}</p>}
          <span className="log-card__read">READ QUEST <b>↗</b></span>
        </div>
      </a>
    </motion.article>
  );
}
