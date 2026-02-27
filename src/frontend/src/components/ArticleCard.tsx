import React from 'react';
import { Link } from '@tanstack/react-router';
import { Article } from '../backend';
import { useTranslation } from '../hooks/useTranslation';
import CategoryBadge from './CategoryBadge';
import { Clock } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'compact' | 'featured';
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const { t, language } = useTranslation();
  const title = language === 'hi' ? article.titleHindi : article.title;

  if (variant === 'compact') {
    return (
      <Link
        to="/article/$id"
        params={{ id: article.id.toString() }}
        className="flex gap-2 group hover:bg-muted/50 p-1.5 rounded transition-colors"
      >
        <div className="w-16 h-12 shrink-0 overflow-hidden rounded-sm">
          <img
            src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock size={9} />
            {formatDate(article.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/article/$id"
      params={{ id: article.id.toString() }}
      className="group block bg-card border border-border rounded overflow-hidden hover:shadow-card-hover transition-shadow duration-200"
    >
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={article.imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400';
          }}
        />
        {article.isBreaking && (
          <span className="absolute top-1.5 left-1.5 bg-news-blue text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-sm animate-pulse">
            {t.home.breakingNews}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <CategoryBadge category={article.category} />
        </div>
        <h3 className="font-headline font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
          {title}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="font-medium">{article.author}</span>
          <span className="flex items-center gap-1">
            <Clock size={9} />
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
