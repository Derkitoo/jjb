"use client";

import { SectionTitle } from "@/components/Card";
import TechniquesTab from "@/components/TechniquesTab";

export default function TechniquesPage() {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Techniques & Gameplan ♟️"
        subtitle="Syllabus par ceintures et enchaînements tactiques de combat"
      />
      <TechniquesTab />
    </div>
  );
}
