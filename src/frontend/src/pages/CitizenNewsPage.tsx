import React, { useState } from 'react';
import { useGetCitizenPosts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTranslation } from '../hooks/useTranslation';
import { CitizenPostStatus, ArticleCategory } from '../backend';
import CitizenPostCard from '../components/CitizenPostCard';
import SubmitStoryModal from '../components/SubmitStoryModal';
import { Button } from '@/components/ui/button';
import { PenLine, Users } from 'lucide-react';

type FilterType = 'all' | ArticleCategory;

export default function CitizenNewsPage() {
  const { data: posts = [], isLoading } = useGetCitizenPosts();
  const { identity } = useInternetIdentity();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const isAuthenticated = !!identity;

  const approvedPosts = posts.filter(p => p.status === CitizenPostStatus.approved);
  const filteredPosts = filter === 'all'
    ? approvedPosts
    : approvedPosts.filter(p => p.category === filter);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: t.citizen.filterAll },
    { key: ArticleCategory.india, label: t.citizen.filterGovt },
    { key: ArticleCategory.world, label: t.citizen.filterLocal },
    { key: ArticleCategory.sports, label: t.citizen.filterCitizen },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4">
      {/* Header banner */}
      <div className="relative bg-gradient-to-r from-news-charcoal to-news-blue/80 rounded overflow-hidden mb-5 p-6 flex items-center gap-6">
        <img
          src="/assets/generated/citizen-reporter.dim_400x300.png"
          alt="Citizen Reporter"
          className="hidden md:block w-24 h-24 object-contain opacity-80"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-news-blue-light" />
            <span className="text-news-blue-light text-xs font-black uppercase tracking-widest">
              {t.citizen.pageTitle}
            </span>
          </div>
          <h1 className="font-headline font-black text-white text-2xl md:text-3xl mb-1">
            {t.citizen.pageSubtitle}
          </h1>
          <p className="text-white/60 text-sm">
            Share local issues, government problems, and community news with the world.
          </p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => setModalOpen(true)}
            className="shrink-0 bg-news-blue hover:bg-news-blue-dark text-white font-bold gap-2"
          >
            <PenLine size={14} />
            <span className="hidden sm:inline">{t.citizen.submitStory}</span>
          </Button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs font-bold px-3 py-1.5 rounded-sm border transition-colors ${
              filter === key
                ? 'bg-news-blue text-white border-news-blue'
                : 'bg-card text-foreground border-border hover:border-news-blue hover:text-news-blue'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filteredPosts.length} stories</span>
      </div>

      {/* Login prompt for unauthenticated users */}
      {!isAuthenticated && (
        <div className="bg-muted/50 border border-border rounded p-3 mb-4 text-sm text-muted-foreground text-center">
          {t.auth.loginToSubmit}
        </div>
      )}

      {/* Posts grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded h-52" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t.citizen.noPostsFound}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map(post => (
            <CitizenPostCard key={post.id.toString()} post={post} />
          ))}
        </div>
      )}

      {/* Submit story modal */}
      <SubmitStoryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
