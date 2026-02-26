import React from 'react';
import { useGetArticles } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import CreateArticleForm from './CreateArticleForm';
import CategoryBadge from './CategoryBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Star } from 'lucide-react';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ArticleManagement() {
  const { data: articles = [], isLoading } = useGetArticles();
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      <CreateArticleForm />

      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-news-charcoal px-4 py-2.5 flex items-center justify-between">
          <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
            {t.admin.articleManagement}
          </h3>
          <span className="text-white/60 text-xs">{articles.length} articles</span>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">Title</th>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">Category</th>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">Author</th>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">Date</th>
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map(article => (
                  <tr key={article.id.toString()} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2 max-w-[200px]">
                      <span className="font-semibold line-clamp-1">{article.title}</span>
                    </td>
                    <td className="px-3 py-2">
                      <CategoryBadge category={article.category} />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{article.author}</td>
                    <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{formatDate(article.publishedAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {article.isBreaking && (
                          <span title="Breaking">
                            <Zap size={11} className="text-news-red fill-news-red" />
                          </span>
                        )}
                        {article.isFeatured && (
                          <span title="Featured">
                            <Star size={11} className="text-news-saffron fill-news-saffron" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
