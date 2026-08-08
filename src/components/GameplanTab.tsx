"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { useAdmin } from "@/lib/admin-context";
import { Card } from "@/components/Card";
import { GAMEPLAN_STEP_LABELS, GameplanNode, GameplanStepType } from "@/lib/types";
import { VideoPreviewModal } from "./VideoPreviewModal";

export function GameplanTab() {
  const { gameplanNodes, addGameplanNode, deleteGameplanNode } = useData();
  const { isAdmin } = useAdmin();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<GameplanStepType>("position");
  const [parentId, setParentId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    addGameplanNode({
      title: title.trim(),
      type,
      parentId: parentId ? parentId : null,
      notes: notes.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
    });

    setTitle("");
    setNotes("");
    setVideoUrl("");
    setParentId("");
    setShowAddForm(false);
  }

  const rootNodes = gameplanNodes.filter((n) => !n.parentId);

  function getChildren(id: string) {
    return gameplanNodes.filter((n) => n.parentId === id);
  }

  const STEP_TYPE_STYLES: Record<GameplanStepType, string> = {
    position: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    transition: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    submission: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  };

  const STEP_TYPE_BADGES: Record<GameplanStepType, string> = {
    position: "🛡️ Position",
    transition: "🔄 Transition/Sweep",
    submission: "⚡ Soumission",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Arbre de Décision / Gameplan ♟️</h2>
          <p className="text-xs text-muted">
            Construis tes enchaînements tactiques : *Position ➔ Transition ➔ Soumission*.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-semibold text-xs rounded-full shadow-md transition-all shrink-0"
        >
          {showAddForm ? "Fermer" : "+ Ajouter une étape"}
        </button>
      </div>

      {showAddForm && (
        <Card className="space-y-4 border border-accent/30 bg-surface">
          <h3 className="font-semibold text-sm">Ajouter une étape au Gameplan</h3>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <div>
              <label className="block text-xs text-muted mb-1">Titre de la technique / position</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: De La Riva Guard, Omoplata..."
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Type d&apos;étape</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as GameplanStepType)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
                >
                  {(Object.keys(GAMEPLAN_STEP_LABELS) as GameplanStepType[]).map((t) => (
                    <option key={t} value={t}>
                      {GAMEPLAN_STEP_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1">Étape parente (Optionnel)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
                >
                  <option value="">-- Racine (Position de départ) --</option>
                  {gameplanNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title} ({GAMEPLAN_STEP_LABELS[n.type]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">Lien Vidéo YouTube / Instagram (Optionnel)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">Notes & Conseils d&apos;exécution</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Détails importants, grips, pièges..."
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white font-semibold rounded-full shadow-md transition-all text-xs"
            >
              Enregistrer dans le Gameplan
            </button>
          </form>
        </Card>
      )}

      {rootNodes.length === 0 ? (
        <Card className="text-center py-8 text-muted text-sm space-y-2">
          <p>Aucun enchaînement dans ton Gameplan pour l&apos;instant.</p>
          <p className="text-xs">Ajoute tes séquences préférées pour visualiser ton style de jeu.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rootNodes.map((root) => (
            <GameplanNodeTree
              key={root.id}
              node={root}
              getChildren={getChildren}
              STEP_TYPE_STYLES={STEP_TYPE_STYLES}
              STEP_TYPE_BADGES={STEP_TYPE_BADGES}
              isAdmin={isAdmin}
              onDelete={deleteGameplanNode}
              onOpenVideo={(url, title) => setPreviewVideo({ url, title })}
            />
          ))}
        </div>
      )}

      {previewVideo && (
        <VideoPreviewModal
          url={previewVideo.url}
          title={previewVideo.title}
          onClose={() => setPreviewVideo(null)}
        />
      )}
    </div>
  );
}

interface GameplanNodeTreeProps {
  node: GameplanNode;
  getChildren: (id: string) => GameplanNode[];
  STEP_TYPE_STYLES: Record<GameplanStepType, string>;
  STEP_TYPE_BADGES: Record<GameplanStepType, string>;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onOpenVideo: (url: string, title: string) => void;
  depth?: number;
}

function GameplanNodeTree({
  node,
  getChildren,
  STEP_TYPE_STYLES,
  STEP_TYPE_BADGES,
  isAdmin,
  onDelete,
  onOpenVideo,
  depth = 0,
}: GameplanNodeTreeProps) {
  const children = getChildren(node.id);

  return (
    <div className={`space-y-2 ${depth > 0 ? "ml-4 pl-4 border-l-2 border-border/60" : ""}`}>
      <Card className="p-3.5 space-y-2 bg-surface hover:border-accent/40 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STEP_TYPE_STYLES[node.type]}`}>
                {STEP_TYPE_BADGES[node.type]}
              </span>
              <h4 className="font-bold text-sm text-foreground">{node.title}</h4>
            </div>
            {node.notes && <p className="text-xs text-muted">{node.notes}</p>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {node.videoUrl && (
              <button
                onClick={() => onOpenVideo(node.videoUrl!, node.title)}
                className="px-2.5 py-1 bg-accent/20 hover:bg-accent text-accent hover:text-white rounded-full text-xs font-semibold transition-all flex items-center gap-1"
              >
                ▶ Vidéo
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onDelete(node.id)}
                className="text-xs text-muted hover:text-accent p-1 transition-colors"
                title="Supprimer l'étape"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </Card>

      {children.length > 0 && (
        <div className="space-y-2 pt-1">
          {children.map((child) => (
            <GameplanNodeTree
              key={child.id}
              node={child}
              getChildren={getChildren}
              STEP_TYPE_STYLES={STEP_TYPE_STYLES}
              STEP_TYPE_BADGES={STEP_TYPE_BADGES}
              isAdmin={isAdmin}
              onDelete={onDelete}
              onOpenVideo={onOpenVideo}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
