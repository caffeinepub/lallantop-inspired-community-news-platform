import React from 'react';
import { useParams } from '@tanstack/react-router';
import { useGetCitizenPosts } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { CitizenPostStatus } from '../backend';
import CategoryBadge from '../components/CategoryBadge';
import CommentsSection from '../components/CommentsSection';
import { Clock, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CitizenPostDetailPage() {
  const { id } = useParams({ from: '/citizen-post/$id' });
  const { data: posts = [], isLoading } = useGetCitizenPosts();
  const { t } = useTranslation();

  const post = posts.find(p => p.id.toString() === id);

  if (isLoading) {
    return (
      <div className="max-w-[900px] mx-auto px-3 py-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-[900px] mx-auto px-3 py-12 text-center">
        <p className="text-muted-foreground">{t.common.noResults}</p>
        <Link to="/citizen-news" className="text-news-red hover:underline text-sm mt-2 inline-block">
          ← Back to Citizen News
        </Link>
      </div>
    );
  }

  const statusBadge = {
    [CitizenPostStatus.pending]: { label: t.citizen.pendingBadge, cls: 'bg-amber-100 text-amber-800' },
    [CitizenPostStatus.approved]: { label: t.citizen.approvedBadge, cls: 'bg-green-100 text-green-800' },
    [CitizenPostStatus.rejected]: { label: t.citizen.rejectedBadge, cls: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="max-w-[900px] mx-auto px-3 py-4">
      {/* Back link */}
      <Link
        to="/citizen-news"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-news-red transition-colors mb-4"
      >
        <ChevronLeft size={13} />
        Back to Citizen News
      </Link>

      <article>
        {/* Category & status */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <CategoryBadge category={post.category} size="md" />
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${statusBadge[post.status]?.cls}`}>
            {statusBadge[post.status]?.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-headline font-black text-2xl md:text-3xl leading-tight mb-3">
          {post.title}
        </h1>

        {/* Author & date */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-3 border-b border-border">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <User size={12} />
            {post.authorName}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={11} />
            {formatDate(post.publishedAt)}
          </span>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="mb-4 rounded overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full max-h-[400px] object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Body */}
        <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
          {post.body.split('\n').map((para, i) => (
            <p key={i} className="mb-3 text-sm leading-relaxed">{para}</p>
          ))}
        </div>

        {/* Comments */}
        <CommentsSection postId={post.id} />
      </article>
    </div>
  );
}
