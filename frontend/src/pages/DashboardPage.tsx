import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useMyProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { UserRole } from '../backend';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ArticleManagement from '../components/ArticleManagement';
import CitizenPostModeration from '../components/CitizenPostModeration';
import UserManagement from '../components/UserManagement';
import PrincipalIdDisplay from '../components/PrincipalIdDisplay';
import {
  ShieldAlert,
  Newspaper,
  Users,
  Loader2,
  PenLine,
  BookOpen,
  UserCircle,
  LayoutDashboard,
} from 'lucide-react';

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    [UserRole.admin]: 'bg-blue-900/80 text-blue-100 border-blue-700',
    [UserRole.user]: 'bg-teal-700/80 text-teal-100 border-teal-500',
    [UserRole.guest]: 'bg-gray-600/80 text-gray-100 border-gray-500',
  };
  const labels: Record<UserRole, string> = {
    [UserRole.admin]: 'Admin',
    [UserRole.user]: 'User',
    [UserRole.guest]: 'Guest',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${styles[role] ?? 'bg-gray-600 text-gray-100 border-gray-500'}`}>
      {labels[role] ?? role}
    </span>
  );
}

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: myProfile, isLoading: profileLoading, isFetched } = useMyProfile();
  const { data: userProfile } = useGetCallerUserProfile();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  React.useEffect(() => {
    if (!isAuthenticated && isFetched) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, isFetched, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-news-blue" />
      </div>
    );
  }

  const role = myProfile?.role;
  const autoId = myProfile?.autoId;

  // ── Unassigned user ──────────────────────────────────────────────────────────
  if (isFetched && !myProfile) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
        <UserCircle size={56} className="mx-auto mb-4 text-news-blue/40" />
        <h1 className="font-headline font-black text-2xl mb-3">{t.nav.dashboard}</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          {t.dashboard.noRoleAssigned}
        </p>
        <p className="text-xs text-muted-foreground/70 mb-4">{t.dashboard.contactAdmin}</p>
        <div className="flex justify-center">
          <PrincipalIdDisplay />
        </div>
      </div>
    );
  }

  // ── Admin view ───────────────────────────────────────────────────────────────
  if (role === UserRole.admin) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-5 border-b-2 border-news-blue pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard size={18} className="text-news-blue" />
              <h1 className="font-headline font-black text-2xl">{t.dashboard.title}</h1>
            </div>
            {userProfile?.name && (
              <p className="text-sm text-muted-foreground">{t.dashboard.welcomeAdmin}, {userProfile.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {autoId && (
              <span className="font-mono text-xs font-bold text-news-blue bg-news-blue/10 border border-news-blue/20 px-2.5 py-1 rounded">
                {autoId}
              </span>
            )}
            <RoleBadge role={UserRole.admin} />
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-5 bg-muted/50 border border-border">
            <TabsTrigger
              value="users"
              className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:bg-news-charcoal data-[state=active]:text-white"
            >
              <Users size={12} />
              {t.dashboard.userManagement}
            </TabsTrigger>
            <TabsTrigger
              value="articles"
              className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:bg-news-charcoal data-[state=active]:text-white"
            >
              <Newspaper size={12} />
              {t.admin.articleManagement}
            </TabsTrigger>
            <TabsTrigger
              value="moderation"
              className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:bg-news-charcoal data-[state=active]:text-white"
            >
              <ShieldAlert size={12} />
              {t.admin.postModeration}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
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

  // ── Writer / User view ───────────────────────────────────────────────────────
  if (role === UserRole.user) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-5 border-b-2 border-news-blue pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PenLine size={18} className="text-news-blue" />
              <h1 className="font-headline font-black text-2xl">{t.dashboard.writerEditorView}</h1>
            </div>
            {userProfile?.name && (
              <p className="text-sm text-muted-foreground">{t.dashboard.welcomeWriter}, {userProfile.name}</p>
            )}
            <p className="text-xs text-muted-foreground/70 mt-0.5">{t.dashboard.writerDesc}</p>
          </div>
          <div className="flex items-center gap-2">
            {autoId && (
              <span className="font-mono text-xs font-bold text-teal-600 bg-teal-600/10 border border-teal-600/20 px-2.5 py-1 rounded">
                {autoId}
              </span>
            )}
            <RoleBadge role={UserRole.user} />
          </div>
        </div>
        <ArticleManagement />
      </div>
    );
  }

  // ── Guest / Publisher view ───────────────────────────────────────────────────
  if (role === UserRole.guest) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 py-4">
        <div className="flex items-center justify-between mb-5 border-b-2 border-news-blue pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={18} className="text-news-blue" />
              <h1 className="font-headline font-black text-2xl">{t.dashboard.publisherView}</h1>
            </div>
            {userProfile?.name && (
              <p className="text-sm text-muted-foreground">{t.dashboard.welcomePublisher}, {userProfile.name}</p>
            )}
            <p className="text-xs text-muted-foreground/70 mt-0.5">{t.dashboard.publisherDesc}</p>
          </div>
          <div className="flex items-center gap-2">
            {autoId && (
              <span className="font-mono text-xs font-bold text-gray-500 bg-gray-500/10 border border-gray-500/20 px-2.5 py-1 rounded">
                {autoId}
              </span>
            )}
            <RoleBadge role={UserRole.guest} />
          </div>
        </div>
        <CitizenPostModeration />
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4 space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
