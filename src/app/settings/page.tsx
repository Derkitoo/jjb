"use client";

import { useRef, useState } from "react";
import { useData } from "@/lib/data-context";
import { Card, SectionTitle } from "@/components/Card";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SettingsPage() {
  const {
    ready,
    weighIns,
    addWeighIn,
    deleteWeighIn,
    exportData,
    importData,
    resetData,
  } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [weightDate, setWeightDate] = useState(todayISO());
  const [weightKg, setWeightKg] = useState(80);
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (!ready) return <p className="text-muted text-sm">Chargement…</p>;

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importData(String(reader.result));
      setImportMessage(
        result.ok
          ? "Import réussi ✓"
          : result.error ?? "Erreur lors de l'import."
      );
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleAddWeighIn(e: React.FormEvent) {
    e.preventDefault();
    addWeighIn({ date: weightDate, weightKg });
    setWeightDate(todayISO());
  }

  return (
    <div className="space-y-6">
      <SectionTitle title="Réglages" subtitle="Tes données restent sur cet appareil" />

      <div>
        <h2 className="font-semibold mb-2">Suivi du poids</h2>
        <Card className="space-y-3">
          <form onSubmit={handleAddWeighIn} className="flex items-end gap-2">
            <label className="text-sm flex-1">
              <span className="block text-muted mb-1">Date</span>
              <input
                type="date"
                value={weightDate}
                onChange={(e) => setWeightDate(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
              />
            </label>
            <label className="text-sm flex-1">
              <span className="block text-muted mb-1">Poids (kg)</span>
              <input
                type="number"
                step={0.1}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="h-10 px-4 rounded-full bg-accent-2 text-white font-semibold text-sm"
            >
              Ajouter
            </button>
          </form>

          {weighIns.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-border">
              {weighIns.slice(0, 6).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted">
                    {new Date(w.date).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="font-medium">{w.weightKg} kg</span>
                  <button
                    onClick={() => deleteWeighIn(w.id)}
                    className="text-xs text-accent"
                  >
                    Suppr.
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Sauvegarde des données</h2>
        <Card className="space-y-3">
          <p className="text-sm text-muted">
            Tes séances, recettes et suivi de poids sont stockés uniquement
            dans ce navigateur. Exporte régulièrement un fichier JSON pour ne
            rien perdre ou pour transférer tes données sur un autre appareil.
          </p>
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="flex-1 h-11 rounded-full bg-accent text-white font-semibold text-sm"
            >
              Exporter (JSON)
            </button>
            <button
              onClick={handleImportClick}
              className="flex-1 h-11 rounded-full bg-surface-2 border border-border font-semibold text-sm"
            >
              Importer
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {importMessage && (
            <p className="text-xs text-muted">{importMessage}</p>
          )}
        </Card>
      </div>

      <div>
        <h2 className="font-semibold mb-2 text-accent">Zone danger</h2>
        <Card className="space-y-3">
          {!confirmingReset ? (
            <button
              onClick={() => setConfirmingReset(true)}
              className="text-sm text-accent font-medium"
            >
              Réinitialiser toutes les données
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted">
                Supprimer définitivement toutes les séances, recettes perso et
                pesées ? Pense à exporter avant si besoin.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    resetData();
                    setConfirmingReset(false);
                  }}
                  className="h-10 px-4 rounded-full bg-accent text-white font-semibold text-sm"
                >
                  Oui, tout supprimer
                </button>
                <button
                  onClick={() => setConfirmingReset(false)}
                  className="h-10 px-4 rounded-full bg-surface-2 border border-border font-semibold text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
