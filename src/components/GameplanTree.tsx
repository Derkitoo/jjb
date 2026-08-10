"use client";

import { useState } from "react";
import { GameplanNode, GameplanStepType } from "@/lib/types";
import { Card } from "@/components/Card";
import { VideoEmbedModal } from "./VideoEmbedModal";

const TYPE_CONFIG: Record<
  GameplanStepType,
  { label: string; badge: string; color: string; border: string; glow: string }
> = {
  position: {
    label: "Position",
    badge: "🔵 Position",
    color: "bg-blue-500/15 text-blue-300 border-blue-500/40",
    border: "border-blue-500/60",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.25)]",
  },
  transition: {
    label: "Transition / Sweep",
    badge: "🟡 Transition",
    color: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    border: "border-amber-500/60",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.25)]",
  },
  submission: {
    label: "Soumission",
    badge: "🔴 Soumission",
    color: "bg-rose-500/15 text-rose-300 border-rose-500/40",
    border: "border-rose-500/60",
    glow: "shadow-[0_0_15px_rgba(225,29,72,0.35)]",
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
        <Card className="text-center py-10">
          <p className="text-sm text-muted">
            Aucune position enregistrée. Ajoute une position de départ pour commencer ton arbre de décision.
          </p>
        </Card>
      ) : (
        <div className="w-full overflow-x-auto pb-6">
          <div className="min-w-[700px] p-6 rounded-3xl bg-surface/90 border border-white/10 shadow-2xl space-y-10 relative bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-bold text-xs text-muted uppercase tracking-wider">
                <span>🌳 Diagramme de Flux Tactique (Flowchart Interactive)</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-blue-400">🔵 Position</span>
                <span className="flex items-center gap-1 text-amber-400">🟡 Transition</span>
                <span className="flex items-center gap-1 text-rose-400">🔴 Soumission</span>
              </div>
            </div>

            <div className="space-y-12">
              {rootNodes.map((root) => (
                <FlowchartBranch
                  key={root.id}
                  node={root}
                  getChildren={getChildren}
                  onAddChildNode={onAddChildNode}
                  onEditNode={onEditNode}
                  onDeleteNode={onDeleteNode}
                  onOpenVideo={(title, url) => setSelectedVideo({ title, url })}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlowchartBranch({
  node,
  getChildren,
  onAddChildNode,
  onEditNode,
  onDeleteNode,
  onOpenVideo,
  isAdmin,
}: {
  node: GameplanNode;
  getChildren: (id: string) => GameplanNode[];
  onAddChildNode: (id: string) => void;
  onEditNode: (node: GameplanNode) => void;
  onDeleteNode: (id: string) => void;
  onOpenVideo: (title: string, url: string) => void;
  isAdmin: boolean;
}) {
  const children = getChildren(node.id);
  const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.position;

  return (
    <div className="flex items-start gap-4 sm:gap-8 relative group">
      {/* Node Flowchart Card */}
      <div
        className={`w-64 shrink-0 p-4 rounded-2xl border ${cfg.border} bg-surface-2/95 ${cfg.glow} space-y-2 relative transition-all duration-200 hover:scale-[1.02] hover:brightness-125 z-10`}
      >
        <div className="flex items-center justify-between gap-1">
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${cfg.color}`}>
            {cfg.badge}
          </span>
          <div className="flex items-center gap-1">
            {node.videoUrl && (
              <button
                onClick={() => onOpenVideo(node.title, node.videoUrl!)}
                className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-0.5 hover:bg-rose-500/30"
              >
                🎥
              </button>
            )}
            <button
              onClick={() => onEditNode(node)}
              className="p-1 text-muted hover:text-foreground text-[11px]"
              title="Éditer"
            >
              ✏️
            </button>
            {isAdmin && (
              <button
                onClick={() => onDeleteNode(node.id)}
                className="p-1 text-rose-400 hover:text-rose-300 text-[11px]"
                title="Supprimer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <h4 className="font-black text-sm text-foreground leading-snug">{node.title}</h4>

        {node.notes && (
          <p className="text-[11px] text-muted leading-tight line-clamp-3 bg-surface/50 p-1.5 rounded-lg border border-white/5">
            {node.notes}
          </p>
        )}

        <button
          onClick={() => onAddChildNode(node.id)}
          className="w-full mt-2 py-1.5 rounded-xl bg-surface hover:bg-border text-accent hover:text-white border border-accent/30 font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1"
        >
          <span>+ Ajouter une suite ➔</span>
        </button>
      </div>

      {/* Children Branches connected with SVG Flow Connector Lines */}
      {children.length > 0 && (
        <div className="flex items-center gap-4 sm:gap-6 relative">
          {/* Connector Arrow Line */}
          <div className="flex items-center text-muted/60 text-lg font-bold shrink-0">
            <svg className="w-8 h-6 text-accent/60 stroke-current" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          <div className="space-y-6">
            {children.map((child) => (
              <FlowchartBranch
                key={child.id}
                node={child}
                getChildren={getChildren}
                onAddChildNode={onAddChildNode}
                onEditNode={onEditNode}
                onDeleteNode={onDeleteNode}
                onOpenVideo={onOpenVideo}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
