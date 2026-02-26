import React from 'react';
import { MediaItem, MediaType } from '../backend';
import { useTranslation } from '../hooks/useTranslation';
import { Play, Headphones, Film, ExternalLink } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
  onPlay?: (item: MediaItem) => void;
}

export default function MediaCard({ item, onPlay }: MediaCardProps) {
  const { t } = useTranslation();

  const isVideo = item.mediaType === MediaType.video;
  const isPodcast = item.mediaType === MediaType.podcast;
  const isReel = item.mediaType === MediaType.reel;

  const handleClick = () => {
    if (isVideo && onPlay) {
      onPlay(item);
    } else {
      window.open(item.embedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="group bg-card border border-border rounded overflow-hidden hover:shadow-card-hover transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden aspect-video bg-muted">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400';
          }}
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-news-blue/90 flex items-center justify-center">
            {isVideo && <Play size={20} className="text-white fill-white ml-1" />}
            {isPodcast && <Headphones size={20} className="text-white" />}
            {isReel && <Film size={20} className="text-white" />}
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded-sm text-white ${
            isVideo ? 'bg-news-blue' : isPodcast ? 'bg-indigo-600' : 'bg-news-blue-light'
          }`}>
            {isVideo ? 'VIDEO' : isPodcast ? 'PODCAST' : 'REEL'}
          </span>
        </div>
      </div>
      <div className="p-2.5">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {item.title}
        </h3>
        <button className="flex items-center gap-1 text-[11px] font-bold text-news-blue hover:text-news-blue-dark transition-colors">
          {isVideo ? (
            <><Play size={10} className="fill-current" />{t.multimedia.watchNow}</>
          ) : isPodcast ? (
            <><Headphones size={10} />{t.multimedia.listenNow}</>
          ) : (
            <><ExternalLink size={10} />{t.multimedia.viewReel}</>
          )}
        </button>
      </div>
    </div>
  );
}
