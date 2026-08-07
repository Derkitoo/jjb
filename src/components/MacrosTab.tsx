"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Card } from "@/components/Card";
import { computeDailyTargets } from "@/lib/nutrition";
import {
  ACTIVITY_LABELS,
  ActivityLevel,
  NUTRITION_GOAL_LABELS,
  NutritionGoalType,
  Sex,
} from "@/lib/types";

const ACTIVITY_OPTIONS = Object.entries(ACTIVITY_LABELS) as [
  ActivityLevel,
  string
][];
const GOAL_OPTIONS = Object.entries(NUTRITION_GOAL_LABELS) as [
  NutritionGoalType,
  string
][];

export default function MacrosTab() {
  const { nutritionProfile, updateNutritionProfile, weighIns, addWeighIn } =
    useData();
  const [heightCm, setHeightCm] = useState(
    nutritionProfile.heightCm != null ? String(nutritionProfile.heightCm) : ""
  );
  const [age, setAge] = useState(
    nutritionProfile.age != null ? String(nutritionProfile.age) : ""
  );
  const [sex, setSex] = useState<Sex | "">(nutritionProfile.sex ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    nutritionProfile.activityLevel
  );
  const [goal, setGoal] = useState<NutritionGoalType>(nutritionProfile.goal);
  const [saved, setSaved] = useState(false);
  const [quickWeight, setQuickWeight] = useState("");

  const latestWeight = weighIns[0]?.weightKg;
  const targets = computeDailyTargets(latestWeight, nutritionProfile);
  const profileComplete = Boolean(
    nutritionProfile.heightCm && nutritionProfile.age && nutritionProfile.sex
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateNutritionProfile({
      heightCm: heightCm.trim() ? Number(heightCm) : null,
      age: age.trim() ? Number(age) : null,
      sex: sex || null,
      activityLevel,
      goal,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleQuickWeight(e: React.FormEvent) {
    e.preventDefault();
    if (!quickWeight.trim()) return;
    addWeighIn({
      date: new Date().toISOString().slice(0, 10),
      weightKg: Number(quickWeight),
    });
    setQuickWeight("");
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">
        Estimation basée sur ton dernier poids enregistré (formule
        Mifflin-St Jeor). Un ordre de grandeur pour t&apos;orienter, pas un
        avis nutritionnel personnalisé — vois avec un pro pour un suivi fin.
      </p>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm block">
              <span className="block text-muted mb-1">Taille (cm)</span>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="Ex : 178"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
              />
            </label>
            <label className="text-sm block">
              <span className="block text-muted mb-1">Âge</span>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex : 30"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
              />
            </label>
          </div>

          <label className="text-sm block">
            <span className="block text-muted mb-1">Sexe</span>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
            >
              <option value="">Sélectionner…</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </label>

          <label className="text-sm block">
            <span className="block text-muted mb-1">Niveau d&apos;activité</span>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
            >
              {ACTIVITY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm block">
            <span className="block text-muted mb-1">Objectif</span>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as NutritionGoalType)}
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
            >
              {GOAL_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="w-full h-11 rounded-full bg-accent-2 text-white font-semibold"
          >
            {saved ? "Profil enregistré ✓" : "Calculer mes besoins"}
          </button>
        </form>
      </Card>

      {targets ? (
        <Card className="space-y-3">
          <div className="text-sm font-semibold">
            Tes besoins estimés · basé sur {latestWeight} kg (dernière pesée)
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <MacroChip label="kcal/j" value={targets.kcal} />
            <MacroChip label="Prot (g)" value={targets.protein} />
            <MacroChip label="Gluc (g)" value={targets.carbs} />
            <MacroChip label="Lip (g)" value={targets.fat} />
          </div>
        </Card>
      ) : !profileComplete ? (
        <Card className="text-sm text-muted">
          Renseigne ta taille, ton âge et ton sexe ci-dessus pour obtenir une
          estimation.
        </Card>
      ) : (
        <Card className="space-y-3">
          <p className="text-sm text-muted">
            Profil enregistré ✓ — il ne manque plus qu&apos;un poids actuel
            pour calculer tes besoins :
          </p>
          <form onSubmit={handleQuickWeight} className="flex gap-2">
            <input
              type="number"
              step={0.1}
              value={quickWeight}
              onChange={(e) => setQuickWeight(e.target.value)}
              placeholder="Ton poids (kg)"
              className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="shrink-0 h-10 px-4 rounded-full bg-accent-2 text-white font-semibold text-sm"
            >
              Ajouter
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}

function MacroChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-2 border border-border rounded-lg py-1.5">
      <div className="font-semibold text-sm">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  );
}
