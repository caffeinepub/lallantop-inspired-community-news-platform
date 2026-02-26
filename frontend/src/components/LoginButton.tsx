import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { LogIn, LogOut, User } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const { t } = useTranslation();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  if (isAuthenticated) {
    return (
      <button
        onClick={handleAuth}
        className="flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
      >
        <User size={13} />
        <span className="hidden sm:inline max-w-[80px] truncate">
          {profile?.name || t.auth.logout}
        </span>
        <LogOut size={11} className="opacity-70" />
      </button>
    );
  }

  return (
    <button
      onClick={handleAuth}
      disabled={isLoggingIn}
      className="flex items-center gap-1.5 text-xs font-bold bg-news-blue hover:bg-news-blue-dark text-white px-3 py-1.5 rounded transition-colors disabled:opacity-60"
    >
      <LogIn size={13} />
      <span>{isLoggingIn ? t.auth.loggingIn : t.auth.login}</span>
    </button>
  );
}
