import { ActivityLevel, NutritionGoalType, NutritionProfile } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentaire: 1.2,
  leger: 1.375,
  modere: 1.55,
  actif: 1.725,
  tres_actif: 1.9,
};

const GOAL_ADJUSTMENT: Record<NutritionGoalType, number> = {
  perte: -0.2,
  maintien: 0,
  prise_masse: 0.12,
};

export interface DailyTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Estimation Mifflin-St Jeor. Donne un ordre de grandeur, pas un avis médical
 * ou nutritionnel personnalisé — à ajuster avec un pro si besoin.
 */
export function computeDailyTargets(
  weightKg: number | null | undefined,
  profile: NutritionProfile
): DailyTargets | null {
  if (!weightKg || !profile.heightCm || !profile.age || !profile.sex) {
    return null;
  }
  const bmr =
    10 * weightKg +
    6.25 * profile.heightCm -
    5 * profile.age +
    (profile.sex === "homme" ? 5 : -161);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel];
  const kcal = Math.round(tdee * (1 + GOAL_ADJUSTMENT[profile.goal]));

  // Combat sport : viser haut en protéines pour la récup et la masse maigre.
  const protein = Math.round(weightKg * 2);
  const fat = Math.round((kcal * 0.25) / 9);
  const remainingKcal = Math.max(0, kcal - protein * 4 - fat * 9);
  const carbs = Math.round(remainingKcal / 4);

  return { kcal, protein, carbs, fat };
}
