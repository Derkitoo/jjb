import { TrainingSession } from "./types";

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function sessionsThisWeek(sessions: TrainingSession[]): TrainingSession[] {
  const start = startOfWeek(new Date());
  return sessions.filter((s) => new Date(s.date) >= start);
}

export function totalMinutesThisWeek(sessions: TrainingSession[]): number {
  return sessionsThisWeek(sessions).reduce((sum, s) => sum + s.durationMin, 0);
}

/** Nombre de jours distincts d'entraînement consécutifs jusqu'à aujourd'hui (en comptant par semaine active). */
export function currentWeekStreak(sessions: TrainingSession[]): number {
  if (sessions.length === 0) return 0;
  const weeksWithSession = new Set(
    sessions.map((s) => startOfWeek(new Date(s.date)).getTime())
  );
  let streak = 0;
  const cursor = startOfWeek(new Date());
  while (weeksWithSession.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export function totalSessions(sessions: TrainingSession[]): number {
  return sessions.length;
}

export function averageIntensity(sessions: TrainingSession[]): number {
  if (sessions.length === 0) return 0;
  return (
    sessions.reduce((sum, s) => sum + s.intensity, 0) / sessions.length
  );
}
