import React from 'react';
import { Link } from '@tanstack/react-router';
import { Article } from '../backend';
import { useTranslation } from '../hooks/useTranslation';
import { Zap, Clock, Newspaper } from 'lucide-react';

interface FeaturedHeroProps {
  article: Article | null;
  isLoading?: boolean;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function FeaturedHero({ article, isLoading }: FeaturedHeroProps) {
  const { t, language } = useTranslation();

  if (isLoading) {
    return (
      <div className="relative w-full h-[320px] md:h-[420px] bg-muted animate-pulse rounded overflow-hidden" />
    );
  }

  if (!article) {
    return (
      <div className="relative w-full h-[280px] md:h-[400px] rounded overflow-hidden bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground border border-dashed border-border">
        <Newspaper size={40} className="opacity-30" />
        <p className="text-base font-semibold opacity-60">No featured articles yet</p>
        <p className="text-xs opacity-40">Articles will appear here once published</p>
      </div>
    );
  }

  const title = language === 'hi' ? article.titleHindi : article.title;
  const body = language === 'hi' ? article.bodyHindi : article.body;

  return (
    <Link
      to="/article/$id"
      params={{ id: article.id.toString() }}
      className="group relative block w-full h-[280px] md:h-[400px] overflow-hidden rounded"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{
          backgroundImage: `url(${article.imageUrl || '/assets/generated/hero-banner.dim_1400x500.png'})`,
        }}
      />
      {/* Fallback hero banner */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/assets/generated/hero-banner.dim_1400x500.png')`, zIndex: -1 }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          {article.isBreaking && (
            <span className="flex items-center gap-1 bg-news-blue text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-sm">
              <Zap size={9} className="fill-white" />
              {t.home.breakingNews}
            </span>
          )}
          <span className="text-white/70 text-[10px] font-semibold uppercase tracking-wide">
            {article.category}
          </span>
        </div>
        <h1 className="font-headline font-black text-white text-xl md:text-3xl leading-tight mb-2 line-clamp-3 group-hover:text-news-blue-light transition-colors">
          {title}
        </h1>
        <p className="text-white/70 text-xs md:text-sm line-clamp-2 mb-3 hidden md:block">
          {body.substring(0, 180)}...
        </p>
        <div className="flex items-center gap-3 text-white/60 text-[11px]">
          <span className="font-semibold text-white/80">{article.author}</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {formatDate(article.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
