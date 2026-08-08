"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Card } from "@/components/Card";
import { WaterCutProtocolModal } from "./WaterCutProtocolModal";

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function WeightCutCard() {
  const { weightCut, updateWeightCut, weighIns } = useData();
  const [name, setName] = useState(weightCut.competitionName);
  const [date, setDate] = useState(weightCut.competitionDate ?? "");
  const [target, setTarget] = useState(
    weightCut.targetWeightKg != null ? String(weightCut.targetWeightKg) : ""
  );
  const [notes, setNotes] = useState(weightCut.notes);
  const [saved, setSaved] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);

  const days = daysUntil(weightCut.competitionDate);
  const latestWeight = weighIns[0]?.weightKg;
  const delta =
    latestWeight != null && weightCut.targetWeightKg != null
      ? latestWeight - weightCut.targetWeightKg
      : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateWeightCut({
      competitionName: name.trim(),
      competitionDate: date || null,
      targetWeightKg: target.trim() ? Number(target) : null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveNotes() {
    if (notes !== weightCut.notes) updateWeightCut({ notes });
  }

  return (
    <Card className="space-y-4">
      {showProtocol && (
        <WaterCutProtocolModal
          onClose={() => setShowProtocol(false)}
          targetWeightKg={weightCut.targetWeightKg}
          competitionName={weightCut.competitionName}
        />
      )}

      {weightCut.competitionDate && (
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
          <div className="min-w-0">
            <div className="font-medium truncate">
              {weightCut.competitionName || "Prochaine compétition"}
            </div>
            <div className="text-xs text-muted">
              {new Date(weightCut.competitionDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-extrabold text-accent">
              {days == null
                ? "—"
                : days > 0
                ? `J-${days}`
                : days === 0
                ? "Jour J"
                : "Passée"}
            </div>
            {delta != null && (
              <div className="text-xs text-muted">
                {delta > 0
                  ? `${delta.toFixed(1)} kg à perdre`
                  : delta < 0
                  ? `${Math.abs(delta).toFixed(1)} kg de marge`
                  : "Au poids !"}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowProtocol(true)}
        className="w-full py-2.5 px-4 bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <span>💧 Voir le Protocole de Water Cut (J-6 à J-0)</span>
      </button>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="text-sm block">
          <span className="block text-muted mb-1">Compétition</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex : Open de Paris"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm block">
            <span className="block text-muted mb-1">Date de pesée</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
            />
          </label>
          <label className="text-sm block">
            <span className="block text-muted mb-1">Poids de pesée (kg)</span>
            <input
              type="number"
              step={0.1}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Ex : 76"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
            />
          </label>
        </div>
        <button
          type="submit"
          className="w-full h-11 rounded-full bg-surface-2 border border-border font-semibold"
        >
          {saved ? "Enregistré ✓" : "Enregistrer"}
        </button>
      </form>

      <label className="text-sm block">
        <span className="block text-muted mb-1">
          Plan hydratation / sodium (notes perso)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={3}
          placeholder="Ex : J-7 réduire le sel, J-2 charge en eau, J-1 restriction légère…"
          className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
        />
      </label>

      <p className="text-[11px] text-muted leading-relaxed">
        ⚠️ Une coupe de poids agressive comporte des risques réels
        (déshydratation, troubles du rythme cardiaque). Vas-y progressivement
        et fais-toi accompagner par ton coach ou un professionnel de santé
        pour toute coupe importante.
      </p>
    </Card>
  );
}
