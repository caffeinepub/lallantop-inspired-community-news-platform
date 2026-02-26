import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin, useGetCallerUserProfile } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ArticleManagement from '../components/ArticleManagement';
import CitizenPostModeration from '../components/CitizenPostModeration';
import { ShieldAlert, Newspaper, Users, Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: profile } = useGetCallerUserProfile();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated && !adminLoading) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, adminLoading, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-news-blue" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-[600px] mx-auto px-3 py-16 text-center">
        <ShieldAlert size={48} className="mx-auto mb-4 text-news-blue opacity-60" />
        <h1 className="font-headline font-black text-2xl mb-2">{t.admin.noAccess}</h1>
        <p className="text-muted-foreground text-sm">{t.admin.noAccessMsg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b-2 border-news-blue pb-3">
        <div>
          <h1 className="font-headline font-black text-2xl">{t.admin.dashboard}</h1>
          {profile?.name && (
            <p className="text-sm text-muted-foreground mt-0.5">Welcome, {profile.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-news-blue bg-news-blue/10 border border-news-blue/20 px-3 py-1.5 rounded">
          <ShieldAlert size={13} />
          Admin
        </div>
      </div>

      <Tabs defaultValue="articles">
        <TabsList className="mb-5 bg-muted/50 border border-border">
          <TabsTrigger value="articles" className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:bg-news-charcoal data-[state=active]:text-white">
            <Newspaper size={12} />
            {t.admin.articleManagement}
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:bg-news-charcoal data-[state=active]:text-white">
            <Users size={12} />
            {t.admin.postModeration}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <ArticleManagement />
        </TabsContent>

        <TabsContent value="moderation">
          <CitizenPostModeration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
