import React, { useState } from 'react';
import { useGetMediaItems } from '../hooks/useQueries';
import { useTranslation } from '../hooks/useTranslation';
import { MediaType, MediaItem } from '../backend';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import MediaCard from '../components/MediaCard';
import VideoPlayerModal from '../components/VideoPlayerModal';
import { Play, Headphones, Film } from 'lucide-react';

export default function MultimediaPage() {
  const { data: mediaItems = [], isLoading } = useGetMediaItems();
  const { t } = useTranslation();
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);

  const videos = mediaItems.filter(m => m.mediaType === MediaType.video);
  const podcasts = mediaItems.filter(m => m.mediaType === MediaType.podcast);
  const reels = mediaItems.filter(m => m.mediaType === MediaType.reel);

  const handlePlay = (item: MediaItem) => {
    if (item.mediaType === MediaType.video) {
      setSelectedVideo(item);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 py-4">
      {/* Header */}
      <div className="mb-5 border-b-2 border-news-red pb-3">
        <h1 className="font-headline font-black text-2xl uppercase tracking-wide">
          {t.multimedia.pageTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Videos, podcasts, and short-form content
        </p>
      </div>

      <Tabs defaultValue="videos">
        <TabsList className="mb-5 bg-muted/50 border border-border">
          <TabsTrigger value="videos" className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:bg-news-red data-[state=active]:text-white">
            <Play size={12} />
            {t.multimedia.videos}
            {videos.length > 0 && <span className="ml-1 bg-white/20 text-[10px] px-1 rounded">{videos.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="podcasts" className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Headphones size={12} />
            {t.multimedia.podcasts}
            {podcasts.length > 0 && <span className="ml-1 bg-white/20 text-[10px] px-1 rounded">{podcasts.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="reels" className="flex items-center gap-1.5 text-xs font-bold data-[state=active]:bg-news-saffron data-[state=active]:text-white">
            <Film size={12} />
            {t.multimedia.reels}
            {reels.length > 0 && <span className="ml-1 bg-white/20 text-[10px] px-1 rounded">{reels.length}</span>}
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded h-48" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">{t.common.noResults}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map(item => (
                <MediaCard key={item.id.toString()} item={item} onPlay={handlePlay} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Podcasts Tab */}
        <TabsContent value="podcasts">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded h-20" />
              ))}
            </div>
          ) : podcasts.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">{t.common.noResults}</p>
          ) : (
            <div className="space-y-3">
              {podcasts.map(item => (
                <div
                  key={item.id.toString()}
                  className="flex items-center gap-4 bg-card border border-border rounded p-3 hover:shadow-card-hover transition-shadow"
                >
                  <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-black uppercase bg-purple-600 text-white px-1.5 py-0.5 rounded-sm">PODCAST</span>
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                  </div>
                  <a
                    href={item.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded transition-colors"
                  >
                    <Headphones size={12} />
                    {t.multimedia.listenNow}
                  </a>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Reels Tab */}
        <TabsContent value="reels">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded h-48" />
              ))}
            </div>
          ) : reels.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">{t.common.noResults}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {reels.map(item => (
                <MediaCard key={item.id.toString()} item={item} onPlay={handlePlay} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Video player modal */}
      {selectedVideo && (
        <VideoPlayerModal
          open={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          embedUrl={selectedVideo.embedUrl}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
}
