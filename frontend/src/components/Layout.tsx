import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useMyProfile } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { UserRole } from '../backend';
import BreakingNewsTicker from './BreakingNewsTicker';
import LoginButton from './LoginButton';
import LanguageToggle from './LanguageToggle';
import ProfileSetupModal from './ProfileSetupModal';
import PrincipalIdDisplay from './PrincipalIdDisplay';
import PWAInstallPrompt from './PWAInstallPrompt';
import { Menu, X, Heart, LayoutDashboard } from 'lucide-react';

const NAV_CATEGORIES = [
  { key: 'india' },
  { key: 'world' },
  { key: 'sports' },
  { key: 'entertainment' },
  { key: 'technology' },
  { key: 'business' },
] as const;

type CategoryKey = typeof NAV_CATEGORIES[number]['key'];

function RoleBadgeNav({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    [UserRole.admin]: 'bg-blue-900/80 text-blue-200 border-blue-700/50',
    [UserRole.user]: 'bg-teal-800/80 text-teal-200 border-teal-600/50',
    [UserRole.guest]: 'bg-gray-700/80 text-gray-200 border-gray-600/50',
  };
  const labels: Record<UserRole, string> = {
    [UserRole.admin]: 'Admin',
    [UserRole.user]: 'User',
    [UserRole.guest]: 'Guest',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${styles[role] ?? 'bg-gray-700 text-gray-200 border-gray-600'}`}>
      {labels[role] ?? role}
    </span>
  );
}

export default function Layout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: myProfile } = useMyProfile();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const navLabels: Record<CategoryKey, string> = {
    india: t.nav.india,
    world: t.nav.world,
    sports: t.nav.sports,
    entertainment: t.nav.entertainment,
    technology: t.nav.technology,
    business: t.nav.business,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 shadow-md">
        {/* Main nav */}
        <div className="bg-news-charcoal">
          <div className="max-w-[1400px] mx-auto px-3 flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img
                src="/assets/logo.png"
                alt="Global Nexus"
                className="h-12 w-auto"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  const parent = el.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-white font-headline font-black text-xl tracking-tight"><span class="text-news-blue">GLOBAL</span> NEXUS</span>`;
                  }
                }}
              />
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
              <Link
                to="/"
                className="text-white/80 hover:text-white hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide rounded transition-colors [&.active]:text-news-blue-light [&.active]:bg-white/5"
              >
                {t.nav.home}
              </Link>
              {NAV_CATEGORIES.map(({ key }) => (
                <Link
                  key={key}
                  to="/category/$categoryName"
                  params={{ categoryName: key }}
                  className="text-white/80 hover:text-white hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide rounded transition-colors [&.active]:text-news-blue-light [&.active]:bg-white/5"
                >
                  {navLabels[key]}
                </Link>
              ))}
              <Link
                to="/citizen-news"
                className="text-white/80 hover:text-white hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide rounded transition-colors [&.active]:text-news-blue-light [&.active]:bg-white/5"
              >
                {t.nav.citizenReports}
              </Link>
              <Link
                to="/multimedia"
                className="text-white/80 hover:text-white hover:bg-white/10 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide rounded transition-colors [&.active]:text-news-blue-light [&.active]:bg-white/5"
              >
                {t.nav.multimedia}
              </Link>
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <LoginButton />
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => navigate({ to: '/dashboard' })}
                    className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-white/70 hover:text-white/90 transition-colors px-1.5 py-1 rounded hover:bg-white/10"
                  >
                    <LayoutDashboard size={11} />
                    {t.nav.dashboard}
                  </button>
                  <button
                    onClick={() => navigate({ to: '/admin' })}
                    className="hidden sm:flex items-center text-[10px] font-bold text-white/60 hover:text-white/90 transition-colors px-1.5 py-1 rounded hover:bg-white/10"
                  >
                    {t.nav.admin}
                  </button>
                </>
              )}
              {/* Mobile menu toggle */}
              <button
                className="lg:hidden text-white p-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Principal ID + role info bar — shown when authenticated */}
          {isAuthenticated && (
            <div className="border-t border-white/5 bg-black/20">
              <div className="max-w-[1400px] mx-auto px-3 py-1.5 flex items-center gap-3 flex-wrap">
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider flex-shrink-0">
                  {t.auth.yourPrincipalId}:
                </span>
                <PrincipalIdDisplay />
                {myProfile && (
                  <>
                    <span className="text-white/20 text-[10px]">|</span>
                    <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider flex-shrink-0">
                      {t.dashboard.yourAutoId}:
                    </span>
                    <span className="font-mono text-[10px] font-bold text-news-blue-light">
                      {myProfile.autoId}
                    </span>
                    <RoleBadgeNav role={myProfile.role} />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-news-charcoal border-t border-white/10">
            <nav className="flex flex-col py-2 px-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/80 hover:text-white py-2 text-sm font-semibold border-b border-white/5"
              >
                {t.nav.home}
              </Link>
              {NAV_CATEGORIES.map(({ key }) => (
                <Link
                  key={key}
                  to="/category/$categoryName"
                  params={{ categoryName: key }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/80 hover:text-white py-2 text-sm font-semibold border-b border-white/5"
                >
                  {navLabels[key]}
                </Link>
              ))}
              <Link
                to="/citizen-news"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/80 hover:text-white py-2 text-sm font-semibold border-b border-white/5"
              >
                {t.nav.citizenReports}
              </Link>
              <Link
                to="/multimedia"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/80 hover:text-white py-2 text-sm font-semibold border-b border-white/5"
              >
                {t.nav.multimedia}
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/80 hover:text-white py-2 text-sm font-semibold border-b border-white/5 flex items-center gap-1.5"
                >
                  <LayoutDashboard size={13} />
                  {t.nav.dashboard}
                </Link>
              )}
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/80 hover:text-white py-2 text-sm font-semibold border-b border-white/5"
              >
                {t.footer.about}
              </Link>
              <Link
                to="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/80 hover:text-white py-2 text-sm font-semibold border-b border-white/5"
              >
                {t.footer.privacy}
              </Link>
              <Link
                to="/terms"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/80 hover:text-white py-2 text-sm font-semibold"
              >
                {t.footer.terms}
              </Link>
            </nav>
          </div>
        )}

        {/* Breaking news ticker */}
        <BreakingNewsTicker />
      </header>

      {/* Profile setup modal */}
      <ProfileSetupModal open={showProfileSetup} />

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-news-charcoal text-white/70 mt-8">
        <div className="max-w-[1400px] mx-auto px-3 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/assets/logo.png"
                  alt="Global Nexus"
                  className="h-8 w-auto"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                  }}
                />
                <span className="font-headline font-black text-lg text-white">
                  <span className="text-news-blue">GLOBAL</span> NEXUS
                </span>
              </div>
              <p className="text-xs leading-relaxed text-white/50 max-w-xs">
                India's trusted source for breaking news, in-depth analysis, and citizen journalism.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Quick Links</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/" className="hover:text-white transition-colors">{t.nav.home}</Link></li>
                <li><Link to="/citizen-news" className="hover:text-white transition-colors">{t.nav.citizenReports}</Link></li>
                <li><Link to="/multimedia" className="hover:text-white transition-colors">{t.nav.multimedia}</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">{t.footer.about}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Legal</h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link to="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">{t.footer.terms}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/40">
            <span>© {new Date().getFullYear()} Global Nexus. {t.footer.copyright}</span>
            <span className="flex items-center gap-1">
              {t.footer.builtWith} <Heart size={10} className="text-news-blue fill-news-blue mx-0.5" /> {t.footer.using}{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'global-nexus')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-news-blue hover:text-news-blue-light transition-colors font-semibold"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* PWA Install Prompt — fixed bottom banner */}
      <PWAInstallPrompt />
    </div>
  );
}
