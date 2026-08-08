"use client";

import { useState } from "react";

interface WaterCutProtocolModalProps {
  onClose: () => void;
  targetWeightKg?: number | null;
  competitionName?: string;
}

const DAYS = [
  {
    day: "J-6",
    title: "Chargement en Eau (Water Loading)",
    water: "6 Litres d'eau",
    sodium: "Normal (3-4g)",
    carbs: "Normal",
    notes: "Commencer à boire beaucoup d'eau pour activer les hormones natriurétiques (élimination rénale accrue).",
  },
  {
    day: "J-5 à J-4",
    title: "Peak Water Loading & Repas Propres",
    water: "7 à 8 Litres d'eau / jour",
    sodium: "Normal",
    carbs: "Modéré (réduire les fibres lourdes)",
    notes: "Conserver des urines très claires. Le corps se met en mode évacuation d'eau continue.",
  },
  {
    day: "J-3",
    title: "Chute de l'Eau & Coupure du Sel",
    water: "3 Litres d'eau",
    sodium: "ZÉRO SEL AJOUTÉ 🚫",
    carbs: "Bas (riz blanc, blanc de poulet)",
    notes: "Couper complètement le sel et le sodium. Le corps continue d'éliminer l'eau par réflexe hormonal.",
  },
  {
    day: "J-2",
    title: "Restriction Hydrique",
    water: "1.5 Litre d'eau",
    sodium: "Zéro sel",
    carbs: "Très bas",
    notes: "Repas très digestes et légers en volume. Pas de légumes crus ni d'aliments lourds dans l'estomac.",
  },
  {
    day: "J-1",
    title: "Déshydratation Finale & Transpiration",
    water: "0.5 Litre max (petites gorgées)",
    sodium: "Zéro sel",
    carbs: "Minimal",
    notes: "Bain chaud salé (sels d'Epsom) ou sauna doux 15-20 min si besoin pour éliminer les derniers 500g-1kg.",
  },
  {
    day: "Jour J - Pesée",
    title: "La Pesée Officielle ⚖️",
    water: "Pesée à jeun",
    sodium: "--",
    carbs: "--",
    notes: "Valider le poids sur la balance officielle avant de commencer immédiatement la réhydratation.",
  },
  {
    day: "Post-Pesée ⚡",
    title: "Protocole de Réhydratation Rapide",
    water: "1.5L à 2L de liquide réhydratant",
    sodium: "Électrolytes complets (Sodium + Potassium + Magnésium)",
    carbs: "Glucides rapides (Maltodextrine / Dextrose / Banane)",
    notes: "Ne pas boire 2L d'un coup : boire 500ml toutes les 20 min avec des électrolytes. Repas salé et digeste 2h avant le premier combat.",
  },
];

export function WaterCutProtocolModal({ onClose, targetWeightKg, competitionName }: WaterCutProtocolModalProps) {
  const [activeDay, setActiveDay] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              💧 Protocole de Water Cut Compétition
            </h3>
            {competitionName && (
              <p className="text-xs text-muted">
                Objectif : {targetWeightKg ? `${targetWeightKg} kg` : "Pesée"} ({competitionName})
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted text-sm font-semibold transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Tab navigation for Days */}
        <div className="flex gap-1 overflow-x-auto pb-2 shrink-0 no-scrollbar">
          {DAYS.map((d, index) => (
            <button
              key={d.day}
              onClick={() => setActiveDay(index)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeDay === index
                  ? "bg-accent text-white shadow-md"
                  : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {d.day}
            </button>
          ))}
        </div>

        {/* Active Day Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="bg-surface-2/80 p-4 rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
                {DAYS[activeDay].day}
              </span>
              <h4 className="font-bold text-sm text-foreground">{DAYS[activeDay].title}</h4>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs">
              <div className="bg-surface p-2.5 rounded-lg border border-border">
                <span className="block text-[10px] text-muted mb-0.5">🚰 Hydratation</span>
                <span className="font-bold text-blue-400">{DAYS[activeDay].water}</span>
              </div>
              <div className="bg-surface p-2.5 rounded-lg border border-border">
                <span className="block text-[10px] text-muted mb-0.5">🧂 Sodium (Sel)</span>
                <span className="font-bold text-amber-400">{DAYS[activeDay].sodium}</span>
              </div>
              <div className="bg-surface p-2.5 rounded-lg border border-border">
                <span className="block text-[10px] text-muted mb-0.5">🍚 Glucides</span>
                <span className="font-bold text-emerald-400">{DAYS[activeDay].carbs}</span>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed bg-surface/50 p-3 rounded-lg border border-border/50">
              💡 <strong className="text-foreground">Instructions : </strong> {DAYS[activeDay].notes}
            </p>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 space-y-1">
            <p className="font-bold">⚠️ Sécurité & Avertissement Santé :</p>
            <p>
              Le Water Cut est une déshydratation temporaire réservée aux compétiteurs avertis. Ne tentez pas une perte supérieure à 5% de votre poids de corps sans supervision médicale. Restez à l&apos;écoute de votre corps.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-surface-2 hover:bg-border text-foreground font-semibold text-xs rounded-full transition-colors"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
}
