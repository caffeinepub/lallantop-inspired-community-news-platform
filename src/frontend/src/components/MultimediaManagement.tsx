import React, { useState, useRef } from 'react';
import { useGetMediaItems, useCreateMediaItem, useDeleteMediaItem } from '../hooks/useQueries';
import { MediaType } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2, CheckCircle, Trash2, Upload, Link2, Film, Mic, Video,
  ExternalLink, AlertCircle, XCircle, Play,
} from 'lucide-react';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MEDIA_TYPE_CONFIG = {
  [MediaType.video]: {
    label: 'Video',
    accept: 'video/mp4',
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: <Film size={12} />,
    badgeClass: 'bg-blue-900/60 text-blue-200 border-blue-700/40',
  },
  [MediaType.reel]: {
    label: 'Reel',
    accept: 'video/mp4',
    maxSize: 50 * 1024 * 1024,
    icon: <Video size={12} />,
    badgeClass: 'bg-purple-900/60 text-purple-200 border-purple-700/40',
  },
  [MediaType.podcast]: {
    label: 'Podcast',
    accept: 'audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/x-m4a',
    maxSize: 50 * 1024 * 1024,
    icon: <Mic size={12} />,
    badgeClass: 'bg-green-900/60 text-green-200 border-green-700/40',
  },
};

const THUMBNAIL_ACCEPT = 'image/jpeg,image/png,image/gif';
const THUMBNAIL_MAX = 5 * 1024 * 1024; // 5MB

interface FileState {
  file: File | null;
  dataUrl: string | null;
  error: string | null;
}

