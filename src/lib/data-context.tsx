"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import {
  AppData,
  ExercisePR,
  GameplanNode,
  Goals,
  MatchLog,
  NutritionProfile,
  Recipe,
  Security,
  Technique,
  ThemeId,
  TrainingSession,
  UserGrade,
  WeighIn,
  WeightCut,
  WorkoutSession,
} from "./types";
import { SEED_RECIPES } from "./seed-recipes";
import { SEED_TECHNIQUES } from "./seed-techniques";

const STORAGE_KEY = "bjj-tracker:data:v1";

export const SEED_GAMEPLAN: GameplanNode[] = [
  {
    id: "gp-1",
    title: "Garde Fermée",
    type: "position",
    parentId: null,
    notes: "Posture de départ classique, casser la posture de l'adversaire.",
  },
  {
    id: "gp-2",
    title: "Renversement Ciseaux (Scissor Sweep)",
    type: "transition",
    parentId: "gp-1",
    notes: "Contrôle manche + col opposé, ouvrir le genou.",
  },
  {
    id: "gp-3",
    title: "Montée (Mount)",
    type: "position",
    parentId: "gp-2",
    notes: "Stabiliser 3 secondes, peser sur la poitrine.",
  },
  {
    id: "gp-4",
    title: "Clé de Bras (Armbar)",
    type: "submission",
    parentId: "gp-3",
    notes: "Isoler le coude, passer la jambe par-dessus la tête.",
  },
];

const DEFAULT_USER_GRADE: UserGrade = {
  belt: "blanche",
  stripes: 0,
};

const DEFAULT_GOALS: Goals = {
  weeklySessionsTarget: 4,
  targetWeightKg: 76,
};

const DEFAULT_NUTRITION_PROFILE: NutritionProfile = {
  heightCm: null,
  age: null,
  sex: null,
  activityLevel: "modere",
  goal: "maintien",
};

const DEFAULT_WEIGHT_CUT: WeightCut = {
  competitionName: "",
  competitionDate: null,
  targetWeightKg: null,
  notes: "",
};

const DEFAULT_SECURITY: Security = {
  adminPin: null,
};

const SEED_PRS: ExercisePR[] = [
  { id: "pr-1", exerciseName: "Soulevé de Terre (Deadlift)", maxWeightKg: 140, date: "2026-08-01" },
  { id: "pr-2", exerciseName: "Tractions Lestées (Gi Pull-ups)", maxWeightKg: 20, maxReps: 12, date: "2026-08-03" },
  { id: "pr-3", exerciseName: "Kettlebell Swings (24kg)", maxReps: 30, date: "2026-08-05" },
  { id: "pr-4", exerciseName: "Turkish Get-Up", maxWeightKg: 24, date: "2026-08-07" },
];

