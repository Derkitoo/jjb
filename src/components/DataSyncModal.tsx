"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";

interface DataSyncModalProps {
  onClose: () => void;
}

export function DataSyncModal({ onClose }: DataSyncModalProps) {
  const { exportData, importData, sessions, recipes, gameplanNodes, userGrade, matchLogs } = useData();
  const [importKey, setImportKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Generate lightweight sync payload
  const payloadData = {
    sessions,
    recipes,
    gameplanNodes,
    userGrade,
    matchLogs,
    exportedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(payloadData);

  function copyToClipboard() {
    try {
      navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setStatusMessage({ type: "error", text: "Impossible de copier automatiquement dans le presse-papier." });
    }
  }

  function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importKey.trim()) return;

    const res = importData(importKey.trim());
    if (res.ok) {
      setStatusMessage({ type: "success", text: "Données restaurées et synchronisées avec succès ! ✓" });
      setImportKey("");
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMessage({ type: "error", text: res.error || "Erreur de format de données." });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              📱 Synchronisation PC ↔ Mobile
            </h3>
            <p className="text-xs text-muted">
              Transfère tes données (Séances, Gameplan, Grade) en 1 seconde sans créer de compte
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted text-sm font-semibold transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold shrink-0 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Export / Share Section */}
          <div className="p-4 bg-surface-2/80 rounded-xl border border-border space-y-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>📤 Option A : Exporter depuis cet appareil</span>
            </h4>
            <p className="text-muted leading-relaxed">
              Copie ta clé de synchronisation ou télécharge ton fichier de sauvegarde pour l&apos;envoyer par WhatsApp, Mail ou SMS sur ton téléphone.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex-1 py-2.5 px-4 bg-accent text-white font-bold rounded-xl shadow transition-all hover:bg-accent/90 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{copied ? "✓ Clé Copiée !" : "📋 Copier la clé dans le presse-papier"}</span>
              </button>
              <button
                type="button"
                onClick={exportData}
                className="py-2.5 px-4 bg-surface border border-border text-foreground font-semibold rounded-xl transition-all hover:bg-surface-2"
              >
                💾 Fichier .JSON
              </button>
            </div>
          </div>

          {/* Import / Receive Section */}
          <form onSubmit={handleImport} className="p-4 bg-surface-2/80 rounded-xl border border-border space-y-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <span>📥 Option B : Restaurer sur cet appareil</span>
            </h4>
            <p className="text-muted leading-relaxed">
              Colle ici la clé de synchronisation ou le texte JSON copié depuis ton autre appareil.
            </p>

            <textarea
              value={importKey}
              onChange={(e) => setImportKey(e.target.value)}
              rows={4}
              placeholder="Colle la clé de synchronisation ici (ex: { &quot;sessions&quot;: [...] })"
              className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs font-mono"
            />

            <button
              type="submit"
              disabled={!importKey.trim()}
              className="w-full py-2.5 bg-accent-2 text-white font-bold rounded-xl shadow transition-all hover:bg-accent-2/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              🔄 Importer & Synchroniser mes données
            </button>
          </form>
        </div>

        <div className="pt-2 border-t border-border flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-surface-2 hover:bg-border text-foreground font-semibold text-xs rounded-full transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
