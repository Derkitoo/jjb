"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useData } from "./data-context";

// État de déverrouillage éphémère (remis à zéro à chaque rechargement) :
// tant qu'aucun code n'est configuré (hasPin = false), tout le monde a un
// accès complet. Une fois un code défini dans Réglages, l'app démarre en
// mode visiteur et il faut le saisir pour repasser en mode admin.
interface AdminContextValue {
  hasPin: boolean;
  isAdmin: boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
  /** À utiliser juste après avoir créé/changé le code : évite de se
   * retrouver soi-même verrouillé en visiteur juste après l'avoir défini. */
  markUnlocked: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { security } = useData();
  const [unlocked, setUnlocked] = useState(false);
  const hasPin = Boolean(security.adminPin);
  const isAdmin = !hasPin || unlocked;

  const unlock = useCallback(
    (pin: string) => {
      if (security.adminPin != null && pin === security.adminPin) {
        setUnlocked(true);
        return true;
      }
      return false;
    },
    [security.adminPin]
  );

  const lock = useCallback(() => setUnlocked(false), []);
  const markUnlocked = useCallback(() => setUnlocked(true), []);

  const value: AdminContextValue = {
    hasPin,
    isAdmin,
    unlock,
    lock,
    markUnlocked,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within an AdminProvider");
  return ctx;
}
