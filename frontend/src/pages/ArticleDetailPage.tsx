import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetArticles } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import CategoryBadge from '../components/CategoryBadge';
import CommentsSection from '../components/CommentsSection';
import RelatedArticles from '../components/RelatedArticles';
import { Clock, User, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ArticleDetailPage() {
  const { id } = useParams({ from: '/article/$id' });
  const { data: articles = [], isLoading } = useGetArticles();
  const { t, language } = useTranslation();

  const article = articles.find(a => a.id.toString() === id);

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 py-12 text-center">
        <p className="text-muted-foreground">{t.common.noResults}</p>
      </div>
    );
  }

  const title = language === 'hi' ? article.titleHindi : article.title;
  const body = language === 'hi' ? article.bodyHindi : article.body;

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <article>
          {/* Category & meta */}
          <div className="flex items-center gap-2 mb-3">
            <CategoryBadge category={article.category} size="md" />
            {article.isBreaking && (
              <span className="text-[10px] font-black uppercase bg-news-red text-white px-2 py-0.5 rounded-sm animate-pulse">
                {t.home.breakingNews}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-headline font-black text-2xl md:text-3xl leading-tight mb-3">
            {title}
          </h1>

          {/* Author & date */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-3 border-b border-border">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <User size={12} />
              {article.author}
            </span>
            {article.authorRole && (
              <span className="flex items-center gap-1">
                <Briefcase size={11} />
                {article.authorRole}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Clock size={11} />
              {formatDate(article.publishedAt)}
            </span>
          </div>

          {/* Hero image */}
          {article.imageUrl && (
            <div className="mb-4 rounded overflow-hidden">
              <img
                src={article.imageUrl}
                alt={title}
                className="w-full max-h-[400px] object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          {/* Body */}
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
            {body.split('\n').map((para, i) => (
              <p key={i} className="mb-3 text-sm leading-relaxed">{para}</p>
            ))}
          </div>

          {/* Comments */}
          <CommentsSection articleId={article.id} />
        </article>

        {/* Sidebar */}
        <aside>
          <RelatedArticles
            currentArticleId={article.id}
            category={article.category}
            articles={articles}
          />
        </aside>
      </div>
    </div>
  );
}
