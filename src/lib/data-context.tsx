"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import {
  AppData,
  Goals,
  MasteryStatus,
  Recipe,
  Technique,
  TrainingSession,
  WeighIn,
} from "./types";
import { SEED_RECIPES } from "./seed-recipes";
import { SEED_TECHNIQUES } from "./seed-techniques";

const STORAGE_KEY = "bjj-tracker:data:v1";

const DEFAULT_GOALS: Goals = {
  weeklySessionsTarget: null,
  targetWeightKg: null,
};

function emptyData(): AppData {
  return {
    sessions: [],
    recipes: SEED_RECIPES,
    weighIns: [],
    techniques: SEED_TECHNIQUES,
    goals: DEFAULT_GOALS,
  };
}

function readFromStorage(): AppData {
  if (typeof window === "undefined") return emptyData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      sessions: parsed.sessions ?? [],
      recipes:
        parsed.recipes && parsed.recipes.length > 0
          ? parsed.recipes
          : SEED_RECIPES,
      weighIns: parsed.weighIns ?? [],
      // Rétrocompatible : les exports/sauvegardes créés avant l'ajout des
      // techniques et objectifs n'ont pas ces champs.
      techniques:
        parsed.techniques && parsed.techniques.length > 0
          ? parsed.techniques
          : SEED_TECHNIQUES,
      goals: { ...DEFAULT_GOALS, ...parsed.goals },
    };
  } catch {
    return emptyData();
  }
}

function persistToStorage(d: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// --- Petit store externe (module-level) partagé par tous les composants ---
// getServerSnapshot renvoie toujours cette même référence : ça permet à
// useSyncExternalStore de détecter, côté client, le passage de "pas encore
// hydraté" à "données chargées depuis le localStorage" sans jamais appeler
// setState dans un effet.
const SERVER_SNAPSHOT: AppData = emptyData();
let currentData: AppData = SERVER_SNAPSHOT;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  currentData = readFromStorage();
}

function getSnapshot(): AppData {
  ensureInitialized();
  return currentData;
}

function getServerSnapshot(): AppData {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) {
      currentData = readFromStorage();
      listener();
    }
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function mutate(updater: AppData | ((d: AppData) => AppData)) {
  ensureInitialized();
  const next =
    typeof updater === "function"
      ? (updater as (d: AppData) => AppData)(currentData)
      : updater;
  currentData = next;
  persistToStorage(next);
  listeners.forEach((l) => l());
}

interface DataContextValue {
  ready: boolean;
  sessions: TrainingSession[];
  recipes: Recipe[];
  weighIns: WeighIn[];
  techniques: Technique[];
  goals: Goals;
  addSession: (s: Omit<TrainingSession, "id" | "createdAt">) => void;
  updateSession: (id: string, patch: Partial<TrainingSession>) => void;
  deleteSession: (id: string) => void;
  addRecipe: (r: Omit<Recipe, "id">) => void;
  updateRecipe: (id: string, patch: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addWeighIn: (w: Omit<WeighIn, "id">) => void;
  deleteWeighIn: (id: string) => void;
  setTechniqueStatus: (id: string, status: MasteryStatus) => void;
  addTechnique: (t: Omit<Technique, "id">) => void;
  deleteTechnique: (id: string) => void;
  updateGoals: (patch: Partial<Goals>) => void;
  exportData: () => void;
  importData: (json: string) => { ok: boolean; error?: string };
  resetData: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = data !== SERVER_SNAPSHOT;

  const addSession = useCallback((s: Omit<TrainingSession, "id" | "createdAt">) => {
    mutate((d) => ({
      ...d,
      sessions: [
        { ...s, id: uid(), createdAt: new Date().toISOString() },
        ...d.sessions,
      ].sort((a, b) => b.date.localeCompare(a.date)),
    }));
  }, []);

  const updateSession = useCallback((id: string, patch: Partial<TrainingSession>) => {
    mutate((d) => ({
      ...d,
      sessions: d.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const deleteSession = useCallback((id: string) => {
    mutate((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));
  }, []);

  const addRecipe = useCallback((r: Omit<Recipe, "id">) => {
    mutate((d) => ({ ...d, recipes: [{ ...r, id: uid() }, ...d.recipes] }));
  }, []);

  const updateRecipe = useCallback((id: string, patch: Partial<Recipe>) => {
    mutate((d) => ({
      ...d,
      recipes: d.recipes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    mutate((d) => ({ ...d, recipes: d.recipes.filter((r) => r.id !== id) }));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    mutate((d) => ({
      ...d,
      recipes: d.recipes.map((r) =>
        r.id === id ? { ...r, favorite: !r.favorite } : r
      ),
    }));
  }, []);

  const addWeighIn = useCallback((w: Omit<WeighIn, "id">) => {
    mutate((d) => ({
      ...d,
      weighIns: [{ ...w, id: uid() }, ...d.weighIns].sort((a, b) =>
        b.date.localeCompare(a.date)
      ),
    }));
  }, []);

  const deleteWeighIn = useCallback((id: string) => {
    mutate((d) => ({ ...d, weighIns: d.weighIns.filter((w) => w.id !== id) }));
  }, []);

  const setTechniqueStatus = useCallback((id: string, status: MasteryStatus) => {
    mutate((d) => ({
      ...d,
      techniques: d.techniques.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    }));
  }, []);

  const addTechnique = useCallback((t: Omit<Technique, "id">) => {
    mutate((d) => ({
      ...d,
      techniques: [...d.techniques, { ...t, id: uid() }],
    }));
  }, []);

  const deleteTechnique = useCallback((id: string) => {
    mutate((d) => ({
      ...d,
      techniques: d.techniques.filter((t) => t.id !== id),
    }));
  }, []);

  const updateGoals = useCallback((patch: Partial<Goals>) => {
    mutate((d) => ({ ...d, goals: { ...d.goals, ...patch } }));
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(currentData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `bjj-tracker-export-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as Partial<AppData>;
      if (!parsed || typeof parsed !== "object") {
        return { ok: false, error: "Format JSON invalide." };
      }
      mutate({
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        recipes:
          Array.isArray(parsed.recipes) && parsed.recipes.length > 0
            ? parsed.recipes
            : SEED_RECIPES,
        weighIns: Array.isArray(parsed.weighIns) ? parsed.weighIns : [],
        techniques:
          Array.isArray(parsed.techniques) && parsed.techniques.length > 0
            ? parsed.techniques
            : SEED_TECHNIQUES,
        goals: { ...DEFAULT_GOALS, ...parsed.goals },
      });
      return { ok: true };
    } catch {
      return { ok: false, error: "Impossible de lire ce fichier JSON." };
    }
  }, []);

  const resetData = useCallback(() => {
    mutate(emptyData());
  }, []);

  const value: DataContextValue = {
    ready,
    sessions: data.sessions,
    recipes: data.recipes,
    weighIns: data.weighIns,
    techniques: data.techniques,
    goals: data.goals,
    addSession,
    updateSession,
    deleteSession,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    addWeighIn,
    deleteWeighIn,
    setTechniqueStatus,
    addTechnique,
    deleteTechnique,
    updateGoals,
    exportData,
    importData,
    resetData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
