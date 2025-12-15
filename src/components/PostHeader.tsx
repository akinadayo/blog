import React from 'react';
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { motion } from "motion/react";
import { PostActions } from "./PostActions";

interface PostHeaderProps {
  title: string;
  category: string;
  date: string;
  tags?: string[];
  slug: string;
}

export function PostHeader({ title, category, date, tags = [], slug }: PostHeaderProps) {
  const readingTime = 5;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-purple-500/10 border-b">
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

          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter mb-8 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {title}
          </h1>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

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
  );
}
