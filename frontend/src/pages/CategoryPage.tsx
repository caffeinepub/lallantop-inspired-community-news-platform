import React, { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetArticlesByCategory } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { ArticleCategory } from '../backend';
import ArticleCard from '../components/ArticleCard';
import CategoryBadge from '../components/CategoryBadge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ARTICLES_PER_PAGE = 12;

const categoryMap: Record<string, ArticleCategory> = {
  india: ArticleCategory.india,
  world: ArticleCategory.world,
  sports: ArticleCategory.sports,
  entertainment: ArticleCategory.entertainment,
  technology: ArticleCategory.technology,
  business: ArticleCategory.business,
};

export default function CategoryPage() {
  const { categoryName } = useParams({ from: '/category/$categoryName' });
  const { t } = useTranslation();
  const [page, setPage] = useState(0);

  const category = categoryMap[categoryName] ?? ArticleCategory.india;
  const { data: articles = [], isLoading } = useGetArticlesByCategory(category);

  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const pageArticles = articles.slice(page * ARTICLES_PER_PAGE, (page + 1) * ARTICLES_PER_PAGE);

  const labelMap: Record<string, string> = {
    india: t.categories.india,
    world: t.categories.world,
    sports: t.categories.sports,
    entertainment: t.categories.entertainment,
    technology: t.categories.technology,
    business: t.categories.business,
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 border-b-2 border-news-blue pb-3">
        <CategoryBadge category={category} size="md" />
        <h1 className="font-headline font-black text-2xl">{labelMap[categoryName] || categoryName}</h1>
        <span className="text-sm text-muted-foreground ml-auto">{articles.length} articles</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded h-52" />
          ))}
        </div>
      ) : pageArticles.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t.common.noResults}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {pageArticles.map(article => (
              <ArticleCard key={article.id.toString()} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
