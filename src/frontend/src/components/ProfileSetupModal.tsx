import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { Loader2 } from 'lucide-react';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const { t } = useTranslation();
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await saveProfile.mutateAsync({ name: name.trim(), bio: '', avatarUrl: '' });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">{t.profile.setupTitle}</DialogTitle>
          <DialogDescription>{t.profile.setupSubtitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="name">{t.profile.nameLabel}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.profile.namePlaceholder}
              className="mt-1"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full bg-news-red hover:bg-news-darkred text-white"
          >
            {saveProfile.isPending ? (
              <><Loader2 size={14} className="animate-spin mr-2" />{t.common.loading}</>
            ) : t.profile.saveBtn}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
