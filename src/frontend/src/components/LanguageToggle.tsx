import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-0.5 text-xs font-black border border-white/30 rounded px-2 py-1 text-white hover:bg-white/10 transition-colors"
      title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    >
      <span className={language === 'en' ? 'text-white' : 'text-white/50'}>EN</span>
      <span className="text-white/30 mx-0.5">|</span>
      <span className={language === 'hi' ? 'text-white' : 'text-white/50'}>हि</span>
    </button>
  );
}
