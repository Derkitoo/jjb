"use client";

export function parseYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    // Standard youtube.com/watch?v=VIDEO_ID
    if (url.includes("youtube.com/watch")) {
      const parsed = new URL(url);
      const v = parsed.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}?autoplay=1`;
    }
    // Shortened youtu.be/VIDEO_ID
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }
    // Already an embed URL
    if (url.includes("youtube.com/embed/")) {
      return url;
    }
  } catch {}
  return null;
}

interface VideoEmbedModalProps {
  title: string;
  videoUrl: string;
  onClose: () => void;
}

export function VideoEmbedModal({ title, videoUrl, onClose }: VideoEmbedModalProps) {
  const embedUrl = parseYouTubeEmbedUrl(videoUrl);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-surface border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl shadow-black/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-foreground truncate pr-4">
            <span className="text-accent text-lg">🎥</span>
            <span className="truncate">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border text-muted hover:text-foreground font-bold flex items-center justify-center transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-lg">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="text-3xl">⚠️</span>
              <p className="text-xs text-muted">
                Impossible de charger cette vidéo. Vérifiez le lien YouTube :
              </p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-accent underline break-all"
              >
                {videoUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
