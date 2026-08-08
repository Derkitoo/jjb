"use client";

import { useEffect, useState } from "react";
import { Card } from "./Card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setIsIOS(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("Sur Android/Chrome : cliquez sur les 3 points (⋮) du navigateur puis 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.");
    }
  }

  if (isInstalled || dismissed) return null;

  return (
    <Card className="bg-gradient-to-r from-accent/15 via-surface-2 to-surface border border-accent/40 p-4 space-y-3 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface-2 text-muted hover:text-foreground text-xs flex items-center justify-center"
        title="Masquer"
      >
        ✕
      </button>

      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">📱</span>
        <div className="space-y-1 pr-6">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            Installer BJJ Coach sur mobile
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            {isIOS ? (
              <span>
                Sur iPhone / Safari : appuyez sur <strong>Partager ⎋</strong> puis <strong>&quot;Sur l&apos;écran d&apos;accueil&quot; 📲</strong> pour l&apos;utiliser en plein écran hors-ligne.
              </span>
            ) : (
              <span>
                Accès 100% hors-ligne & plein écran sur le tatami. Cliquez ci-dessous pour ajouter l&apos;application sur votre mobile.
              </span>
            )}
          </p>
        </div>
      </div>

      {!isIOS && (
        <div className="flex justify-end pt-1">
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-bold text-xs rounded-full shadow-md transition-all active:scale-95 shrink-0"
          >
            {deferredPrompt ? "Installer l'App (1 clic)" : "Comment installer ?"}
          </button>
        </div>
      )}
    </Card>
  );
}
