import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { LogIn, LogOut, User, Loader2, AlertCircle } from 'lucide-react';

export default function LoginButton() {
  const {
    login,
    clear,
    identity,
    isInitializing,
    isLoggingIn,
    isLoginError,
    loginError,
  } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const { t } = useTranslation();

  const isAuthenticated = !!identity;

  const handleAuth = () => {
    if (isAuthenticated) {
      clear();
      queryClient.clear();
    } else {
      login();
    }
  };

  // Already authenticated — show logout button
  if (isAuthenticated) {
    return (
      <button
        type="button"
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

  // Initializing auth client — show disabled loading state
  if (isInitializing) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-1.5 text-xs font-bold bg-news-blue/50 text-white px-3 py-1.5 rounded opacity-60 cursor-not-allowed"
      >
        <Loader2 size={13} className="animate-spin" />
        <span className="hidden sm:inline">{t.common.loading}</span>
      </button>
    );
  }

  // Login error: "User is already authenticated" is a false positive from session restore —
  // the session is actually valid so show logout instead
  if (isLoginError && loginError?.message === 'User is already authenticated') {
    return (
      <button
        type="button"
        onClick={() => { clear(); queryClient.clear(); }}
        className="flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
      >
        <User size={13} />
        <span className="hidden sm:inline">{t.auth.logout}</span>
        <LogOut size={11} className="opacity-70" />
      </button>
    );
  }

  // Other login error — show retry button
  if (isLoginError) {
    return (
      <button
        type="button"
        onClick={handleAuth}
        className="flex items-center gap-1.5 text-xs font-bold bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded transition-colors"
        title={loginError?.message || 'Login failed — click to retry'}
      >
        <AlertCircle size={13} />
        <span>{t.common.retry}</span>
      </button>
    );
  }

  // Logging in — show spinner
  if (isLoggingIn) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-1.5 text-xs font-bold bg-news-blue text-white px-3 py-1.5 rounded opacity-70 cursor-not-allowed"
      >
        <Loader2 size={13} className="animate-spin" />
        <span>{t.auth.loggingIn}</span>
      </button>
    );
  }

  // Default — show login button
  return (
    <button
      type="button"
      onClick={handleAuth}
      className="flex items-center gap-1.5 text-xs font-bold bg-news-blue hover:bg-news-blue-dark text-white px-3 py-1.5 rounded transition-colors"
    >
      <LogIn size={13} />
      <span>{t.auth.login}</span>
    </button>
  );
}
