"use client";

import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card } from "@/components/Card";
import { Recipe, SESSION_TYPE_LABELS } from "@/lib/types";
import {
  currentWeekStreak,
  sessionsThisWeek,
  totalMinutesThisWeek,
} from "@/lib/stats";

import { PwaInstallCard } from "@/components/PwaInstallCard";

// Choix déterministe (pas de Math.random dans le rendu) : la suggestion
// change au fil de tes séances plutôt qu'à chaque re-render.
function pickSuggestion(recipes: Recipe[], sessionsCount: number): Recipe | null {
  const favorites = recipes.filter((r) => r.favorite);
  const pool = favorites.length > 0 ? favorites : recipes;
  if (pool.length === 0) return null;
  return pool[sessionsCount % pool.length];
}

export default function DashboardPage() {
  const { ready, sessions, recipes, weighIns, goals } = useData();

  if (!ready) {
    return <p className="text-muted text-sm">Chargement…</p>;
  }

  const streak = currentWeekStreak(sessions);
  const weekSessions = sessionsThisWeek(sessions);
  const weekMinutes = totalMinutesThisWeek(sessions);
  const recent = sessions.slice(0, 5);
  const suggestion = pickSuggestion(recipes, sessions.length);
  const latestWeight = weighIns[0];
  const hasGoals =
    goals.weeklySessionsTarget != null || goals.targetWeightKg != null;

  return (
    <div className="space-y-6">
      <PwaInstallCard />
      <div>
        <h1 className="text-2xl font-bold">Salut, champion 🥋</h1>
        <p className="text-muted text-sm mt-1">
          Reste régulier sur le tatami, et régule ton assiette.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <div className="text-3xl font-extrabold text-accent">{streak}</div>
          <div className="text-xs text-muted mt-1">
            semaine{streak > 1 ? "s" : ""} d&apos;affilée
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-extrabold text-accent-2">
            {weekSessions.length}
          </div>
          <div className="text-xs text-muted mt-1">
            séance{weekSessions.length > 1 ? "s" : ""} cette semaine
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Temps sur le tatami (semaine)</span>
          <span className="font-semibold">
            {Math.floor(weekMinutes / 60)}h{String(weekMinutes % 60).padStart(2, "0")}
          </span>
        </div>
      </Card>

      {hasGoals && (
        <Card className="space-y-3">
          <h2 className="font-semibold text-sm">Objectifs</h2>
          {goals.weeklySessionsTarget != null && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted">Séances cette semaine</span>
                <span className="font-medium">
                  {weekSessions.length}/{goals.weeklySessionsTarget}
                </span>
              </div>
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-[width]"
                  style={{
                    width: `${Math.min(
                      100,
                      (weekSessions.length / goals.weeklySessionsTarget) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
          {goals.targetWeightKg != null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Poids cible</span>
              <span className="font-medium">
                {latestWeight
                  ? `${latestWeight.weightKg} kg → ${goals.targetWeightKg} kg (${
                      latestWeight.weightKg - goals.targetWeightKg > 0 ? "−" : "+"
                    }${Math.abs(latestWeight.weightKg - goals.targetWeightKg).toFixed(1)} kg)`
                  : `Objectif ${goals.targetWeightKg} kg — ajoute une pesée`}
              </span>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Link
          href="/timer"
          className="rounded-2xl bg-accent text-white font-semibold text-center py-3.5 text-xs md:text-sm hover:opacity-90 transition-opacity flex flex-col items-center justify-center gap-1"
        >
          <span className="text-lg">⏱️</span> Chrono
        </Link>
        <Link
          href="/gameplan"
          className="rounded-2xl bg-surface-2 border border-border text-center font-semibold py-3.5 text-xs md:text-sm hover:bg-surface transition-colors flex flex-col items-center justify-center gap-1"
        >
          <span className="text-lg">♟️</span> Gameplan
        </Link>
        <Link
          href="/sessions"
          className="rounded-2xl bg-surface-2 border border-border text-center font-semibold py-3.5 text-xs md:text-sm hover:bg-surface transition-colors flex flex-col items-center justify-center gap-1"
        >
          <span className="text-lg">➕</span> Séances
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Dernières séances</h2>
          <Link href="/sessions" className="text-xs text-accent">
            Tout voir
          </Link>
        </div>
        {recent.length === 0 ? (
          <Card className="text-sm text-muted">
            Aucune séance enregistrée pour l&apos;instant. Direction le tatami !
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((s) => (
              <Card key={s.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {SESSION_TYPE_LABELS[s.type]}
                  </div>
                  <div className="text-xs text-muted">
                    {new Date(s.date).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                <div className="text-sm text-muted">{s.durationMin} min</div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {suggestion && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Suggestion diète</h2>
            <Link href="/diet" className="text-xs text-accent-2">
              Voir les recettes
            </Link>
          </div>
          <Card>
            <div className="font-medium">{suggestion.name}</div>
            <div className="text-xs text-muted mt-1">
              {suggestion.kcal} kcal · {suggestion.protein}g prot · {suggestion.prepMinutes} min
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
