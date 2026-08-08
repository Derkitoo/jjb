"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { useAdmin } from "@/lib/admin-context";
import { Card } from "@/components/Card";

export function AccessCard() {
  const { setAdminPin } = useData();
  const { hasPin, isAdmin, unlock, lock, markUnlocked } = useAdmin();
  const [pinInput, setPinInput] = useState("");
  const [confirmInput, setConfirmInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleCreatePin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pinInput.trim().length < 4) {
      setError("Choisis un code d'au moins 4 chiffres.");
      return;
    }
    if (pinInput !== confirmInput) {
      setError("Les deux codes ne correspondent pas.");
      return;
    }
    setAdminPin(pinInput.trim());
    markUnlocked();
    setPinInput("");
    setConfirmInput("");
  }

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!unlock(pinInput.trim())) {
      setError("Code incorrect.");
      return;
    }
    setPinInput("");
  }

  function handleRemovePin() {
    setAdminPin(null);
  }

  if (!hasPin) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-muted">
          Aucun verrouillage actif — tout le monde qui ouvre l&apos;app peut
          tout modifier, y compris supprimer. Configure un code pour passer en
          mode visiteur par défaut (lecture et ajout uniquement) et réserver
          les suppressions à toi (admin).
        </p>
        <form onSubmit={handleCreatePin} className="space-y-2">
          <input
            type="password"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Code (4 chiffres min.)"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            inputMode="numeric"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="Confirme le code"
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-accent">{error}</p>}
          <button
            type="submit"
            className="w-full h-11 rounded-full bg-surface-2 border border-border font-semibold"
          >
            Activer le verrouillage visiteur
          </button>
        </form>
        <p className="text-[11px] text-muted">
          ⚠️ Ce code est stocké tel quel sur cet appareil : un frein contre
          les suppressions accidentelles par un visiteur, pas un vrai système
          de sécurité.
        </p>
      </Card>
    );
  }

  if (isAdmin) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-accent-2 font-medium">
          Mode admin actif ✓ — suppressions autorisées.
        </p>
        <div className="flex gap-2">
          <button
            onClick={lock}
            className="flex-1 h-10 rounded-full bg-surface-2 border border-border font-semibold text-sm"
          >
            Repasser en visiteur
          </button>
          <button
            onClick={handleRemovePin}
            className="flex-1 h-10 rounded-full bg-surface-2 border border-border font-semibold text-sm text-accent"
          >
            Désactiver le verrouillage
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-3">
      <p className="text-sm text-muted">
        Mode visiteur actif — les suppressions sont désactivées. Entre le
        code admin pour les débloquer.
      </p>
      <form onSubmit={handleUnlock} className="flex gap-2">
        <input
          type="password"
          inputMode="numeric"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          placeholder="Code admin"
          className="flex-1 bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="shrink-0 h-10 px-4 rounded-full bg-accent-2 text-white font-semibold text-sm"
        >
          Déverrouiller
        </button>
      </form>
      {error && <p className="text-xs text-accent">{error}</p>}
    </Card>
  );
}
