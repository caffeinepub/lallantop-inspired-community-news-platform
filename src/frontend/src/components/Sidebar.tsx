import React from 'react';
import { useGetArticles, useGetCitizenPosts } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import ArticleCard from './ArticleCard';
import { Link } from '@tanstack/react-router';
import { TrendingUp, Users, Clock } from 'lucide-react';
import { CitizenPostStatus } from '../backend';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Sidebar() {
  const { data: articles = [] } = useGetArticles();
  const { data: citizenPosts = [] } = useGetCitizenPosts();
  const { t, language } = useTranslation();

  const mostRead = articles.slice(0, 5);
  const approvedPosts = citizenPosts
    .filter(p => p.status === CitizenPostStatus.approved)
    .slice(0, 3);

  return (
    <aside className="space-y-5">
      {/* Most Read */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-news-charcoal px-3 py-2 flex items-center gap-2">
          <TrendingUp size={13} className="text-news-saffron" />
          <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
            {t.home.mostRead}
          </h3>
        </div>
        <div className="divide-y divide-border">
          {mostRead.map((article, idx) => (
            <Link
              key={article.id.toString()}
              to="/article/$id"
              params={{ id: article.id.toString() }}
              className="flex items-start gap-2.5 p-2.5 hover:bg-muted/50 transition-colors group"
            >
              <span className="text-2xl font-black text-muted-foreground/30 leading-none w-6 flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {language === 'hi' ? article.titleHindi : article.title}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{article.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Citizen Spotlight */}
      {approvedPosts.length > 0 && (
        <div className="bg-card border border-border rounded overflow-hidden">
          <div className="bg-news-saffron px-3 py-2 flex items-center gap-2">
            <Users size={13} className="text-white" />
            <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
              {t.home.citizenSpotlight}
            </h3>
          </div>
          <div className="divide-y divide-border">
            {approvedPosts.map(post => (
              <Link
                key={post.id.toString()}
                to="/citizen-post/$id"
                params={{ id: post.id.toString() }}
                className="block p-2.5 hover:bg-muted/50 transition-colors group"
              >
                <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {post.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="font-medium">{post.authorName}</span>
                  <span className="flex items-center gap-0.5">
                    <Clock size={9} />
                    {formatDate(post.publishedAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="p-2 border-t border-border">
            <Link
              to="/citizen-news"
              className="text-[11px] font-bold text-news-red hover:text-news-darkred transition-colors"
            >
              {t.home.viewAll} →
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