export default function MultimediaManagement() {
  const { data: mediaItems = [], isLoading } = useGetMediaItems();
  const createMedia = useCreateMediaItem();
  const deleteMedia = useDeleteMediaItem();

  const [mediaType, setMediaType] = useState<MediaType>(MediaType.video);
  const [title, setTitle] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('url');

  // URL mode fields
  const [embedUrl, setEmbedUrl] = useState('');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');

  // File upload mode
  const [mediaFile, setMediaFile] = useState<FileState>({ file: null, dataUrl: null, error: null });
  const [thumbnailFile, setThumbnailFile] = useState<FileState>({ file: null, dataUrl: null, error: null });

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const config = MEDIA_TYPE_CONFIG[mediaType];
    const validMimes = config.accept.split(',').map(s => s.trim());
    // Check type
    if (!validMimes.some(mime => file.type === mime || file.name.toLowerCase().endsWith(mime.split('/')[1]))) {
      const expectedLabel = mediaType === MediaType.podcast ? 'MP3, WAV, OGG, or M4A' : 'MP4';
      setMediaFile({ file: null, dataUrl: null, error: `Invalid file type. Please upload a ${expectedLabel} file.` });
      return;
    }
    if (file.size > config.maxSize) {
      setMediaFile({ file: null, dataUrl: null, error: `File too large. Maximum size is 50 MB.` });
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setMediaFile({ file, dataUrl, error: null });
    } catch {
      setMediaFile({ file: null, dataUrl: null, error: 'Failed to read file.' });
    }
  };

  const handleThumbnailFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validMimes = THUMBNAIL_ACCEPT.split(',').map(s => s.trim());
    if (!validMimes.some(mime => file.type === mime)) {
      setThumbnailFile({ file: null, dataUrl: null, error: 'Invalid file type. Use JPG, PNG, or GIF.' });
      return;
    }
    if (file.size > THUMBNAIL_MAX) {
      setThumbnailFile({ file: null, dataUrl: null, error: 'Thumbnail too large. Maximum size is 5 MB.' });
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setThumbnailFile({ file, dataUrl, error: null });
    } catch {
      setThumbnailFile({ file: null, dataUrl: null, error: 'Failed to read file.' });
    }
  };

  const clearMediaFile = () => {
    setMediaFile({ file: null, dataUrl: null, error: null });
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };
  const clearThumbnailFile = () => {
    setThumbnailFile({ file: null, dataUrl: null, error: null });
    if (thumbInputRef.current) thumbInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) { setFormError('Title is required.'); return; }

    let finalEmbedUrl = '';
    let finalThumbnailUrl = '';
    let finalFileData: string | null = null;

    if (uploadMode === 'file') {
      if (!mediaFile.dataUrl) { setFormError('Please select a media file to upload.'); return; }
      finalFileData = mediaFile.dataUrl;
      finalThumbnailUrl = thumbnailFile.dataUrl ?? '';
      finalEmbedUrl = '';
    } else {
      if (!embedUrl.trim()) { setFormError('Please enter an embed URL.'); return; }
      finalEmbedUrl = embedUrl.trim();
      finalThumbnailUrl = thumbnailUrlInput.trim();
    }

    try {
      await createMedia.mutateAsync({
        mediaType,
        title: title.trim(),
        embedUrl: finalEmbedUrl,
        thumbnailUrl: finalThumbnailUrl,
        fileData: finalFileData,
      });
      // Reset form
      setTitle('');
      setEmbedUrl('');
      setThumbnailUrlInput('');
      clearMediaFile();
      clearThumbnailFile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setFormError((err as Error).message || 'Failed to add media item.');
    }
  };

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    try {
      await deleteMedia.mutateAsync(id);
    } catch {
      // error handled silently; item will remain in list
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-news-charcoal px-4 py-2.5 flex items-center gap-2">
          <Upload size={13} className="text-white/60" />
          <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
            Add Media Item
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {success && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded p-2.5 text-sm">
              <CheckCircle size={14} /> Media item added successfully!
            </div>
          )}
          {formError && (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded p-2.5 text-sm">
              <AlertCircle size={14} /> {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold">Media Type *</Label>
              <Select
                value={mediaType}
                onValueChange={v => {
                  setMediaType(v as MediaType);
                  clearMediaFile();
                }}
              >
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MediaType.video}>
                    <span className="flex items-center gap-2"><Film size={13} /> Video</span>
                  </SelectItem>
                  <SelectItem value={MediaType.podcast}>
                    <span className="flex items-center gap-2"><Mic size={13} /> Podcast</span>
                  </SelectItem>
                  <SelectItem value={MediaType.reel}>
                    <span className="flex items-center gap-2"><Video size={13} /> Reel</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold">Title *</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-1 text-sm"
                placeholder={`Enter ${MEDIA_TYPE_CONFIG[mediaType].label.toLowerCase()} title`}
                required
              />
            </div>
          </div>

          {/* Upload mode tabs */}
          <Tabs value={uploadMode} onValueChange={v => setUploadMode(v as 'file' | 'url')}>
            <TabsList className="h-8 bg-muted/50 border border-border">
              <TabsTrigger value="file" className="text-xs h-7 flex items-center gap-1.5 data-[state=active]:bg-news-charcoal data-[state=active]:text-white">
                <Upload size={11} /> Upload File
              </TabsTrigger>
              <TabsTrigger value="url" className="text-xs h-7 flex items-center gap-1.5 data-[state=active]:bg-news-charcoal data-[state=active]:text-white">
                <Link2 size={11} /> Paste URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-3 space-y-3">
              {/* Media file */}
              <div>
                <Label className="text-xs font-bold">
                  {mediaType === MediaType.podcast ? 'Audio File (MP3/WAV/OGG/M4A, max 50MB)' : 'Video File (MP4, max 50MB)'} *
                </Label>
                <div className="mt-1">
                  {mediaFile.file ? (
                    <div className="flex items-center gap-2 bg-muted/40 border border-border rounded px-3 py-2">
                      <CheckCircle size={13} className="text-green-600 shrink-0" />
                      <span className="text-xs flex-1 truncate font-medium">{mediaFile.file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(mediaFile.file.size)}</span>
                      <button type="button" onClick={clearMediaFile} className="text-muted-foreground hover:text-destructive transition-colors">
                        <XCircle size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full border-2 border-dashed border-border rounded p-4 text-center cursor-pointer hover:border-news-blue/50 hover:bg-news-blue/5 transition-colors"
                      onClick={() => mediaInputRef.current?.click()}
                    >
                      <Upload size={20} className="mx-auto mb-1.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        Click to select {mediaType === MediaType.podcast ? 'audio' : 'video'} file
                      </p>
                    </button>
                  )}
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept={MEDIA_TYPE_CONFIG[mediaType].accept}
                    onChange={handleMediaFileChange}
                    className="hidden"
                  />
                  {mediaFile.error && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {mediaFile.error}
                    </p>
                  )}
                </div>
              </div>

              {/* Thumbnail file */}
              <div>
                <Label className="text-xs font-bold">Thumbnail Image (JPG/PNG/GIF, max 5MB) — Optional</Label>
                <div className="mt-1">
                  {thumbnailFile.file ? (
                    <div className="flex items-center gap-2 bg-muted/40 border border-border rounded px-3 py-2">
                      {thumbnailFile.dataUrl && (
                        <img src={thumbnailFile.dataUrl} alt="" className="w-8 h-8 object-cover rounded shrink-0" />
                      )}
                      <span className="text-xs flex-1 truncate font-medium">{thumbnailFile.file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(thumbnailFile.file.size)}</span>
                      <button type="button" onClick={clearThumbnailFile} className="text-muted-foreground hover:text-destructive transition-colors">
                        <XCircle size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="w-full border-2 border-dashed border-border rounded p-3 text-center cursor-pointer hover:border-news-blue/50 hover:bg-news-blue/5 transition-colors"
                      onClick={() => thumbInputRef.current?.click()}
                    >
                      <p className="text-xs text-muted-foreground">Click to select thumbnail image</p>
                    </button>
                  )}
                  <input
                    ref={thumbInputRef}
                    type="file"
                    accept={THUMBNAIL_ACCEPT}
                    onChange={handleThumbnailFileChange}
                    className="hidden"
                  />
                  {thumbnailFile.error && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {thumbnailFile.error}
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-3 space-y-3">
              <div>
                <Label className="text-xs font-bold">Embed URL (YouTube, Spotify, etc.) *</Label>
                <Input
                  value={embedUrl}
                  onChange={e => setEmbedUrl(e.target.value)}
                  className="mt-1 text-sm"
                  type="url"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Thumbnail Image URL — Optional</Label>
                <Input
                  value={thumbnailUrlInput}
                  onChange={e => setThumbnailUrlInput(e.target.value)}
                  className="mt-1 text-sm"
                  type="url"
                  placeholder="https://img.youtube.com/vi/.../hqdefault.jpg"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Button
            type="submit"
            disabled={createMedia.isPending}
            className="bg-news-blue hover:bg-news-blue-dark text-white"
          >
            {createMedia.isPending ? (
              <><Loader2 size={14} className="animate-spin mr-2" /> Adding...</>
            ) : (
              <><Upload size={14} className="mr-2" /> Add Media</>
            )}
          </Button>
        </div>
      </form>

      {/* Media List */}
      <div className="bg-card border border-border rounded overflow-hidden">
        <div className="bg-news-charcoal px-4 py-2.5 flex items-center justify-between">
          <h3 className="font-headline font-black text-white text-sm uppercase tracking-wide">
            Media Library
          </h3>
          <span className="text-white/60 text-xs">{mediaItems.length} items</span>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            {(['sk1', 'sk2', 'sk3', 'sk4'] as const).map(k => <Skeleton key={k} className="h-16 w-full" />)}
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-sm">
            No media items yet. Add your first item above.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {mediaItems.map(item => {
              const config = MEDIA_TYPE_CONFIG[item.mediaType];
              const hasFileData = item.fileData && item.fileData.length > 0;
              const isDeleting = deletingId === item.id;

              return (
                <div key={item.id.toString()} className="flex items-start gap-3 p-3 hover:bg-muted/20 transition-colors">
                  {/* Thumbnail / Preview */}
                  <div className="shrink-0 w-20 h-14 rounded overflow-hidden bg-muted/40 flex items-center justify-center relative">
                    {hasFileData ? (
                      <>
                        {item.mediaType === MediaType.podcast ? (
                          <div className="w-full h-full flex items-center justify-center bg-green-900/20">
                            <Mic size={20} className="text-green-400" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-900/20">
                            <Play size={20} className="text-blue-400" />
                          </div>
                        )}
                      </>
                    ) : item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {config.icon}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-sm truncate">{item.title}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${config.badgeClass}`}>
                        {config.icon} {config.label}
                      </span>
                      {hasFileData && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border bg-amber-900/40 text-amber-200 border-amber-700/40">
                          <Upload size={9} /> Uploaded File
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(item.publishedAt)}</p>

                    {/* Media player / link */}
                    {hasFileData ? (
                      <div className="mt-1.5">
                        {item.mediaType === MediaType.podcast ? (
                          <audio controls className="w-full max-w-xs h-7" style={{ height: '28px' }}>
                            <source src={item.fileData} />
                            <track kind="captions" />
                          </audio>
                        ) : (
                          <video controls className="w-full max-w-[160px] max-h-[80px] rounded" style={{ maxHeight: '80px' }}>
                            <source src={item.fileData} type="video/mp4" />
                            <track kind="captions" />
                          </video>
                        )}
                      </div>
                    ) : item.embedUrl ? (
                      <a
                        href={item.embedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-news-blue hover:underline mt-0.5"
                      >
                        <ExternalLink size={11} /> View source
                      </a>
                    ) : null}
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting}
                    className="shrink-0 p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    title="Delete media item"
                  >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
