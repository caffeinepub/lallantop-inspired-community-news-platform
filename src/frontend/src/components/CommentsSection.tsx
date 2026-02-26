import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCommentsByArticle, useAddComment, useGetCallerUserProfile } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Loader2, User } from 'lucide-react';

interface CommentsSectionProps {
  articleId?: bigint;
  postId?: bigint;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CommentsSection({ articleId, postId }: CommentsSectionProps) {
  const { identity } = useInternetIdentity();
  const { data: profile } = useGetCallerUserProfile();
  const { t } = useTranslation();
  const [body, setBody] = useState('');

  const effectiveArticleId = articleId ?? BigInt(0);
  const { data: comments = [], isLoading } = useGetCommentsByArticle(effectiveArticleId);
  const addComment = useAddComment();

  const isAuthenticated = !!identity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !profile?.name) return;
    await addComment.mutateAsync({
      articleId: articleId ?? null,
      postId: postId ?? null,
      authorName: profile.name,
      body: body.trim(),
    });
    setBody('');
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4 border-b-2 border-news-red pb-2">
        <MessageSquare size={16} className="text-news-red" />
        <h3 className="font-headline font-black text-base uppercase tracking-wide">
          {t.article.comments} {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-5">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.article.commentPlaceholder}
            className="mb-2 text-sm resize-none"
            rows={3}
          />
          <Button
            type="submit"
            disabled={!body.trim() || addComment.isPending || !profile?.name}
            className="bg-news-red hover:bg-news-darkred text-white text-xs"
            size="sm"
          >
            {addComment.isPending ? (
              <><Loader2 size={12} className="animate-spin mr-1.5" />{t.common.loading}</>
            ) : t.article.postComment}
          </Button>
        </form>
      ) : (
        <div className="bg-muted/50 border border-border rounded p-3 mb-5 text-sm text-muted-foreground text-center">
          {t.auth.loginToComment}
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded h-16" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">{t.article.noComments}</p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id.toString()} className="bg-muted/30 border border-border rounded p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-news-red/20 flex items-center justify-center">
                  <User size={12} className="text-news-red" />
                </div>
                <span className="text-xs font-bold">{comment.authorName}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
