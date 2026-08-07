export type SessionType =
  | "gi"
  | "nogi"
  | "sparring"
  | "competition"
  | "open_mat"
  | "muscu"
  | "cardio";

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  gi: "Gi",
  nogi: "No-Gi",
  sparring: "Sparring",
  competition: "Compétition",
  open_mat: "Open Mat",
  muscu: "Musculation",
  cardio: "Cardio",
};

export interface TrainingSession {
  id: string;
  date: string; // yyyy-mm-dd
  type: SessionType;
  durationMin: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  techniques: string;
  notes: string;
  createdAt: string; // ISO timestamp
}

export type RecipeCategory =
  | "petit-dejeuner"
  | "dejeuner"
  | "diner"
  | "collation"
  | "post-training";

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  "petit-dejeuner": "Petit-déjeuner",
  dejeuner: "Déjeuner",
  diner: "Dîner",
  collation: "Collation",
  "post-training": "Post-entraînement",
};

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  prepMinutes: number;
  ingredients: string[];
  steps: string[];
  favorite: boolean;
  custom?: boolean;
}

export interface WeighIn {
  id: string;
  date: string;
  weightKg: number;
}

export interface AppData {
  sessions: TrainingSession[];
  recipes: Recipe[];
  weighIns: WeighIn[];
}
