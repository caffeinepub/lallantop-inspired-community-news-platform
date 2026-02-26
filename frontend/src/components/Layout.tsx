import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import BreakingNewsTicker from './BreakingNewsTicker';
import LoginButton from './LoginButton';
import LanguageToggle from './LanguageToggle';
import ProfileSetupModal from './ProfileSetupModal';
import PrincipalIdDisplay from './PrincipalIdDisplay';
import { Menu, X, Heart, Globe } from 'lucide-react';

const NAV_CATEGORIES = [
  { key: 'india' },
  { key: 'world' },
  { key: 'sports' },
  { key: 'entertainment' },
  { key: 'technology' },
  { key: 'business' },
] as const;

type CategoryKey = typeof NAV_CATEGORIES[number]['key'];

export default function Layout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
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
                <button
                  onClick={() => navigate({ to: '/admin' })}
                  className="hidden sm:flex items-center text-[10px] font-bold text-white/60 hover:text-white/90 transition-colors px-1.5 py-1 rounded hover:bg-white/10"
                >
                  {t.nav.admin}
                </button>
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

          {/* Principal ID display bar — shown when authenticated */}
          {isAuthenticated && (
            <div className="border-t border-white/5 bg-black/20">
              <div className="max-w-[1400px] mx-auto px-3 py-1.5 flex items-center gap-2">
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider flex-shrink-0">
                  {t.auth.yourPrincipalId}:
                </span>
                <PrincipalIdDisplay />
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

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-news-charcoal text-white/70 mt-8">
        <div className="max-w-[1400px] mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="md:col-span-1">
              <Link to="/" className="inline-block mb-3">
                <img
                  src="/assets/logo.png"
                  alt="Global Nexus"
                  className="h-14 w-auto"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                  }}
                />
              </Link>
              <p className="text-xs leading-relaxed text-white/60">
                A multilingual news and policy platform dedicated to empowering communities through real-time reporting, AI-driven analysis, and citizen engagement.
              </p>
            </div>

            {/* Categories column */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wide border-b border-news-blue/40 pb-2">
                Categories
              </h4>
              <ul className="space-y-2 text-xs">
                {NAV_CATEGORIES.map(({ key }) => (
                  <li key={key}>
                    <Link
                      to="/category/$categoryName"
                      params={{ categoryName: key }}
                      className="hover:text-news-blue-light transition-colors"
                    >
                      {navLabels[key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform column */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wide border-b border-news-blue/40 pb-2">
                Platform
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/citizen-news" className="hover:text-news-blue-light transition-colors">
                    {t.nav.citizenReports}
                  </Link>
                </li>
                <li>
                  <Link to="/multimedia" className="hover:text-news-blue-light transition-colors">
                    {t.nav.multimedia}
                  </Link>
                </li>
              </ul>
            </div>

            {/* About & Legal column */}
            <div>
              <h4 className="font-bold text-white text-sm mb-4 uppercase tracking-wide border-b border-news-blue/40 pb-2">
                About
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/about"
                    className="flex items-center gap-1.5 text-news-blue-light hover:text-white font-semibold transition-colors"
                  >
                    <Globe size={12} />
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-news-blue-light transition-colors"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-news-blue-light transition-colors"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <span>© {new Date().getFullYear()} Global Nexus. {t.footer.copyright}</span>
            <span className="flex items-center gap-1">
              {t.footer.builtWith}{' '}
              <Heart size={11} className="fill-news-blue text-news-blue mx-0.5" />{' '}
              {t.footer.using}{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'global-nexus')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-news-blue-light hover:underline font-semibold"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </footer>

      {/* Profile setup modal */}
      {!isInitializing && <ProfileSetupModal open={showProfileSetup} />}
    </div>
  );
}
