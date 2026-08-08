"use client";

interface VideoPreviewModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let videoId = "";
      if (u.hostname.includes("youtu.be")) {
        videoId = u.pathname.slice(1);
      } else if (u.pathname.includes("/shorts/")) {
        videoId = u.pathname.split("/shorts/")[1];
      } else {
        videoId = u.searchParams.get("v") || "";
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
  } catch {}
  return null;
}

export function VideoPreviewModal({ url, title, onClose }: VideoPreviewModalProps) {
  const embedUrl = getEmbedUrl(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground truncate pr-2">🎥 {title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted text-sm font-semibold transition-colors"
          >
            ✕
          </button>
        </div>

        {embedUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-border">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="p-6 text-center space-y-4 bg-surface-2 rounded-xl border border-border">
            <p className="text-sm text-muted">
              L&apos;aperçu vidéo direct n&apos;est pas disponible pour ce lien. Clique pour l&apos;ouvrir dans un nouvel onglet :
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white font-semibold text-xs rounded-full shadow-md transition-all active:scale-95"
            >
              Ouvrir la vidéo ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
