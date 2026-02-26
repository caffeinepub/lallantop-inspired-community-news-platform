import React from 'react';
import { Link } from '@tanstack/react-router';
import { Article } from '../backend';
import { useTranslation } from '../hooks/useTranslation';
import ArticleCard from './ArticleCard';
import { ChevronRight, Newspaper } from 'lucide-react';

interface CategorySectionProps {
  categoryKey: string;
  label: string;
  articles: Article[];
  isLoading?: boolean;
}

export default function CategorySection({ categoryKey, label, articles, isLoading }: CategorySectionProps) {
  const { t } = useTranslation();
  const displayArticles = articles.slice(0, 4);

  return (
    <section className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3 border-b-2 border-news-blue pb-1.5">
        <h2 className="font-headline font-black text-base uppercase tracking-wide text-foreground flex items-center gap-2">
          <span className="w-1 h-5 bg-news-blue rounded-full inline-block" />
          {label}
        </h2>
        <Link
          to="/category/$categoryName"
          params={{ categoryName: categoryKey }}
          className="text-[11px] font-bold text-news-blue hover:text-news-blue-dark flex items-center gap-0.5 transition-colors"
        >
          {t.home.viewAll} <ChevronRight size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded h-48" />
          ))}
        </div>
      ) : displayArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded border border-dashed border-border bg-muted/30 text-muted-foreground gap-2">
          <Newspaper size={28} className="opacity-40" />
          <p className="text-sm font-medium">No articles yet in this category</p>
          <p className="text-xs opacity-60">Check back soon for the latest {label} news</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayArticles.map(article => (
            <ArticleCard key={article.id.toString()} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
