import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCitizenPost, useGetCallerUserProfile } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { ArticleCategory } from '../backend';
import { Loader2, CheckCircle } from 'lucide-react';

interface SubmitStoryModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SubmitStoryModal({ open, onClose }: SubmitStoryModalProps) {
  const { t } = useTranslation();
  const { data: profile } = useGetCallerUserProfile();
  const createPost = useCreateCitizenPost();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<ArticleCategory>(ArticleCategory.india);
  const [imageUrl, setImageUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !profile?.name) return;
    await createPost.mutateAsync({
      title: title.trim(),
      body: body.trim(),
      category,
      authorName: profile.name,
      imageUrl: imageUrl.trim(),
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setBody('');
      setImageUrl('');
      onClose();
    }, 2000);
  };

  const categoryOptions = [
    { value: ArticleCategory.india, label: t.citizen.filterGovt },
    { value: ArticleCategory.world, label: t.citizen.filterLocal },
    { value: ArticleCategory.sports, label: t.citizen.filterCitizen },
    { value: ArticleCategory.entertainment, label: 'Entertainment' },
    { value: ArticleCategory.technology, label: 'Technology' },
    { value: ArticleCategory.business, label: 'Business' },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">{t.citizen.submitStory}</DialogTitle>
          <DialogDescription>{t.citizen.pageSubtitle}</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <CheckCircle size={48} className="text-green-500" />
            <p className="text-sm font-semibold text-center">{t.citizen.successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="story-title">{t.citizen.titleLabel} *</Label>
              <Input
                id="story-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your story title..."
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="story-body">{t.citizen.bodyLabel} *</Label>
              <Textarea
                id="story-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your story here..."
                className="mt-1 resize-none"
                rows={6}
                required
              />
            </div>
            <div>
              <Label htmlFor="story-category">{t.citizen.categoryLabel}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ArticleCategory)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="story-image">{t.citizen.imageUrlLabel}</Label>
              <Input
                id="story-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
                type="url"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                disabled={!title.trim() || !body.trim() || createPost.isPending}
                className="flex-1 bg-news-red hover:bg-news-darkred text-white"
              >
                {createPost.isPending ? (
                  <><Loader2 size={14} className="animate-spin mr-2" />{t.common.loading}</>
                ) : t.citizen.submitBtn}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {t.citizen.cancelBtn}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
