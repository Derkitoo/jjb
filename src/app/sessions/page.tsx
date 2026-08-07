"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Card, SectionTitle } from "@/components/Card";
import {
  SESSION_TYPE_LABELS,
  SessionType,
  TrainingSession,
} from "@/lib/types";
import { averageIntensity, currentWeekStreak } from "@/lib/stats";

const TYPE_OPTIONS = Object.entries(SESSION_TYPE_LABELS) as [SessionType, string][];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function SessionsPage() {
  const { ready, sessions, addSession, deleteSession } = useData();
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<SessionType>("gi");
  const [durationMin, setDurationMin] = useState(60);
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [techniques, setTechniques] = useState("");
  const [notes, setNotes] = useState("");

  if (!ready) return <p className="text-muted text-sm">Chargement…</p>;

  function resetForm() {
    setDate(todayISO());
    setType("gi");
    setDurationMin(60);
    setIntensity(3);
    setTechniques("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addSession({ date, type, durationMin, intensity, techniques, notes });
    resetForm();
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Séances"
          subtitle={`${sessions.length} séance${sessions.length > 1 ? "s" : ""} · intensité moy. ${averageIntensity(
            sessions
          ).toFixed(1)}/5 · ${currentWeekStreak(sessions)} sem. d'affilée`}
        />
        <button
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 h-10 px-4 rounded-full bg-accent text-white font-semibold text-sm"
        >
          {showForm ? "Fermer" : "+ Ajouter"}
        </button>
      </div>

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-muted mb-1">Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="block text-muted mb-1">Type</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SessionType)}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
                >
                  {TYPE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="text-sm block">
              <span className="block text-muted mb-1">Durée (minutes)</span>
              <input
                type="number"
                min={5}
                max={300}
                step={5}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
              />
            </label>

            <div className="text-sm">
              <span className="block text-muted mb-1">
                Intensité ressentie : {intensity}/5
              </span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setIntensity(n as 1 | 2 | 3 | 4 | 5)}
                    className={`flex-1 h-10 rounded-lg border font-semibold transition-colors ${
                      intensity === n
                        ? "bg-accent border-accent text-white"
                        : "bg-surface-2 border-border text-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <label className="text-sm block">
              <span className="block text-muted mb-1">
                Techniques travaillées
              </span>
              <input
                type="text"
                value={techniques}
                onChange={(e) => setTechniques(e.target.value)}
                placeholder="Ex : passage de garde, triangle, x-guard…"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
              />
            </label>

            <label className="text-sm block">
              <span className="block text-muted mb-1">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Sensations, blessures, points à travailler…"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
              />
            </label>

            <button
              type="submit"
              className="w-full h-11 rounded-full bg-accent text-white font-semibold"
            >
              Enregistrer la séance
            </button>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {sessions.length === 0 && !showForm && (
          <Card className="text-sm text-muted">
            Aucune séance pour l&apos;instant. Ajoute ta première séance de JJB !
          </Card>
        )}
        {sessions.map((s) => (
          <SessionRow key={s.id} session={s} onDelete={() => deleteSession(s.id)} />
        ))}
      </div>
    </div>
  );
}

function SessionRow({
  session,
  onDelete,
}: {
  session: TrainingSession;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <div className="font-medium">{SESSION_TYPE_LABELS[session.type]}</div>
          <div className="text-xs text-muted">
            {new Date(session.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{session.durationMin} min</span>
          <span className="text-xs px-2 py-1 rounded-full bg-surface-2 border border-border">
            {"⭐".repeat(session.intensity)}
          </span>
        </div>
      </button>
      {open && (
        <div className="mt-3 pt-3 border-t border-border text-sm space-y-2">
          {session.techniques && (
            <p>
              <span className="text-muted">Techniques : </span>
              {session.techniques}
            </p>
          )}
          {session.notes && (
            <p>
              <span className="text-muted">Notes : </span>
              {session.notes}
            </p>
          )}
          <button
            onClick={onDelete}
            className="text-xs text-accent font-medium mt-2"
          >
            Supprimer cette séance
          </button>
        </div>
      )}
    </Card>
  );
}
