"use client";

import Link from "next/link";
import { Card } from "@/components/Card";

interface QuickActionModalProps {
  onClose: () => void;
}

export function QuickActionModal({ onClose }: QuickActionModalProps) {
  const ACTIONS = [
    {
      href: "/timer",
      title: "Lancer un Chrono DBZ",
      desc: "Minuteur de rounds avec sons d'anime mythiques",
      icon: "⏱️",
      color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    },
    {
      href: "/sessions",
      title: "Enregistrer une Séance JJB",
      desc: "Note tes sparrings, taps et techniques travaillées",
      icon: "🥋",
      color: "border-accent/40 bg-accent/10 text-accent",
    },
    {
      href: "/workout",
      title: "Enregistrer du Renforcement",
      desc: "Note ta séance de musculation ou prépa physique",
      icon: "🏋️",
      color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    },
    {
      href: "/settings",
      title: "Ajouter une Pesée de Poids",
      desc: "Suis ta courbe de poids pour la compétition",
      icon: "⚖️",
      color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl shadow-black/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-base text-foreground">
            <span className="text-accent text-lg">⚡</span>
            <span>Actions Rapides</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border text-muted hover:text-foreground font-bold flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              onClick={onClose}
              className={`p-3.5 rounded-2xl border ${a.color} transition-all duration-200 flex items-center gap-3 active:scale-95 hover:brightness-125`}
            >
              <span className="text-2xl p-2 rounded-xl bg-surface/60 border border-white/10">
                {a.icon}
              </span>
              <div>
                <h4 className="font-bold text-sm text-foreground">{a.title}</h4>
                <p className="text-xs text-muted leading-tight mt-0.5">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
