"use client";

import { SectionTitle } from "@/components/Card";
import { GameplanTab } from "@/components/GameplanTab";

export default function GameplanPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Mon Gameplan Tactique ♟️"
        subtitle="Construis tes séquences de combat personnalisées (Positions, Balayages & Soumissions)"
      />
      <GameplanTab />
    </div>
  );
}
