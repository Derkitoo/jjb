"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
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

const STATUS_ORDER: MasteryStatus[] = ["a_decouvrir", "en_cours", "maitrisee"];

const CATEGORY_OPTIONS = Object.entries(TECHNIQUE_CATEGORY_LABELS) as [
  TechniqueCategory,
  string
][];

export default function TechniquesTab() {
  const { techniques, setTechniqueStatus, addTechnique, deleteTechnique } =
    useData();
  const [beltFilter, setBeltFilter] = useState<Belt | "all">("all");
  const [showForm, setShowForm] = useState(false);

  const belts = beltFilter === "all" ? BELT_ORDER : [beltFilter];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted flex-1">
          Coche ta progression technique, ceinture par ceinture. Checklist
          personnelle — pas un référentiel officiel de passage de grade.
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 h-10 px-4 rounded-full bg-surface-2 border border-border font-semibold text-sm"
        >
          {showForm ? "Fermer" : "+ Technique"}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <FilterChip
          label="Toutes"
          active={beltFilter === "all"}
          onClick={() => setBeltFilter("all")}
        />
        {BELT_ORDER.map((belt) => (
          <FilterChip
            key={belt}
            label={BELT_LABELS[belt]}
            active={beltFilter === belt}
            onClick={() => setBeltFilter(belt)}
          />
        ))}
      </div>

      {showForm && (
        <AddTechniqueForm
          onSubmit={(t) => {
            addTechnique(t);
            setShowForm(false);
          }}
        />
      )}

      <div className="space-y-6">
        {belts.map((belt) => (
          <BeltGroup
            key={belt}
            belt={belt}
            techniques={techniques.filter((t) => t.belt === belt)}
            onStatusChange={setTechniqueStatus}
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
  onStatusChange,
  onDelete,
}: {
  belt: Belt;
  techniques: Technique[];
  onStatusChange: (id: string, status: MasteryStatus) => void;
  onDelete: (id: string) => void;
}) {
  const mastered = techniques.filter((t) => t.status === "maitrisee").length;
  const total = techniques.length;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">{BELT_LABELS[belt]}</h2>
        <span className="text-xs text-muted">
          {mastered}/{total} maîtrisées
        </span>
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-accent-2 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-2">
        {techniques.map((t) => (
          <TechniqueRow
            key={t.id}
            technique={t}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function TechniqueRow({
  technique,
  onStatusChange,
  onDelete,
}: {
  technique: Technique;
  onStatusChange: (id: string, status: MasteryStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="font-medium text-sm">{technique.name}</div>
          <div className="text-xs text-muted">
            {TECHNIQUE_CATEGORY_LABELS[technique.category]}
            {technique.custom && " · perso"}
          </div>
        </div>
        {technique.custom && (
          <button
            onClick={() => onDelete(technique.id)}
            className="text-xs text-accent shrink-0"
          >
            Suppr.
          </button>
        )}
      </div>
      <div className="flex gap-1.5">
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(technique.id, status)}
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
    </Card>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-accent-2 border-accent-2 text-white"
          : "bg-surface-2 border-border text-muted"
      }`}
    >
      {label}
    </button>
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