function emptyData(): AppData {
  return {
    sessions: [],
    workoutSessions: [],
    exercisePRs: SEED_PRS,
    recipes: SEED_RECIPES,
    weighIns: [],
    techniques: SEED_TECHNIQUES,
    gameplanNodes: SEED_GAMEPLAN,
    userGrade: DEFAULT_USER_GRADE,
    matchLogs: [],
    goals: DEFAULT_GOALS,
    nutritionProfile: DEFAULT_NUTRITION_PROFILE,
    weightCut: DEFAULT_WEIGHT_CUT,
    security: DEFAULT_SECURITY,
    theme: "samurai",
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
      workoutSessions: parsed.workoutSessions ?? [],
      exercisePRs:
        parsed.exercisePRs && parsed.exercisePRs.length > 0
          ? parsed.exercisePRs
          : SEED_PRS,
      recipes:
        parsed.recipes && parsed.recipes.length > 0
          ? parsed.recipes
          : SEED_RECIPES,
      weighIns: parsed.weighIns ?? [],
      techniques:
        parsed.techniques && parsed.techniques.length > 0
          ? parsed.techniques
          : SEED_TECHNIQUES,
      gameplanNodes:
        parsed.gameplanNodes && parsed.gameplanNodes.length > 0
          ? parsed.gameplanNodes
          : SEED_GAMEPLAN,
      userGrade: { ...DEFAULT_USER_GRADE, ...parsed.userGrade },
      matchLogs: parsed.matchLogs ?? [],
      goals: { ...DEFAULT_GOALS, ...parsed.goals },
      nutritionProfile: { ...DEFAULT_NUTRITION_PROFILE, ...parsed.nutritionProfile },
      weightCut: { ...DEFAULT_WEIGHT_CUT, ...parsed.weightCut },
      security: { ...DEFAULT_SECURITY, ...parsed.security },
      theme: parsed.theme ?? "samurai",
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
  workoutSessions: WorkoutSession[];
  exercisePRs: ExercisePR[];
  recipes: Recipe[];
  weighIns: WeighIn[];
  techniques: Technique[];
  gameplanNodes: GameplanNode[];
  userGrade: UserGrade;
  matchLogs: MatchLog[];
  goals: Goals;
  nutritionProfile: NutritionProfile;
  weightCut: WeightCut;
  security: Security;
  theme: ThemeId;
  addSession: (s: Omit<TrainingSession, "id" | "createdAt">) => void;
  updateSession: (id: string, patch: Partial<TrainingSession>) => void;
  deleteSession: (id: string) => void;
  addWorkoutSession: (w: Omit<WorkoutSession, "id">) => void;
  deleteWorkoutSession: (id: string) => void;
  updateExercisePR: (pr: Omit<ExercisePR, "id">) => void;
  addRecipe: (r: Omit<Recipe, "id">) => void;
  updateRecipe: (id: string, patch: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addWeighIn: (w: Omit<WeighIn, "id">) => void;
  deleteWeighIn: (id: string) => void;
  updateTechnique: (id: string, patch: Partial<Technique>) => void;
  addTechnique: (t: Omit<Technique, "id">) => void;
  deleteTechnique: (id: string) => void;
  addGameplanNode: (node: Omit<GameplanNode, "id">) => void;
  updateGameplanNode: (id: string, patch: Partial<GameplanNode>) => void;
  deleteGameplanNode: (id: string) => void;
  updateUserGrade: (patch: Partial<UserGrade>) => void;
  addMatchLog: (m: Omit<MatchLog, "id">) => void;
  deleteMatchLog: (id: string) => void;
  updateTheme: (theme: ThemeId) => void;
  updateGoals: (patch: Partial<Goals>) => void;
  updateNutritionProfile: (patch: Partial<NutritionProfile>) => void;
  updateWeightCut: (patch: Partial<WeightCut>) => void;
  setAdminPin: (pin: string | null) => void;
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
      sessions: d.sessions
        .map((s) => (s.id === id ? { ...s, ...patch } : s))
        .sort((a, b) => b.date.localeCompare(a.date)),
    }));
  }, []);

  const deleteSession = useCallback((id: string) => {
    mutate((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));
  }, []);

  const addWorkoutSession = useCallback((w: Omit<WorkoutSession, "id">) => {
    const newSession: WorkoutSession = { ...w, id: uid() };
    mutate((d) => ({
      ...d,
      workoutSessions: [newSession, ...(d.workoutSessions || [])].sort((a, b) =>
        b.date.localeCompare(a.date)
      ),
    }));
  }, []);

  const deleteWorkoutSession = useCallback((id: string) => {
    mutate((d) => ({
      ...d,
      workoutSessions: (d.workoutSessions || []).filter((w) => w.id !== id),
    }));
  }, []);

  const updateExercisePR = useCallback((pr: Omit<ExercisePR, "id">) => {
    const newPR: ExercisePR = { ...pr, id: uid() };
    mutate((d) => {
      const existing = (d.exercisePRs || []).filter((p) => p.exerciseName !== pr.exerciseName);
      return {
        ...d,
        exercisePRs: [newPR, ...existing],
      };
    });
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

  const updateTechnique = useCallback((id: string, patch: Partial<Technique>) => {
    mutate((d) => ({
      ...d,
      techniques: d.techniques.map((t) =>
        t.id === id ? { ...t, ...patch } : t
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

  const addGameplanNode = useCallback((node: Omit<GameplanNode, "id">) => {
    mutate((d) => ({
      ...d,
      gameplanNodes: [...d.gameplanNodes, { ...node, id: uid() }],
    }));
  }, []);

  const updateGameplanNode = useCallback((id: string, patch: Partial<GameplanNode>) => {
    mutate((d) => ({
      ...d,
      gameplanNodes: d.gameplanNodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
  }, []);

  const deleteGameplanNode = useCallback((id: string) => {
    mutate((d) => ({
      ...d,
      gameplanNodes: d.gameplanNodes.filter((n) => n.id !== id && n.parentId !== id),
    }));
  }, []);

  const updateUserGrade = useCallback((patch: Partial<UserGrade>) => {
    mutate((d) => ({ ...d, userGrade: { ...d.userGrade, ...patch } }));
  }, []);

  const addMatchLog = useCallback((m: Omit<MatchLog, "id">) => {
    mutate((d) => ({
      ...d,
      matchLogs: [{ ...m, id: uid() }, ...d.matchLogs].sort((a, b) =>
        b.date.localeCompare(a.date)
      ),
    }));
  }, []);

  const deleteMatchLog = useCallback((id: string) => {
    mutate((d) => ({ ...d, matchLogs: d.matchLogs.filter((m) => m.id !== id) }));
  }, []);

  const updateTheme = useCallback((theme: ThemeId) => {
    mutate((d) => ({ ...d, theme }));
  }, []);

  const updateGoals = useCallback((patch: Partial<Goals>) => {
    mutate((d) => ({ ...d, goals: { ...d.goals, ...patch } }));
  }, []);

  const updateNutritionProfile = useCallback((patch: Partial<NutritionProfile>) => {
    mutate((d) => ({
      ...d,
      nutritionProfile: { ...d.nutritionProfile, ...patch },
    }));
  }, []);

  const updateWeightCut = useCallback((patch: Partial<WeightCut>) => {
    mutate((d) => ({ ...d, weightCut: { ...d.weightCut, ...patch } }));
  }, []);

  const setAdminPin = useCallback((pin: string | null) => {
    mutate((d) => ({ ...d, security: { ...d.security, adminPin: pin } }));
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
        workoutSessions: Array.isArray(parsed.workoutSessions)
          ? parsed.workoutSessions
          : [],
        exercisePRs:
          Array.isArray(parsed.exercisePRs) && parsed.exercisePRs.length > 0
            ? parsed.exercisePRs
            : SEED_PRS,
        recipes:
          Array.isArray(parsed.recipes) && parsed.recipes.length > 0
            ? parsed.recipes
            : SEED_RECIPES,
        weighIns: Array.isArray(parsed.weighIns) ? parsed.weighIns : [],
        techniques:
          Array.isArray(parsed.techniques) && parsed.techniques.length > 0
            ? parsed.techniques
            : SEED_TECHNIQUES,
        gameplanNodes:
          Array.isArray(parsed.gameplanNodes) && parsed.gameplanNodes.length > 0
            ? parsed.gameplanNodes
            : SEED_GAMEPLAN,
        userGrade: { ...DEFAULT_USER_GRADE, ...parsed.userGrade },
        matchLogs: Array.isArray(parsed.matchLogs) ? parsed.matchLogs : [],
        goals: { ...DEFAULT_GOALS, ...parsed.goals },
        nutritionProfile: {
          ...DEFAULT_NUTRITION_PROFILE,
          ...parsed.nutritionProfile,
        },
        weightCut: { ...DEFAULT_WEIGHT_CUT, ...parsed.weightCut },
        security: { ...DEFAULT_SECURITY, ...parsed.security },
        theme: parsed.theme ?? "samurai",
      });
      return { ok: true };
    } catch {
      return { ok: false, error: "Impossible de lire ce fichier JSON." };
    }
  }, []);

  const resetData = useCallback(() => {
    mutate(emptyData());
  }, []);

  if (typeof document !== "undefined" && ready) {
    document.documentElement.setAttribute("data-theme", data.theme || "samurai");
  }

  const value: DataContextValue = {
    ready,
    sessions: data.sessions,
    workoutSessions: data.workoutSessions || [],
    exercisePRs: data.exercisePRs || [],
    recipes: data.recipes,
    weighIns: data.weighIns,
    techniques: data.techniques,
    gameplanNodes: data.gameplanNodes,
    userGrade: data.userGrade,
    matchLogs: data.matchLogs,
    goals: data.goals,
    nutritionProfile: data.nutritionProfile,
    weightCut: data.weightCut,
    security: data.security,
    theme: data.theme || "samurai",
    addSession,
    updateSession,
    deleteSession,
    addWorkoutSession,
    deleteWorkoutSession,
    updateExercisePR,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    addWeighIn,
    deleteWeighIn,
    updateTechnique,
    addTechnique,
    deleteTechnique,
    addGameplanNode,
    updateGameplanNode,
    deleteGameplanNode,
    updateUserGrade,
    addMatchLog,
    deleteMatchLog,
    updateTheme,
    updateGoals,
    updateNutritionProfile,
    updateWeightCut,
    setAdminPin,
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
