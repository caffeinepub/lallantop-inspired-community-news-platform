import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'pwa-install-dismissed';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem(DISMISSED_KEY, '1');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISSED_KEY, '1');
    }
    setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 px-4 py-3 shadow-lg"
      style={{ backgroundColor: '#1A6FBF' }}
      role="banner"
      aria-label="Install Global Nexus app"
    >
      <div className="flex items-center gap-3 min-w-0">
        <img
          src="/assets/icons/icon-192x192.png"
          alt="Global Nexus"
          className="w-9 h-9 rounded-lg flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <p className="text-white text-sm font-medium leading-tight">
          <span className="font-bold">Install Global Nexus</span>
          <span className="hidden sm:inline"> — get the full app experience on your home screen</span>
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 bg-white text-[#1A6FBF] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-white/90 transition-colors"
        >
          <Download size={13} />
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors p-1"
          aria-label="Dismiss install prompt"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
