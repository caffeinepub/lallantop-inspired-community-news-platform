import React, { useState } from 'react';
import { useCreateArticle } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { ArticleCategory } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, CheckCircle } from 'lucide-react';

export default function CreateArticleForm() {
  const { t } = useTranslation();
  const createArticle = useCreateArticle();

  const [form, setForm] = useState({
    title: '', titleHindi: '', body: '', bodyHindi: '',
    category: ArticleCategory.india, author: '', authorRole: '',
    imageUrl: '', isBreaking: false, isFeatured: false,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.body || !form.author) {
      setError('Title, body, and author are required.');
      return;
    }
    try {
      await createArticle.mutateAsync(form);
      setSuccess(true);
      setForm({ title: '', titleHindi: '', body: '', bodyHindi: '', category: ArticleCategory.india, author: '', authorRole: '', imageUrl: '', isBreaking: false, isFeatured: false });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || t.common.error);
    }
  };

  const categories = [
    { value: ArticleCategory.india, label: t.categories.india },
    { value: ArticleCategory.world, label: t.categories.world },
    { value: ArticleCategory.sports, label: t.categories.sports },
    { value: ArticleCategory.entertainment, label: t.categories.entertainment },
    { value: ArticleCategory.technology, label: t.categories.technology },
    { value: ArticleCategory.business, label: t.categories.business },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-card border border-border rounded p-4">
      <h3 className="font-headline font-black text-base border-b border-border pb-2">{t.admin.createArticle}</h3>

      {success && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded p-2 text-sm">
          <CheckCircle size={14} /> Article published successfully!
        </div>
      )}
      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</div>
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
          <Switch checked={form.isBreaking} onCheckedChange={v => setForm(f => ({ ...f, isBreaking: v }))} id="isBreaking" />
          <Label htmlFor="isBreaking" className="text-xs cursor-pointer">{t.admin.isBreaking}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.isFeatured} onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))} id="isFeatured" />
          <Label htmlFor="isFeatured" className="text-xs cursor-pointer">{t.admin.isFeatured}</Label>
        </div>
      </div>

      <Button type="submit" disabled={createArticle.isPending} className="bg-news-red hover:bg-news-darkred text-white">
        {createArticle.isPending ? <><Loader2 size={14} className="animate-spin mr-2" />{t.common.loading}</> : t.admin.publish}
      </Button>
    </form>
  );
}
