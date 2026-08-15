import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getAllReactionCounts } from '../lib/community';

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
  const [reactions, setReactions] = useState<Record<string, number>>({});
  useEffect(() => {
    getAllReactionCounts().then(all => setReactions(all[`${collection}/${slug}`] || {})).catch(() => {});
  }, [collection, slug]);
  const blocks = [reactions.spark || 0, reactions.try || 0, reactions.broke || 0];
  const totalReactions = blocks.reduce((sum, value) => sum + value, 0);
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
          <span className={`log-card__category log-card__category--${collection}`}>{collection === 'tech' ? '技術' : '日記'}</span>
          <span className="log-card__number">No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="log-card__body">
          <time>{date}</time>
          <h3>{title}</h3>
          {excerpt && <p>{excerpt}</p>}
          {totalReactions > 0 && <div className="log-card__reactions" aria-label={`${totalReactions} reactions`}>
            {blocks.map((count, group) => Array.from({ length: Math.min(count, 7) }, (_, i) => <i key={`${group}-${i}`} className={`reaction-brick reaction-brick--${group}`} />))}
            <span>{totalReactions} ブロック</span>
          </div>}
          <span className="log-card__read">記事を読む <b>↗</b></span>
        </div>
      </a>
    </motion.article>
  );
}
