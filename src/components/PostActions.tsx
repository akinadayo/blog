import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Heart, Share2, Bookmark, Check } from "lucide-react";

interface PostActionsProps {
  slug: string;
  title: string;
}

export function PostActions({ slug, title }: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // localStorageから状態を読み込む
  useEffect(() => {
    const likes = JSON.parse(localStorage.getItem('post-likes') || '[]');
    const bookmarks = JSON.parse(localStorage.getItem('post-bookmarks') || '[]');
    setIsLiked(likes.includes(slug));
    setIsBookmarked(bookmarks.includes(slug));
  }, [slug]);

  const handleLike = () => {
    const likes = JSON.parse(localStorage.getItem('post-likes') || '[]');
    if (isLiked) {
      const newLikes = likes.filter((s: string) => s !== slug);
      localStorage.setItem('post-likes', JSON.stringify(newLikes));
      setIsLiked(false);
    } else {
      likes.push(slug);
      localStorage.setItem('post-likes', JSON.stringify(likes));
      setIsLiked(true);
    }
  };

  const handleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('post-bookmarks') || '[]');
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter((s: string) => s !== slug);
      localStorage.setItem('post-bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
    } else {
      bookmarks.push(slug);
      localStorage.setItem('post-bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    // Web Share APIが使える場合（主にモバイル）
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
        return;
      } catch {
        // ユーザーがキャンセルした場合は何もしない
        return;
      }
    }

    // クリップボードにコピー
    const copyToClipboard = (text: string): boolean => {
      // 新しいClipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
        }).catch(() => {
          // 失敗したらフォールバック
          fallbackCopy(text);
        });
        return true;
      }
      return false;
    };

    // フォールバック: 古い方法
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch {
        alert('URLをコピーできませんでした: ' + text);
      }

      document.body.removeChild(textArea);
    };

    if (!copyToClipboard(url)) {
      fallbackCopy(url);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full transition-all ${
          isLiked
            ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30'
            : 'hover:bg-primary/10 hover:text-primary hover:border-primary/50'
        }`}
        onClick={handleLike}
      >
        <Heart size={18} className={isLiked ? 'fill-current' : ''} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full transition-all ${
          isBookmarked
            ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/30'
            : 'hover:bg-primary/10 hover:text-primary hover:border-primary/50'
        }`}
        onClick={handleBookmark}
      >
        <Bookmark size={18} className={isBookmarked ? 'fill-current' : ''} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full transition-all ${
          showCopied
            ? 'bg-green-500/20 text-green-500 border-green-500/50'
            : 'hover:bg-primary/10 hover:text-primary hover:border-primary/50'
        }`}
        onClick={handleShare}
      >
        {showCopied ? <Check size={18} /> : <Share2 size={18} />}
      </Button>
    </div>
  );
}
