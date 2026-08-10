"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { useAdmin } from "@/lib/admin-context";
import { Card } from "@/components/Card";
import { GAMEPLAN_STEP_LABELS, GameplanNode, GameplanStepType } from "@/lib/types";
import { GameplanTree } from "./GameplanTree";
import { VideoEmbedModal } from "./VideoEmbedModal";

export function GameplanTab() {
  const { gameplanNodes, addGameplanNode, updateGameplanNode, deleteGameplanNode } = useData();
  const { isAdmin } = useAdmin();

  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNode, setEditingNode] = useState<GameplanNode | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<GameplanStepType>("position");
  const [parentId, setParentId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [previewVideo, setPreviewVideo] = useState<{ url: string; title: string } | null>(null);

  function openFormWithParent(parent: string) {
    setParentId(parent);
    setShowAddForm(true);
    setEditingNode(null);
  }

  function openEditForm(node: GameplanNode) {
    setEditingNode(node);
    setTitle(node.title);
    setType(node.type);
    setParentId(node.parentId || "");
    setNotes(node.notes || "");
    setVideoUrl(node.videoUrl || "");
    setShowAddForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingNode) {
      updateGameplanNode(editingNode.id, {
        title: title.trim(),
        type,
        parentId: parentId ? parentId : null,
        notes: notes.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
      });
    } else {
      addGameplanNode({
        title: title.trim(),
        type,
        parentId: parentId ? parentId : null,
        notes: notes.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
      });
    }

    setTitle("");
    setNotes("");
    setVideoUrl("");
    setParentId("");
    setEditingNode(null);
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
      {previewVideo && (
        <VideoEmbedModal
          title={previewVideo.title}
          videoUrl={previewVideo.url}
          onClose={() => setPreviewVideo(null)}
        />
      )}

      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2 bg-surface-2 border border-border rounded-full p-1">
          <button
            onClick={() => setViewMode("tree")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              viewMode === "tree" ? "bg-accent text-white shadow-md" : "text-muted"
            }`}
          >
            🌳 Arbre Visuel (Flowchart)
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              viewMode === "list" ? "bg-accent text-white shadow-md" : "text-muted"
            }`}
          >
            📋 Vue Liste
          </button>
        </div>

        <button
          onClick={() => {
            setEditingNode(null);
            setTitle("");
            setNotes("");
            setVideoUrl("");
            setParentId("");
            setShowAddForm(!showAddForm);
          }}
          className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-semibold text-xs rounded-full shadow-md transition-all shrink-0 active:scale-95"
        >
          {showAddForm ? "Fermer" : "+ Ajouter une étape"}
        </button>
      </div>

      {showAddForm && (
        <Card className="space-y-4 border border-accent/30 bg-surface">
          <h3 className="font-semibold text-sm">
            {editingNode ? "Éditer l'étape" : "Ajouter une étape au Gameplan"}
          </h3>
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
              <label className="block text-xs text-muted mb-1">Notes & Conseils tactiques</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Contrôler la cheville avec la main gauche, pousser le genou..."
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1">Lien Vidéo YouTube (Démonstration)</label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm focus:border-accent outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-muted hover:bg-surface-2"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-accent hover:bg-accent/90 text-white font-semibold text-xs rounded-full shadow-md transition-all active:scale-95"
              >
                {editingNode ? "Enregistrer les modifications" : "Ajouter au Gameplan"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Main View: Tree vs List */}
      {viewMode === "tree" ? (
        <GameplanTree
          nodes={gameplanNodes}
          onAddChildNode={openFormWithParent}
          onEditNode={openEditForm}
          onDeleteNode={deleteGameplanNode}
          isAdmin={isAdmin}
        />
      ) : (
        <div className="space-y-4">
          {rootNodes.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-muted">Aucune position de départ dans ton Gameplan.</p>
            </Card>
          ) : (
            rootNodes.map((rootNode) => (
              <RenderNodeTree
                key={rootNode.id}
                node={rootNode}
                getChildren={getChildren}
                onAddChild={openFormWithParent}
                onEditNode={openEditForm}
                onDeleteNode={deleteGameplanNode}
                onOpenVideo={(url, title) => setPreviewVideo({ url, title })}
                isAdmin={isAdmin}
                styles={STEP_TYPE_STYLES}
                badges={STEP_TYPE_BADGES}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function RenderNodeTree({
  node,
  getChildren,
  onAddChild,
  onEditNode,
  onDeleteNode,
  onOpenVideo,
  isAdmin,
  styles,
  badges,
  depth = 0,
}: {
  node: GameplanNode;
  getChildren: (id: string) => GameplanNode[];
  onAddChild: (id: string) => void;
  onEditNode: (node: GameplanNode) => void;
  onDeleteNode: (id: string) => void;
  onOpenVideo: (url: string, title: string) => void;
  isAdmin: boolean;
  styles: Record<GameplanStepType, string>;
  badges: Record<GameplanStepType, string>;
  depth?: number;
}) {
  const children = getChildren(node.id);

  return (
    <div className={`space-y-2 ${depth > 0 ? "ml-4 sm:ml-6 pl-3 border-l-2 border-border" : ""}`}>
      <Card className="p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${styles[node.type]}`}
            >
              {badges[node.type]}
            </span>
            <span className="font-bold text-sm text-foreground">{node.title}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {node.videoUrl && (
              <button
                onClick={() => onOpenVideo(node.videoUrl!, node.title)}
                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-semibold flex items-center gap-1"
              >
                <span>🎥</span> Vidéo
              </button>
            )}
            <button
              onClick={() => onAddChild(node.id)}
              className="px-2 py-1 bg-surface-2 hover:bg-border text-xs rounded-full font-semibold transition-colors"
            >
              + Suite
            </button>
            <button
              onClick={() => onEditNode(node)}
              className="p-1 text-muted hover:text-foreground text-xs"
            >
              ✏️
            </button>
            {isAdmin && (
              <button
                onClick={() => onDeleteNode(node.id)}
                className="p-1 text-rose-400 hover:text-rose-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {node.notes && <p className="text-xs text-muted leading-relaxed">{node.notes}</p>}
      </Card>

      {children.length > 0 && (
        <div className="space-y-2">
          {children.map((child) => (
            <RenderNodeTree
              key={child.id}
              node={child}
              getChildren={getChildren}
              onAddChild={onAddChild}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
              onOpenVideo={onOpenVideo}
              isAdmin={isAdmin}
              styles={styles}
              badges={badges}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
