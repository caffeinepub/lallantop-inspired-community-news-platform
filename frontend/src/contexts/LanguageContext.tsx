import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = sessionStorage.getItem('samachar-language');
    return (stored === 'hi' ? 'hi' : 'en') as Language;
  });

  const toggleLanguage = useCallback(() => {
    setLanguageState(prev => {
      const next = prev === 'en' ? 'hi' : 'en';
      sessionStorage.setItem('samachar-language', next);
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    sessionStorage.setItem('samachar-language', lang);
    setLanguageState(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
