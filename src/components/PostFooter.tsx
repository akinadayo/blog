import React from 'react';
import { Button } from "./ui/button";
import { Heart } from "lucide-react";

export function PostFooter() {
  return (
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
          <Button size="lg" className="rounded-full px-8 shadow-lg hover:shadow-xl font-sans">
            記事一覧に戻る
          </Button>
        </a>
      </div>
    </div>
  );
}
