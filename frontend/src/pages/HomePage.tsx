import React from 'react';
import { useGetFeaturedArticles, useGetArticlesByCategory, useGetArticles } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { ArticleCategory } from '../backend';
import FeaturedHero from '../components/FeaturedHero';
import CategorySection from '../components/CategorySection';
import Sidebar from '../components/Sidebar';

const CATEGORIES: { key: ArticleCategory; labelKey: keyof ReturnType<typeof useTranslation>['t']['categories'] }[] = [
  { key: ArticleCategory.india, labelKey: 'india' },
  { key: ArticleCategory.world, labelKey: 'world' },
  { key: ArticleCategory.sports, labelKey: 'sports' },
  { key: ArticleCategory.entertainment, labelKey: 'entertainment' },
  { key: ArticleCategory.technology, labelKey: 'technology' },
  { key: ArticleCategory.business, labelKey: 'business' },
];

function CategoryLoader({ categoryKey, label }: { categoryKey: ArticleCategory; label: string }) {
  const { data: articles = [], isLoading } = useGetArticlesByCategory(categoryKey);
  return <CategorySection categoryKey={categoryKey} label={label} articles={articles} isLoading={isLoading} />;
}

export default function HomePage() {
  const { data: featured = [], isLoading: featuredLoading } = useGetFeaturedArticles();
  const { data: allArticles = [], isLoading: allLoading } = useGetArticles();
  const { t } = useTranslation();

  // Use first featured article; fall back to most recently published article overall
  const topFeatured = featured[0] ?? (
    allArticles.length > 0
      ? [...allArticles].sort((a, b) => Number(b.publishedAt) - Number(a.publishedAt))[0]
      : null
  );

  const heroLoading = featuredLoading || allLoading;

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4">
      {/* Hero + Sidebar row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 mb-6">
        <FeaturedHero article={topFeatured} isLoading={heroLoading} />
        <Sidebar />
      </div>

      {/* Category sections */}
      <div>
        {CATEGORIES.map(({ key, labelKey }) => (
          <CategoryLoader key={key} categoryKey={key} label={t.categories[labelKey]} />
        ))}
      </div>
    </div>
  );
}
