import React from 'react';
import { motion } from 'motion/react';
import { PostActions } from './PostActions';

interface Props { title: string; category: string; date: string; tags?: string[]; slug: string; coverImage?: string; }

export function PostHeader({ title, category, date, tags = [], slug, coverImage }: Props) {
  return (
    <header className={`post-hero post-hero--${category}`}>
      <motion.div className="post-hero__inner" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <a href={`/${category}/`} className="post-back">← {category === 'tech' ? '技術記事' : '日記'}へ戻る</a>
        <div className="post-meta"><span>{category === 'tech' ? '技術' : '日記'}</span><time>{date}</time><i>実験完了</i></div>
        <h1>{title}</h1>
        {tags.length > 0 && <div className="post-tags">{tags.map(tag => <span key={tag}>#{tag}</span>)}</div>}
        <div className="post-author"><img src="/icon.JPG" alt="" /><div><b>書いた人：NeU</b><span>iOS・Webの個人開発</span></div><PostActions slug={slug} title={title} /></div>
      </motion.div>
      {coverImage && <div className="post-hero__cover"><img src={coverImage} alt="" /></div>}
    </header>
  );
}
