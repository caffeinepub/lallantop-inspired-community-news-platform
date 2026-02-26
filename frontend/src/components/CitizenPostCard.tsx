import React from 'react';
import { Link } from '@tanstack/react-router';
import { CitizenPost, CitizenPostStatus } from '../backend';
import { useTranslation } from '../hooks/useTranslation';
import CategoryBadge from './CategoryBadge';
import { Clock, User } from 'lucide-react';

interface CitizenPostCardProps {
  post: CitizenPost;
  showStatus?: boolean;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CitizenPostCard({ post, showStatus = false }: CitizenPostCardProps) {
  const { t } = useTranslation();

  const statusBadge = {
    [CitizenPostStatus.pending]: { label: t.citizen.pendingBadge, cls: 'bg-amber-100 text-amber-800' },
    [CitizenPostStatus.approved]: { label: t.citizen.approvedBadge, cls: 'bg-green-100 text-green-800' },
    [CitizenPostStatus.rejected]: { label: t.citizen.rejectedBadge, cls: 'bg-red-100 text-red-800' },
  };

  return (
    <Link
      to="/citizen-post/$id"
      params={{ id: post.id.toString() }}
      className="group block bg-card border border-border rounded overflow-hidden hover:shadow-card-hover transition-shadow duration-200"
    >
      {post.imageUrl && (
        <div className="relative overflow-hidden aspect-[16/9]">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      {!post.imageUrl && (
        <div className="aspect-[16/9] bg-gradient-to-br from-news-blue/20 to-news-charcoal/10 flex items-center justify-center">
          <User size={32} className="text-news-blue/40" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <CategoryBadge category={post.category} />
          {showStatus && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${statusBadge[post.status]?.cls}`}>
              {statusBadge[post.status]?.label}
            </span>
          )}
        </div>
        <h3 className="font-headline font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {post.title}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1 font-medium">
            <User size={9} />
            {post.authorName}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={9} />
            {formatDate(post.publishedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
