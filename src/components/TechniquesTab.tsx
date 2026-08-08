"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { useAdmin } from "@/lib/admin-context";
import { Card } from "@/components/Card";
import {
  BELT_LABELS,
  BELT_ORDER,
  Belt,
  MASTERY_LABELS,
  MasteryStatus,
  TECHNIQUE_CATEGORY_LABELS,
  Technique,
  TechniqueCategory,
} from "@/lib/types";
import { GameplanTab } from "./GameplanTab";
import { VideoPreviewModal } from "./VideoPreviewModal";

const STATUS_ORDER: MasteryStatus[] = ["a_decouvrir", "en_cours", "maitrisee"];

const STATUS_DOT: Record<MasteryStatus, string> = {
  a_decouvrir: "bg-transparent border border-muted",
  en_cours: "bg-amber-600 border border-amber-600",
  maitrisee: "bg-accent-2 border border-accent-2",
};

const CATEGORY_OPTIONS = Object.entries(TECHNIQUE_CATEGORY_LABELS) as [
  TechniqueCategory,
  string
][];

export default function TechniquesTab() {
  const { techniques, updateTechnique, addTechnique, deleteTechnique } =
    useData();
  const [beltFilter, setBeltFilter] = useState<Belt | "all">("all");
  const [showForm, setShowForm] = useState(false);

  const belts = beltFilter === "all" ? BELT_ORDER : [beltFilter];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted flex-1">
              Checklist personnelle — pas un référentiel officiel de passage de
              grade.
            </p>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="shrink-0 h-9 px-3 rounded-full bg-surface-2 border border-border font-semibold text-xs"
            >
              {showForm ? "Fermer" : "+ Technique"}
            </button>
          </div>

          <select
            value={beltFilter}
            onChange={(e) => setBeltFilter(e.target.value as Belt | "all")}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Toutes les ceintures</option>
            {BELT_ORDER.map((belt) => (
          <option key={belt} value={belt}>
            {BELT_LABELS[belt]}
          </option>
        ))}
      </select>

      {showForm && (
        <AddTechniqueForm
          onSubmit={(t) => {
            addTechnique(t);
            setShowForm(false);
          }}
        />
      )}

      <div className="space-y-3">
        {belts.map((belt) => (
          <BeltGroup
            key={belt}
            belt={belt}
            techniques={techniques.filter((t) => t.belt === belt)}
            defaultOpen={beltFilter !== "all"}
            onUpdate={updateTechnique}
            onDelete={deleteTechnique}
          />
        ))}
      </div>
    </div>
  );
}

function BeltGroup({
  belt,
  techniques,
  defaultOpen,
  onUpdate,
  onDelete,
}: {
  belt: Belt;
  techniques: Technique[];
  defaultOpen: boolean;
  onUpdate: (id: string, patch: Partial<Technique>) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const mastered = techniques.filter((t) => t.status === "maitrisee").length;
  const total = techniques.length;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <Card className="p-0 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{BELT_LABELS[belt]}</span>
            <span className="text-xs text-muted shrink-0 ml-2">
              {mastered}/{total}
            </span>
          </div>
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-accent-2 transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="text-muted text-xs shrink-0">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-border divide-y divide-border">
          {techniques.map((t) => (
            <TechniqueRow
              key={t.id}
              technique={t}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function TechniqueRow({
  technique,
  onUpdate,
  onDelete,
}: {
  technique: Technique;
  onUpdate: (id: string, patch: Partial<Technique>) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [noteDraft, setNoteDraft] = useState(technique.notes ?? "");
  const [videoDraft, setVideoDraft] = useState(technique.videoUrl ?? "");
  const { isAdmin } = useAdmin();

  function saveNote() {
    if (noteDraft !== (technique.notes ?? "")) {
      onUpdate(technique.id, { notes: noteDraft });
    }
  }

  function saveVideo() {
    if (videoDraft !== (technique.videoUrl ?? "")) {
      onUpdate(technique.id, { videoUrl: videoDraft.trim() });
    }
  }

  return (
    <div className="px-4 py-2.5">
      {showVideoModal && technique.videoUrl && (
        <VideoPreviewModal
          url={technique.videoUrl}
          title={technique.name}
          onClose={() => setShowVideoModal(false)}
        />
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 text-left"
      >
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[technique.status]}`}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">
            {technique.name}
            {technique.videoUrl && " 🎥"}
          </div>
          <div className="text-xs text-muted truncate">
            {TECHNIQUE_CATEGORY_LABELS[technique.category]}
            {technique.notes && ` · ${technique.notes}`}
          </div>
        </div>
        <span className="text-xs text-muted shrink-0">
          {MASTERY_LABELS[technique.status]}
        </span>
      </button>

      {open && (
        <div className="mt-3 pl-[1.375rem] space-y-3">
          <div className="flex gap-1.5">
            {STATUS_ORDER.map((status) => (
              <button
                key={status}
                onClick={() => onUpdate(technique.id, { status })}
                className={`flex-1 h-8 rounded-lg text-xs font-medium border transition-colors ${
                  technique.status === status
                    ? status === "maitrisee"
                      ? "bg-accent-2 border-accent-2 text-white"
                      : status === "en_cours"
                      ? "bg-amber-600 border-amber-600 text-white"
                      : "bg-surface-2 border-border text-foreground"
                    : "bg-transparent border-border text-muted"
                }`}
              >
                {MASTERY_LABELS[status]}
              </button>
            ))}
          </div>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            onBlur={saveNote}
            rows={2}
            placeholder="Note perso : détail, repère, sensation…"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={videoDraft}
              onChange={(e) => setVideoDraft(e.target.value)}
              onBlur={saveVideo}
              placeholder="Lien vidéo (YouTube, Instagram…)"
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
            />
            {technique.videoUrl && (
              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                className="shrink-0 px-2.5 py-1.5 bg-accent-2/20 hover:bg-accent-2 text-accent-2 hover:text-white rounded-lg text-xs font-semibold transition-all"
              >
                ▶ Lecteur
              </button>
            )}
          </div>
          {technique.custom && isAdmin && (
            <button
              onClick={() => onDelete(technique.id)}
              className="text-xs text-accent font-medium"
            >
              Supprimer cette technique
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AddTechniqueForm({
  onSubmit,
}: {
  onSubmit: (t: Omit<Technique, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [belt, setBelt] = useState<Belt>("blanche");
  const [category, setCategory] = useState<TechniqueCategory>("garde");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      belt,
      category,
      status: "a_decouvrir",
      custom: true,
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="text-sm block">
          <span className="block text-muted mb-1">Nom de la technique</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm block">
            <span className="block text-muted mb-1">Ceinture</span>
            <select
              value={belt}
              onChange={(e) => setBelt(e.target.value as Belt)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
            >
              {BELT_ORDER.map((b) => (
                <option key={b} value={b}>
                  {BELT_LABELS[b]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm block">
            <span className="block text-muted mb-1">Catégorie</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TechniqueCategory)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
            >
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="w-full h-11 rounded-full bg-surface-2 border border-border font-semibold"
        >
          Ajouter la technique
        </button>
      </form>
    </Card>
  );
}
