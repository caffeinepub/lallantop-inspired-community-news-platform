import React from 'react';
import { Article, ArticleCategory } from '../backend';
import { useTranslation } from '../hooks/useTranslation';
import ArticleCard from './ArticleCard';

interface RelatedArticlesProps {
  currentArticleId: bigint;
  category: ArticleCategory;
  articles: Article[];
}

export default function RelatedArticles({ currentArticleId, category, articles }: RelatedArticlesProps) {
  const { t } = useTranslation();

  const related = articles
    .filter(a => a.category === category && a.id !== currentArticleId)
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3 border-b-2 border-news-red pb-1.5">
        <h3 className="font-headline font-black text-sm uppercase tracking-wide">
          {t.article.relatedArticles}
        </h3>
      </div>
      <div className="space-y-2">
        {related.map(article => (
          <ArticleCard key={article.id.toString()} article={article} variant="compact" />
        ))}
      </div>
    </div>
  );
}
