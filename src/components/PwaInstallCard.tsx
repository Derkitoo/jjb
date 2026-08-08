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

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  }

  if (isInstalled) return null;
  if (!deferredPrompt) return null;

  return (
    <Card className="bg-gradient-to-r from-accent/10 via-surface-2 to-surface border border-accent/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <h3 className="font-bold text-sm text-foreground">Installer BJJ Coach</h3>
            <p className="text-xs text-muted">Accès 100% hors-ligne & plein écran sur ton mobile</p>
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-semibold text-xs rounded-full shadow-md transition-all active:scale-95 shrink-0"
        >
          Installer l&apos;App
        </button>
      </div>
    </Card>
  );
}
