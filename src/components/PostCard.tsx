import React, { useEffect, useState } from 'react';
import { getAllReactionCounts } from '../lib/community';

interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  reactionSlug?: string;
  collection: 'tech' | 'diary';
  coverImage?: string;
  index?: number;
  featured?: boolean;
}

export function PostCard({ title, excerpt, date, category, slug, reactionSlug = slug, collection, coverImage, index = 0, featured = false }: PostCardProps) {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  useEffect(() => {
    getAllReactionCounts().then(all => setReactions(all[`${collection}/${reactionSlug}`] || {})).catch(() => {});
  }, [collection, reactionSlug]);
  const blocks = [reactions.spark || 0, reactions.try || 0, reactions.broke || 0];
  const totalReactions = blocks.reduce((sum, value) => sum + value, 0);
  return (
    <article
      className={`log-card ${featured ? 'log-card--featured' : ''}`}
    >
      <a href={`/${collection}/${slug}/`}>
        <div className="log-card__window"><span aria-hidden="true">● ● ●</span><span>{collection} / {String(index + 1).padStart(2, '0')}</span></div>
        {featured && <div className="log-card__media">
          {coverImage ? <img src={coverImage} alt="" loading="lazy" decoding="async" width={1200} height={675} /> : (
            <div className="log-card__placeholder" aria-hidden="true">
              <span>{collection === 'tech' ? '</>' : ':-)'}</span>
              <i />
            </div>
          )}
        </div>}
        <div className="log-card__body">
          <div className="log-card__meta"><span>{collection === 'tech' ? '技術 · 個人開発' : '日記 · 分析'}</span><time>{date.replaceAll('/', '.')}</time></div>
          <h3>{title}</h3>
          {excerpt && <p>{excerpt}</p>}
          {totalReactions > 0 && <div className="log-card__reactions" aria-label={`${totalReactions} reactions`}>
            {blocks.map((count, group) => Array.from({ length: Math.min(count, 7) }, (_, i) => <i key={`${group}-${i}`} className={`reaction-brick reaction-brick--${group}`} />))}
            <span>{totalReactions} ブロック</span>
          </div>}
          <span className="log-card__read">記事を読む <b>↗</b></span>
        </div>
      </a>
    </article>
  );
}
