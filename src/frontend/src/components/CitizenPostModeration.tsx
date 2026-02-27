import React, { useState } from 'react';
import { useGetCitizenPosts, useUpdateCitizenPostStatus } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { CitizenPostStatus } from '../backend';
import CategoryBadge from './CategoryBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CitizenPostModeration() {
  const { data: posts = [], isLoading } = useGetCitizenPosts();
  const { t } = useTranslation();
  const updateStatus = useUpdateCitizenPostStatus();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingPosts = posts.filter(p => p.status === CitizenPostStatus.pending);
  const allPosts = posts;

  const handleStatus = async (postId: bigint, status: CitizenPostStatus) => {
    setProcessingId(postId.toString());
    try {
      await updateStatus.mutateAsync({ postId, status });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded overflow-hidden">
      <div className="bg-news-charcoal px-4 py-2.5 flex items-center justify-between">
        <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
          {t.admin.postModeration}
        </h3>
        <span className="text-white/60 text-xs">{pendingPosts.length} pending</span>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : allPosts.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t.common.noResults}</p>
      ) : (
        <div className="divide-y divide-border">
          {allPosts.map(post => {
            const isProcessing = processingId === post.id.toString();
            return (
              <div key={post.id.toString()} className="p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <CategoryBadge category={post.category} />
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                      post.status === CitizenPostStatus.pending ? 'bg-amber-100 text-amber-800' :
                      post.status === CitizenPostStatus.approved ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {post.status === CitizenPostStatus.pending ? t.admin.pending :
                       post.status === CitizenPostStatus.approved ? t.citizen.approvedBadge :
                       t.citizen.rejectedBadge}
                    </span>
                  </div>
                  <p className="text-xs font-semibold line-clamp-1">{post.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {post.authorName} · {formatDate(post.publishedAt)}
                  </p>
                </div>
                {post.status === CitizenPostStatus.pending && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] border-green-500 text-green-600 hover:bg-green-50 px-2"
                      onClick={() => handleStatus(post.id, CitizenPostStatus.approved)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <><CheckCircle size={10} className="mr-1" />{t.admin.approve}</>}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] border-red-400 text-red-600 hover:bg-red-50 px-2"
                      onClick={() => handleStatus(post.id, CitizenPostStatus.rejected)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <><XCircle size={10} className="mr-1" />{t.admin.reject}</>}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
