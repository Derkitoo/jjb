"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Card } from "@/components/Card";
import { BELT_LABELS, Belt } from "@/lib/types";

const BELT_COLORS: Record<Belt, { bg: string; text: string; border: string; barBg: string }> = {
  blanche: { bg: "bg-neutral-100", text: "text-neutral-900", border: "border-neutral-300", barBg: "bg-neutral-950" },
  bleue: { bg: "bg-blue-600", text: "text-white", border: "border-blue-700", barBg: "bg-neutral-950" },
  violette: { bg: "bg-purple-700", text: "text-white", border: "border-purple-800", barBg: "bg-neutral-950" },
  marron: { bg: "bg-amber-900", text: "text-white", border: "border-amber-950", barBg: "bg-neutral-950" },
  noire: { bg: "bg-neutral-950", text: "text-white", border: "border-neutral-800", barBg: "bg-red-700" },
};

export function BeltGradeCard() {
  const { userGrade, updateUserGrade, sessions } = useData();
  const [editing, setEditing] = useState(false);

  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMin, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const currentBelt: Belt = userGrade?.belt ?? "blanche";
  const config = BELT_COLORS[currentBelt];

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          🥋 Grade & Barrettes (Stripes)
        </h3>
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs text-accent font-semibold hover:underline"
        >
          {editing ? "Terminer" : "Modifier grade"}
        </button>
      </div>

      {/* Visual BJJ Belt representation */}
      <div className="relative w-full h-14 rounded-xl overflow-hidden shadow-lg border border-border flex items-center justify-between px-4 transition-all">
        {/* Belt main color */}
        <div className={`absolute inset-0 ${config.bg} ${config.border}`} />

        {/* Belt Label & Hours info */}
        <div className="relative z-10 flex items-center gap-3">
          <span className={`font-black text-base uppercase tracking-wider ${config.text}`}>
            {BELT_LABELS[currentBelt]}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-black/30 text-white/90 backdrop-blur-sm`}>
            {userGrade.stripes} stripe{userGrade.stripes > 1 ? "s" : ""}
          </span>
        </div>

        {/* Rank Bar (Black bar or Red bar for Black Belt) + White Stripes */}
        <div className={`relative z-10 h-full w-24 ${config.barBg} flex items-center justify-evenly px-2 border-l-2 border-r-2 border-black/40 shadow-inner`}>
          {[1, 2, 3, 4].map((index) => {
            const hasStripe = index <= userGrade.stripes;
            return (
              <div
                key={index}
                className={`w-2.5 h-10 rounded-sm transition-all shadow-sm ${
                  hasStripe
                    ? "bg-white border border-neutral-300 shadow-white/50"
                    : "bg-transparent border border-white/10"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Mat time statistics */}
      <div className="flex items-center justify-between text-xs text-muted pt-1">
        <span>Cumul sur le tatami : <strong className="text-foreground">{totalHours}h</strong> ({sessions.length} séances)</span>
        {userGrade.promoDate && <span>Grade depuis le {userGrade.promoDate}</span>}
      </div>

      {/* Grade edit controls */}
      {editing && (
        <div className="p-4 bg-surface-2 border border-border rounded-xl space-y-3 text-xs animate-fadeIn">
          <div>
            <label className="block text-muted mb-1 font-semibold">Ceinture actuelle :</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(["blanche", "bleue", "violette", "marron", "noire"] as Belt[]).map((b) => (
                <button
                  key={b}
                  onClick={() => updateUserGrade({ belt: b })}
                  className={`py-2 rounded-lg font-bold text-[11px] capitalize border transition-all ${
                    userGrade.belt === b
                      ? "bg-accent text-white border-accent shadow-md"
                      : "bg-surface border-border text-muted hover:text-foreground"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-muted mb-1 font-semibold">Barrettes (Stripes) :</label>
            <div className="grid grid-cols-5 gap-1.5">
              {([0, 1, 2, 3, 4] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateUserGrade({ stripes: s })}
                  className={`py-2 rounded-lg font-bold text-xs border transition-all ${
                    userGrade.stripes === s
                      ? "bg-accent-2 text-white border-accent-2 shadow-md"
                      : "bg-surface border-border text-muted hover:text-foreground"
                  }`}
                >
                  {s === 0 ? "Aucune" : `${s} stripe${s > 1 ? "s" : ""}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
