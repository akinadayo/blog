import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Calendar } from "lucide-react";
import { motion } from "motion/react";

interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  collection: 'tech' | 'diary';
  coverImage?: string;
  index?: number;
}

export function PostCard({ title, excerpt, date, category, slug, collection, coverImage, index = 0 }: PostCardProps) {
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'tech': return 'bg-accent text-accent-foreground';
      case 'diary': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const href = `/blog/${collection}/${slug}/`;

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <a href={href} className="block h-full">
        <Card
          className="overflow-hidden h-full flex flex-col cursor-pointer group border-2 md:border-4 border-primary hover:border-accent bg-card hover:shadow-[4px_4px_0_0_hsl(50_100%_60%)] md:hover:shadow-[8px_8px_0_0_hsl(50_100%_60%)] transition-all"
        >
          <div className="h-1 md:h-2 bg-primary group-hover:bg-accent transition-colors" />

          <div className="aspect-[16/10] md:aspect-video w-full overflow-hidden bg-muted relative border-b-2 md:border-b-4 border-primary">
            {coverImage ? (
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-2xl md:text-4xl font-display text-accent">{category === 'tech' ? '</>' : ':)'}</span>
              </div>
            )}

            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />

            <div className="absolute top-1.5 left-1.5 md:top-2 md:left-2">
              <div className={`px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-display border md:border-2 border-background ${getCategoryColor(category)}`}>
                {category.toUpperCase()}
              </div>
            </div>
          </div>

          <CardHeader className="p-2 md:p-4 pb-1 md:pb-2">
            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">
              <Calendar size={10} className="md:w-3 md:h-3" />
              <span className="font-medium">{date}</span>
            </div>
            <h3 className="text-xs md:text-sm leading-snug md:leading-relaxed text-foreground group-hover:text-accent transition-colors line-clamp-2 font-semibold">
              {title}
            </h3>
          </CardHeader>

          <CardContent className="p-2 md:p-4 pt-0 flex-grow hidden md:block">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {excerpt}
            </p>
          </CardContent>

          <CardFooter className="p-2 md:p-4 pt-0 mt-auto border-t md:border-t-2 border-primary">
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] md:text-xs text-foreground font-medium font-display">READ</span>
              <span className="text-[10px] md:text-xs text-accent font-display">{'>'}</span>
            </div>
          </CardFooter>

          <div className="h-1 md:h-2 bg-secondary group-hover:bg-accent transition-colors" />
        </Card>
      </a>
    </motion.div>
  );
}
