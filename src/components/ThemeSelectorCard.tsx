"use client";

import { useData } from "@/lib/data-context";
import { Card } from "@/components/Card";
import { ThemeId } from "@/lib/types";

const THEMES: {
  id: ThemeId;
  name: string;
  desc: string;
  badgeBg: string;
  accentBg: string;
  accent2Bg: string;
}[] = [
  {
    id: "samurai",
    name: "BJJ Samurai",
    desc: "Rouge Crimson & Émeraude (Mode Sombre Classique)",
    badgeBg: "bg-[#0b0d12] border-[#283044]",
    accentBg: "bg-[#f43f5e]",
    accent2Bg: "bg-[#10b981]",
  },
  {
    id: "ronin",
    name: "Midnight Ronin",
    desc: "Cyan Électrique & Ambre (Nuit Épurée)",
    badgeBg: "bg-[#090d16] border-[#26334d]",
    accentBg: "bg-[#06b6d4]",
    accent2Bg: "bg-[#f59e0b]",
  },
  {
    id: "gold",
    name: "Imperial Gold",
    desc: "Or Champion & Noir OLED (Luxe)",
    badgeBg: "bg-[#050505] border-[#2c2c2c]",
    accentBg: "bg-[#eab308]",
    accent2Bg: "bg-[#ef4444]",
  },
  {
    id: "cyber",
    name: "Cyber Grappler",
    desc: "Neon Magenta & Cyan (Ambiance Cyberpunk)",
    badgeBg: "bg-[#0a0814] border-[#312852]",
    accentBg: "bg-[#d946ef]",
    accent2Bg: "bg-[#06b6d4]",
  },
];

export function ThemeSelectorCard() {
  const { theme, updateTheme } = useData();

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          🎨 Thème & Palette de Couleurs
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Sélectionne l&apos;ambiance visuelle de ton application
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {THEMES.map((t) => {
          const isActive = (theme || "samurai") === t.id;
          return (
            <button
              key={t.id}
              onClick={() => updateTheme(t.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 active:scale-95 ${
                isActive
                  ? "bg-surface-2 border-accent shadow-lg shadow-accent/10 ring-1 ring-accent"
                  : "bg-surface-2/50 border-border hover:border-accent/40 hover:bg-surface-2"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground flex items-center gap-2">
                  {t.name}
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full bg-accent text-white font-extrabold text-[10px]">
                      ACTIF
                    </span>
                  )}
                </span>

                {/* Color preview dots */}
                <div className="flex items-center gap-1.5 p-1 rounded-full bg-surface border border-border">
                  <span className={`w-3.5 h-3.5 rounded-full ${t.accentBg}`} />
                  <span className={`w-3.5 h-3.5 rounded-full ${t.accent2Bg}`} />
                </div>
              </div>

              <p className="text-[11px] text-muted leading-relaxed">{t.desc}</p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
