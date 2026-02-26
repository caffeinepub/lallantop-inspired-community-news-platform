import React from 'react';
import { useGetBreakingNews } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { Zap } from 'lucide-react';

export default function BreakingNewsTicker() {
  const { data: breakingNews = [] } = useGetBreakingNews();
  const { t, language } = useTranslation();

  if (breakingNews.length === 0) return null;

  const headlines = breakingNews.map(a => language === 'hi' ? a.titleHindi : a.title);

  return (
    <div className="bg-news-blue text-white flex items-stretch overflow-hidden" style={{ height: '32px' }}>
      {/* Label */}
      <div className="flex items-center gap-1.5 px-3 bg-news-blue-dark flex-shrink-0 z-10">
        <Zap size={12} className="fill-white" />
        <span className="text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
          {t.home.breakingNews}
        </span>
      </div>
      {/* Scrolling content */}
      <div className="flex-1 overflow-hidden relative">
        <div className="ticker-scroll inline-flex items-center h-full gap-8 text-[12px] font-semibold">
          {headlines.map((headline, i) => (
            <span key={i} className="whitespace-nowrap flex items-center gap-2">
              <span className="text-white/60">●</span>
              {headline}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {headlines.map((headline, i) => (
            <span key={`dup-${i}`} className="whitespace-nowrap flex items-center gap-2">
              <span className="text-white/60">●</span>
              {headline}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
