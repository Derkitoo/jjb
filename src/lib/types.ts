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

export type Belt = "blanche" | "bleue" | "violette" | "marron" | "noire";

export const BELT_LABELS: Record<Belt, string> = {
  blanche: "Ceinture blanche",
  bleue: "Ceinture bleue",
  violette: "Ceinture violette",
  marron: "Ceinture marron",
  noire: "Ceinture noire",
};

export const BELT_ORDER: Belt[] = [
  "blanche",
  "bleue",
  "violette",
  "marron",
  "noire",
];

export type TechniqueCategory =
  | "garde"
  | "passage"
  | "soumission"
  | "projection"
  | "echappement"
  | "controle";

export const TECHNIQUE_CATEGORY_LABELS: Record<TechniqueCategory, string> = {
  garde: "Garde",
  passage: "Passage de garde",
  soumission: "Soumission",
  projection: "Projection",
  echappement: "Échappement",
  controle: "Contrôle / Transition",
};

export type MasteryStatus = "a_decouvrir" | "en_cours" | "maitrisee";

export const MASTERY_LABELS: Record<MasteryStatus, string> = {
  a_decouvrir: "À découvrir",
  en_cours: "En cours",
  maitrisee: "Maîtrisée",
};

export interface Technique {
  id: string;
  name: string;
  belt: Belt;
  category: TechniqueCategory;
  status: MasteryStatus;
  notes?: string;
  videoUrl?: string;
  custom?: boolean;
}

export interface Goals {
  weeklySessionsTarget: number | null;
  targetWeightKg: number | null;
}

export type Sex = "homme" | "femme";

export type ActivityLevel =
  | "sedentaire"
  | "leger"
  | "modere"
  | "actif"
  | "tres_actif";

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentaire: "Sédentaire (peu ou pas de sport)",
  leger: "Léger (1-2 séances/semaine)",
  modere: "Modéré (3-4 séances/semaine)",
  actif: "Actif (5-6 séances/semaine)",
  tres_actif: "Très actif (entraînement biquotidien)",
};

export type NutritionGoalType = "perte" | "maintien" | "prise_masse";

export const NUTRITION_GOAL_LABELS: Record<NutritionGoalType, string> = {
  perte: "Perte de poids",
  maintien: "Maintien",
  prise_masse: "Prise de masse",
};

export interface NutritionProfile {
  heightCm: number | null;
  age: number | null;
  sex: Sex | null;
  activityLevel: ActivityLevel;
  goal: NutritionGoalType;
}

export interface WeightCut {
  competitionName: string;
  competitionDate: string | null; // yyyy-mm-dd
  targetWeightKg: number | null;
  notes: string;
}

export interface AppData {
  sessions: TrainingSession[];
  recipes: Recipe[];
  weighIns: WeighIn[];
  techniques: Technique[];
  goals: Goals;
  nutritionProfile: NutritionProfile;
  weightCut: WeightCut;
}
