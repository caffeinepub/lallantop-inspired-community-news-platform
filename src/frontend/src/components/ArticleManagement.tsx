import React, { useState } from 'react';
import { useGetArticles, useDeleteArticle, useUpdateArticle, useCreateArticle } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import CategoryBadge from './CategoryBadge';
import { ArticleCategory, type Article } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, CheckCircle, Zap, Star, Pencil, Trash2, X, Plus } from 'lucide-react';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface ArticleFormData {
  title: string;
  titleHindi: string;
  body: string;
  bodyHindi: string;
  category: ArticleCategory;
  author: string;
  authorRole: string;
  imageUrl: string;
  isBreaking: boolean;
  isFeatured: boolean;
}

const defaultFormData: ArticleFormData = {
  title: '', titleHindi: '', body: '', bodyHindi: '',
  category: ArticleCategory.india, author: '', authorRole: '',
  imageUrl: '', isBreaking: false, isFeatured: false,
};

function ArticleForm({
  mode,
  initialData,
  onSuccess,
  onCancel,
}: {
  mode: 'create' | 'edit';
  initialData?: Article;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [form, setForm] = useState<ArticleFormData>(
    initialData
      ? {
          title: initialData.title,
          titleHindi: initialData.titleHindi,
          body: initialData.body,
          bodyHindi: initialData.bodyHindi,
          category: initialData.category,
          author: initialData.author,
          authorRole: initialData.authorRole,
          imageUrl: initialData.imageUrl,
          isBreaking: initialData.isBreaking,
          isFeatured: initialData.isFeatured,
        }
      : defaultFormData
  );

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isPending = createArticle.isPending || updateArticle.isPending;

  const categories = [
    { value: ArticleCategory.india, label: t.categories.india },
    { value: ArticleCategory.world, label: t.categories.world },
    { value: ArticleCategory.sports, label: t.categories.sports },
    { value: ArticleCategory.entertainment, label: t.categories.entertainment },
    { value: ArticleCategory.technology, label: t.categories.technology },
    { value: ArticleCategory.business, label: t.categories.business },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.body || !form.author) {
      setError('Title, body, and author are required.');
      return;
    }
    try {
      if (mode === 'edit' && initialData) {
        await updateArticle.mutateAsync({ id: initialData.id, ...form });
      } else {
        await createArticle.mutateAsync(form);
      }
      setSuccess(true);
      if (mode === 'create') {
        setForm(defaultFormData);
      }
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message || t.common.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded p-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h3 className="font-headline font-black text-base flex items-center gap-2">
          {mode === 'edit' ? (
            <><Pencil size={14} className="text-news-blue" /> Edit Article</>
          ) : (
            <><Plus size={14} className="text-news-blue" /> {t.admin.createArticle}</>
          )}
        </h3>
        {mode === 'edit' && onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="h-7 px-2 text-xs">
            <X size={13} className="mr-1" /> Cancel
          </Button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded p-2 text-sm">
          <CheckCircle size={14} /> {mode === 'edit' ? 'Article updated successfully!' : 'Article published successfully!'}
        </div>
      )}
      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">{t.admin.titleEn} *</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 text-sm" required />
        </div>
        <div>
          <Label className="text-xs">{t.admin.titleHi}</Label>
          <Input value={form.titleHindi} onChange={e => setForm(f => ({ ...f, titleHindi: e.target.value }))} className="mt-1 text-sm font-devanagari" />
        </div>
        <div>
          <Label className="text-xs">{t.admin.author} *</Label>
          <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="mt-1 text-sm" required />
        </div>
        <div>
          <Label className="text-xs">{t.admin.authorRole}</Label>
          <Input value={form.authorRole} onChange={e => setForm(f => ({ ...f, authorRole: e.target.value }))} className="mt-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs">{t.admin.category}</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ArticleCategory }))}>
            <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{t.admin.imageUrl}</Label>
          <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="mt-1 text-sm" type="url" />
        </div>
      </div>

      <div>
        <Label className="text-xs">{t.admin.bodyEn} *</Label>
        <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className="mt-1 text-sm resize-none" rows={4} required />
      </div>
      <div>
        <Label className="text-xs">{t.admin.bodyHi}</Label>
        <Textarea value={form.bodyHindi} onChange={e => setForm(f => ({ ...f, bodyHindi: e.target.value }))} className="mt-1 text-sm resize-none font-devanagari" rows={4} />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.isBreaking} onCheckedChange={v => setForm(f => ({ ...f, isBreaking: v }))} id={`isBreaking-${mode}`} />
          <Label htmlFor={`isBreaking-${mode}`} className="text-xs cursor-pointer">{t.admin.isBreaking}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.isFeatured} onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))} id={`isFeatured-${mode}`} />
          <Label htmlFor={`isFeatured-${mode}`} className="text-xs cursor-pointer">{t.admin.isFeatured}</Label>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="bg-news-red hover:bg-news-darkred text-white">
        {isPending ? (
          <><Loader2 size={14} className="animate-spin mr-2" />{t.common.loading}</>
        ) : mode === 'edit' ? (
          <><CheckCircle size={14} className="mr-2" /> Update Article</>
        ) : (
          t.admin.publish
        )}
      </Button>
    </form>
  );
}

export default function ArticleManagement() {
  const { data: articles = [], isLoading } = useGetArticles();
  const deleteArticle = useDeleteArticle();
  const { t } = useTranslation();

  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteArticle.mutateAsync(id);
    } catch {
      // silently handled — item stays in list if delete fails
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {editingArticle ? (
        <ArticleForm
          mode="edit"
          initialData={editingArticle}
          onSuccess={() => setEditingArticle(null)}
          onCancel={() => setEditingArticle(null)}
        />
      ) : (
        <ArticleForm
          mode="create"
          onSuccess={() => {}}
        />
      )}

      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-news-charcoal px-4 py-2.5 flex items-center justify-between">
          <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
            {t.admin.articleManagement}
          </h3>
          <span className="text-white/60 text-xs">{articles.length} articles</span>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-2">
            {(['sk1', 'sk2', 'sk3', 'sk4', 'sk5'] as const).map(k => <Skeleton key={k} className="h-10 w-full" />)}
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
                  <th className="text-left px-3 py-2 font-bold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map(article => (
                  <tr
                    key={article.id.toString()}
                    className={`hover:bg-muted/30 transition-colors ${editingArticle?.id === article.id ? 'bg-news-blue/5 ring-1 ring-inset ring-news-blue/20' : ''}`}
                  >
                    <td className="px-3 py-2 max-w-[180px]">
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
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingArticle(article)}
                          className="p-1.5 rounded text-muted-foreground hover:text-news-blue hover:bg-news-blue/10 transition-colors"
                          title="Edit article"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(article.id)}
                          disabled={deletingId === article.id}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          title="Delete article"
                        >
                          {deletingId === article.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
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
