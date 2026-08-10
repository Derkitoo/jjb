"use client";

import { useState } from "react";
import { GameplanNode, GameplanStepType } from "@/lib/types";
import { Card } from "@/components/Card";
import { VideoEmbedModal } from "./VideoEmbedModal";

const TYPE_CONFIG: Record<GameplanStepType, { label: string; badge: string; color: string; border: string }> = {
  position: {
    label: "Position",
    badge: "🔵 Position",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    border: "border-blue-500/50",
  },
  transition: {
    label: "Transition / Sweep",
    badge: "🟡 Transition",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    border: "border-amber-500/50",
  },
  submission: {
    label: "Soumission",
    badge: "🔴 Soumission",
    color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    border: "border-rose-500/50",
  },
};

interface GameplanTreeProps {
  nodes: GameplanNode[];
  onAddChildNode: (parentId: string) => void;
  onEditNode: (node: GameplanNode) => void;
  onDeleteNode: (id: string) => void;
  isAdmin: boolean;
}

export function GameplanTree({
  nodes,
  onAddChildNode,
  onEditNode,
  onDeleteNode,
  isAdmin,
}: GameplanTreeProps) {
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; url: string } | null>(null);

  // Group nodes by parentId
  const rootNodes = nodes.filter((n) => !n.parentId);

  function getChildren(parentId: string) {
    return nodes.filter((n) => n.parentId === parentId);
  }

  return (
    <div className="space-y-6">
      {selectedVideo && (
        <VideoEmbedModal
          title={selectedVideo.title}
          videoUrl={selectedVideo.url}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {rootNodes.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-muted">Aucune position enregistrée dans ton Gameplan.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {rootNodes.map((root) => (
            <TreeNodeItem
              key={root.id}
              node={root}
              getChildren={getChildren}
              onAddChildNode={onAddChildNode}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
              onOpenVideo={(title, url) => setSelectedVideo({ title, url })}
              isAdmin={isAdmin}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TreeNodeItemProps {
  node: GameplanNode;
  getChildren: (parentId: string) => GameplanNode[];
  onAddChildNode: (parentId: string) => void;
  onEditNode: (node: GameplanNode) => void;
  onDeleteNode: (id: string) => void;
  onOpenVideo: (title: string, url: string) => void;
  isAdmin: boolean;
  level: number;
}

function TreeNodeItem({
  node,
  getChildren,
  onAddChildNode,
  onEditNode,
  onDeleteNode,
  onOpenVideo,
  isAdmin,
  level,
}: TreeNodeItemProps) {
  const children = getChildren(node.id);
  const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.position;
  const isRoot = level === 0;

  return (
    <div className="relative space-y-3">
      {/* Node Box */}
      <div
        className={`p-4 rounded-2xl border ${cfg.border} bg-surface/90 shadow-lg space-y-2 transition-all duration-200 hover:border-white/30`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
              {cfg.badge}
            </span>
            <h4 className="font-extrabold text-sm text-foreground">{node.title}</h4>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {node.videoUrl && (
              <button
                onClick={() => onOpenVideo(node.title, node.videoUrl!)}
                className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
              >
                <span>🎥</span>
                <span className="hidden sm:inline">Vidéo</span>
              </button>
            )}

            <button
              onClick={() => onAddChildNode(node.id)}
              className="px-2 py-1 rounded-full bg-surface-2 hover:bg-border text-muted hover:text-foreground text-xs font-bold transition-all active:scale-95"
              title="Ajouter une suite"
            >
              + Suite
            </button>

            <button
              onClick={() => onEditNode(node)}
              className="p-1 rounded-lg text-muted hover:text-foreground text-xs"
              title="Éditer"
            >
              ✏️
            </button>

            {isAdmin && (
              <button
                onClick={() => onDeleteNode(node.id)}
                className="p-1 rounded-lg text-rose-400 hover:text-rose-300 text-xs"
                title="Supprimer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {node.notes && (
          <p className="text-xs text-muted leading-relaxed pl-1 border-l-2 border-border/60">
            {node.notes}
          </p>
        )}
      </div>

      {/* Children Nodes (Flowchart Branch Connection) */}
      {children.length > 0 && (
        <div className="pl-4 sm:pl-8 border-l-2 border-white/10 space-y-4 pt-1 ml-3 sm:ml-5">
          {children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              getChildren={getChildren}
              onAddChildNode={onAddChildNode}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
              onOpenVideo={onOpenVideo}
              isAdmin={isAdmin}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
