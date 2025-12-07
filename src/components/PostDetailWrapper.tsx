import React from 'react';
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { ArrowLeft, Calendar, Clock, Heart } from "lucide-react";
import { motion } from "motion/react";
import { PostActions } from "./PostActions";

interface PostDetailWrapperProps {
  title: string;
  category: string;
  date: string;
  tags?: string[];
  coverImage?: string;
  slug: string;
  children: React.ReactNode;
}

export function PostDetailWrapper({ title, category, date, tags = [], coverImage, slug, children }: PostDetailWrapperProps) {
  const readingTime = 5;

  return (
    <div className="min-h-screen">
      {/* ヘッダーセクション */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-purple-500/10 border-b">
        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container max-w-4xl mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <a
              href="/"
              className="inline-flex items-center mb-8 -ml-4 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </a>

            {/* メタ情報 */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge variant="default" className="px-4 py-1.5 shadow-lg">
                {category}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={14} />
                <span>{readingTime} min read</span>
              </div>
            </div>

            {/* タイトル */}
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {title}
            </h1>

            {/* タグ */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 著者とアクション */}
            <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y bg-background/50 backdrop-blur-sm px-6 -mx-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarImage src="/icon.JPG" />
                  <AvatarFallback>NeU</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">NeU</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
              <PostActions slug={slug} title={title} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* コンテンツセクション */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="container max-w-4xl mx-auto px-6 py-16"
      >
        {/* 記事本文 - 画像はアスペクト比を維持して表示 */}
        <div
          className="prose prose-neutral md:prose-lg dark:prose-invert max-w-none leading-relaxed prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:w-auto prose-img:max-w-full prose-img:h-auto prose-img:mx-auto prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
        >
          {children}
        </div>

        <Separator className="my-16" />

        {/* CTA セクション */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-12 text-center border border-primary/20">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-primary-foreground mb-6 shadow-lg shadow-primary/25">
              <Heart className="fill-current" size={24} />
            </div>
            <h3 className="text-2xl font-black mb-3">Thanks for reading!</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              この記事が役に立ったら、他の記事もチェックしてみてください。
            </p>
            <a href="/">
              <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl">
                Read More Posts
              </Button>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
