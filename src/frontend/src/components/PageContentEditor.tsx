import React, { useState, useEffect } from 'react';
import { useGetPageContent, useSavePageContent } from '../hooks/useQueries';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, CheckCircle, AlertCircle, FileEdit, Shield, FileText, User } from 'lucide-react';

const PAGE_KEYS = ['about', 'privacy', 'terms'] as const;
type PageKey = typeof PAGE_KEYS[number];

const PAGE_CONFIG: Record<PageKey, {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  description: string;
}> = {
  about: {
    label: 'About Us',
    icon: <User size={12} />,
    placeholder: 'Enter the About Us page content here...',
    description: 'This content will appear on the public About Us page, replacing the default bio text.',
  },
  privacy: {
    label: 'Privacy Policy',
    icon: <Shield size={12} />,
    placeholder: 'Enter the Privacy Policy content here...',
    description: 'This content will appear on the public Privacy Policy page, replacing the default sections.',
  },
  terms: {
    label: 'Terms of Service',
    icon: <FileText size={12} />,
    placeholder: 'Enter the Terms of Service content here...',
    description: 'This content will appear on the public Terms of Service page, replacing the default sections.',
  },
};

function PageEditor({ pageKey }: { pageKey: PageKey }) {
  const { data: savedContent, isLoading } = useGetPageContent(pageKey);
  const saveContent = useSavePageContent();
  const config = PAGE_CONFIG[pageKey];

  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Sync textarea when backend content loads
  useEffect(() => {
    if (savedContent !== undefined && savedContent !== null) {
      setContent(savedContent);
      setIsDirty(false);
    }
  }, [savedContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
    setSaveSuccess(false);
    setSaveError('');
  };

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess(false);
    try {
      await saveContent.mutateAsync({ key: pageKey, content });
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setSaveError((err as Error).message || 'Failed to save content. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-1">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-9 w-32" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Description note */}
      <div className="flex items-start gap-2 bg-news-blue/5 border border-news-blue/20 rounded p-3">
        <FileEdit size={13} className="text-news-blue mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">{config.description}</p>
      </div>

      {/* Feedback */}
      {saveSuccess && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded p-2.5 text-sm">
          <CheckCircle size={14} /> Changes saved successfully!
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded p-2.5 text-sm">
          <AlertCircle size={14} /> {saveError}
        </div>
      )}

      <div>
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
          Page Content
        </Label>
        <Textarea
          value={content}
          onChange={handleChange}
          placeholder={config.placeholder}
          className="mt-1.5 text-sm font-mono leading-relaxed resize-y min-h-[400px]"
          rows={22}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {content.length} characters
          {isDirty && <span className="text-amber-600 ml-2">— unsaved changes</span>}
        </p>
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={saveContent.isPending || !isDirty}
        className="bg-news-blue hover:bg-news-blue-dark text-white"
      >
        {saveContent.isPending ? (
          <><Loader2 size={14} className="animate-spin mr-2" /> Saving...</>
        ) : (
          <><CheckCircle size={14} className="mr-2" /> Save Changes</>
        )}
      </Button>
    </div>
  );
}

export default function PageContentEditor() {
  return (
    <div className="bg-card border border-border rounded overflow-hidden">
      <div className="bg-news-charcoal px-4 py-2.5 flex items-center gap-2">
        <FileEdit size={13} className="text-white/60" />
        <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
          Page Content Editor
        </h3>
      </div>

      <div className="p-4">
        <Tabs defaultValue="about">
          <TabsList className="mb-5 bg-muted/50 border border-border">
            {PAGE_KEYS.map(key => {
              const config = PAGE_CONFIG[key];
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:bg-news-charcoal data-[state=active]:text-white"
                >
                  {config.icon}
                  {config.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {PAGE_KEYS.map(key => (
            <TabsContent key={key} value={key}>
              <PageEditor pageKey={key} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
