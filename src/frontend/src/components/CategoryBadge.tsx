import React from 'react';
import { ArticleCategory } from '../backend';
import { useTranslation } from '../hooks/useTranslation';

interface CategoryBadgeProps {
  category: ArticleCategory | string;
  size?: 'sm' | 'md';
  className?: string;
}

const categoryStyles: Record<string, string> = {
  india: 'bg-news-blue text-white',
  world: 'bg-news-charcoal text-white',
  sports: 'bg-cyan-700 text-white',
  entertainment: 'bg-indigo-600 text-white',
  technology: 'bg-sky-600 text-white',
  business: 'bg-news-blue-dark text-white',
  citizenReports: 'bg-news-blue-light text-white',
  government: 'bg-news-charcoal text-white',
  local: 'bg-sky-700 text-white',
};

export default function CategoryBadge({ category, size = 'sm', className = '' }: CategoryBadgeProps) {
  const { t } = useTranslation();

  const catKey = typeof category === 'string' ? category : category;
  const style = categoryStyles[catKey] || 'bg-news-blue text-white';

  const labelMap: Record<string, string> = {
    india: t.categories.india,
    world: t.categories.world,
    sports: t.categories.sports,
    entertainment: t.categories.entertainment,
    technology: t.categories.technology,
    business: t.categories.business,
    citizenReports: t.categories.citizenReports,
  };

  const label = labelMap[catKey] || catKey;

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-1';

  return (
    <span className={`inline-block font-bold uppercase tracking-wide rounded-sm ${style} ${sizeClass} ${className}`}>
      {label}
    </span>
  );
}
