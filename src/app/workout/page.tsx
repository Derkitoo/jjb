"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card, SectionTitle } from "@/components/Card";
import { useAdmin } from "@/lib/admin-context";
import { playAudioFile } from "@/lib/speech";

interface Routine {
  id: string;
  title: string;
  category: string;
  durationMin: number;
  icon: string;
  color: string;
  exercises: { name: string; sets: string; desc: string }[];
}

const BJJ_ROUTINES: Routine[] = [
  {
    id: "grip",
    title: "Grip of Steel",
    category: "Poigne & Avant-bras",
    durationMin: 15,
    icon: "🦾",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    exercises: [
      { name: "Tractions sur Gi / Serviette", sets: "4 × 8-12 reps", desc: "Saisir la serviette pliée en deux et tirer." },
      { name: "Farmer Walk (Marche du Fermier)", sets: "3 × 45 sec", desc: "Marche avec 2 kets/kettlebells lourdes." },
      { name: "Wrist Roller / Extension Poignets", sets: "3 × 15 reps", desc: "Enroulement de barre avec poids." },
    ],
  },
  {
    id: "core",
    title: "BJJ Core & Hanches",
    category: "Gainage & Mobilité",
    durationMin: 20,
    icon: "🧘‍♂️",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    exercises: [
      { name: "Turkish Get-Up (TGU)", sets: "3 × 5 reps / côté", desc: "Stabilité d'épaule et mobilité de hanche." },
      { name: "Pontages Lourd (KB Bridging)", sets: "4 × 12 reps", desc: "Pontage avec kettlebell sur le bassin." },
      { name: "Shrimpings Lestés", sets: "3 × 10 reps / côté", desc: "Écrevisse au sol avec disque sur le buste." },
      { name: "Palloff Press Rotatif", sets: "3 × 12 reps / côté", desc: "Anti-rotation de buste à la poulie/élastique." },
    ],
  },
  {
    id: "takedown",
    title: "Explosive Takedowns",
    category: "Puissance & Jambes",
    durationMin: 30,
    icon: "🚀",
    color: "border-accent/40 bg-accent/10 text-accent",
    exercises: [
      { name: "Soulevé de Terre (Deadlift)", sets: "4 × 5 reps", desc: "Force athlétique globale de la chaîne postérieure." },
      { name: "Kettlebell Swings", sets: "4 × 20 reps", desc: "Extension explosive de hanche pour les aménées au sol." },
      { name: "Jump Squats / Fentes Sautées", sets: "3 × 10 reps", desc: "Détente verticale et démarrage explosif." },
    ],
  },
  {
    id: "armor",
    title: "Neck & Shoulder Armor",
    category: "Cou & Épaules (Blindage)",
    durationMin: 15,
    icon: "🛡️",
    color: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    exercises: [
      { name: "Ponts de Lutteur (Neck Bridges)", sets: "3 × 30 sec", desc: "Renforcement isométrique du cou." },
      { name: "Oiseau Haltères / Face Pulls", sets: "4 × 15 reps", desc: "Coiffe des rotateurs et arrière d'épaule." },
      { name: "Shrugs avec Pause", sets: "3 × 12 reps", desc: "Trapèzes forts contre les guillotines." },
    ],
  },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatTimer(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function WorkoutPage() {
  const { ready, workoutSessions, addWorkoutSession, deleteWorkoutSession, exercisePRs, updateExercisePR } = useData();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<"routines" | "prs" | "log">("routines");
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  // Live Routine Timer States
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [timerTotalSec, setTimerTotalSec] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form states for manual log
  const [title, setTitle] = useState("Renforcement Musculaire BJJ");
  const [date, setDate] = useState(todayISO());
  const [durationMin, setDurationMin] = useState(30);
  const [intensity, setIntensity] = useState(4);
  const [notes, setNotes] = useState("");
  const [showLogForm, setShowLogForm] = useState(false);

  // Form states for PR update
  const [prExercise, setPrExercise] = useState("Soulevé de Terre (Deadlift)");
  const [prWeight, setPrWeight] = useState("");
  const [prReps, setPrReps] = useState("");
  const [showPrModal, setShowPrModal] = useState(false);

  // Timer interval effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSec((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerRunning(false);
            playAudioFile("dbz-finish.mp3");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  function startRoutineTimer(r: Routine) {
    const sec = r.durationMin * 60;
    setTimerTotalSec(sec);
    setTimerSec(sec);
    setTimerRunning(true);
    playAudioFile("dbz-round-start.mp3");
  }

  function stopAndSaveRoutineTimer(r: Routine) {
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedSec = timerTotalSec - timerSec;
    const elapsedMin = Math.max(1, Math.round(elapsedSec / 60));

    addWorkoutSession({
      date: todayISO(),
      title: `Séance : ${r.title}`,
      durationMin: elapsedMin,
      intensity: 4,
      exercises: r.exercises.map((e) => ({ name: e.name, sets: 3, reps: 10 })),
      notes: `Chrono effectué : ${formatTimer(elapsedSec)} / ${formatTimer(timerTotalSec)}.`,
    });

    setTimerSec(0);
    setTimerTotalSec(0);
    setSelectedRoutine(null);
    setActiveTab("log");
  }

  if (!ready) return <p className="text-muted text-sm">Chargement…</p>;

  function handleSaveWorkout(e: React.FormEvent) {
    e.preventDefault();
    addWorkoutSession({
      date,
      title,
      durationMin,
      intensity,
      exercises: selectedRoutine
        ? selectedRoutine.exercises.map((e) => ({ name: e.name, sets: 3, reps: 10 }))
        : [],
      notes,
    });
    setShowLogForm(false);
    setSelectedRoutine(null);
    setNotes("");
  }

  function handleSavePR(e: React.FormEvent) {
    e.preventDefault();
    updateExercisePR({
      exerciseName: prExercise,
      maxWeightKg: prWeight ? Number(prWeight) : undefined,
      maxReps: prReps ? Number(prReps) : undefined,
      date: todayISO(),
    });
    setShowPrModal(false);
    setPrWeight("");
    setPrReps("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Renforcement Musculaire"
          subtitle="Préparation physique & conditionnement spécifique au Jiu-Jitsu Brésilien"
        />
        <Link
          href="/timer"
          className="shrink-0 h-10 px-4 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <span>⏱️</span>
          <span>Chrono DBZ</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-surface-2 border border-border rounded-full p-1">
        <button
          onClick={() => setActiveTab("routines")}
          className={`flex-1 h-9 rounded-full text-xs font-semibold transition-colors ${
            activeTab === "routines" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          🏋️ Routines BJJ
        </button>
        <button
          onClick={() => setActiveTab("prs")}
          className={`flex-1 h-9 rounded-full text-xs font-semibold transition-colors ${
            activeTab === "prs" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          🏆 Perfs (PRs)
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`flex-1 h-9 rounded-full text-xs font-semibold transition-colors ${
            activeTab === "log" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          📋 Historique ({workoutSessions.length})
        </button>
      </div>

      {/* Tab 1: Routines */}
      {activeTab === "routines" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BJJ_ROUTINES.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRoutine(r)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 space-y-2 active:scale-95 ${r.color} hover:brightness-125`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{r.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-white/10">
                    ⏱️ {r.durationMin} min
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{r.title}</h3>
                  <p className="text-xs text-muted">{r.category}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Routine Detail & Interactive Timer Card */}
          {selectedRoutine && (
            <Card className="space-y-4 border-accent/40 bg-surface-2/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <span>{selectedRoutine.icon}</span>
                  <span>{selectedRoutine.title}</span>
                </div>
                <button
                  onClick={() => {
                    setTimerRunning(false);
                    setSelectedRoutine(null);
                  }}
                  className="text-xs text-muted hover:text-foreground"
                >
                  Fermer ✕
                </button>
              </div>

              {/* Interactive Live Timer */}
              {timerTotalSec > 0 ? (
                <div className="p-4 rounded-2xl bg-surface border border-accent/40 text-center space-y-3 shadow-lg">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    ⏱️ Chrono d&apos;Exercice En Cours
                  </span>
                  <div className="text-4xl font-black text-foreground font-mono">
                    {formatTimer(timerSec)}
                  </div>

                  <div className="w-full bg-surface-2 h-2 rounded-full overflow-hidden border border-border">
                    <div
                      className="bg-accent h-full transition-all duration-1000"
                      style={{
                        width: `${((timerTotalSec - timerSec) / timerTotalSec) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      onClick={() => setTimerRunning((v) => !v)}
                      className="px-4 py-2 rounded-full bg-surface-2 border border-border text-foreground text-xs font-bold active:scale-95"
                    >
                      {timerRunning ? "⏸ Pause" : "▶ Reprendre"}
                    </button>
                    <button
                      onClick={() => stopAndSaveRoutineTimer(selectedRoutine)}
                      className="px-5 py-2 rounded-full bg-accent text-white text-xs font-bold shadow-md shadow-accent/20 active:scale-95"
                    >
                      ✓ Enregistrer la Séance dans mon Journal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => startRoutineTimer(selectedRoutine)}
                    className="flex-1 h-10 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-transform active:scale-95"
                  >
                    ⏱️ Lancer le Chrono ({selectedRoutine.durationMin} min)
                  </button>
                </div>
              )}

              <div className="space-y-2.5">
                {selectedRoutine.exercises.map((ex, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-surface border border-border space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>{ex.name}</span>
                      <span className="text-accent">{ex.sets}</span>
                    </div>
                    <p className="text-[11px] text-muted">{ex.desc}</p>
                  </div>
                ))}
              </div>

              {timerTotalSec === 0 && (
                <button
                  onClick={() => {
                    setTitle(`Séance : ${selectedRoutine.title}`);
                    setDurationMin(selectedRoutine.durationMin);
                    setShowLogForm(true);
                  }}
                  className="w-full h-10 rounded-full bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 transition-transform active:scale-95"
                >
                  ✓ Enregistrer Manuellement sans Chrono
                </button>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: PRs */}
      {activeTab === "prs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-muted uppercase tracking-wider">
              🏆 Tes Records Personnels (PRs)
            </h3>
            <button
              onClick={() => setShowPrModal(true)}
              className="h-8 px-3 rounded-full bg-accent text-white font-semibold text-xs shadow transition-all active:scale-95"
            >
              + Mettre à jour un PR
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exercisePRs.map((pr) => (
              <Card key={pr.id} className="space-y-1.5 border-border">
                <div className="font-bold text-xs text-foreground flex items-center justify-between">
                  <span>{pr.exerciseName}</span>
                  <span className="text-[10px] text-muted">{pr.date}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  {pr.maxWeightKg && (
                    <span className="text-xl font-extrabold text-accent">
                      {pr.maxWeightKg} <span className="text-xs font-normal">kg</span>
                    </span>
                  )}
                  {pr.maxReps && (
                    <span className="text-sm font-semibold text-accent-2">
                      {pr.maxReps} <span className="text-xs font-normal">reps</span>
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {showPrModal && (
            <Card className="space-y-3 border-accent">
              <h4 className="font-bold text-xs text-foreground">Ajouter / Mettre à jour un Record (PR)</h4>
              <form onSubmit={handleSavePR} className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted mb-1">Exercice :</label>
                  <input
                    type="text"
                    value={prExercise}
                    onChange={(e) => setPrExercise(e.target.value)}
                    required
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-muted mb-1">Charge Max (kg) :</label>
                    <input
                      type="number"
                      value={prWeight}
                      onChange={(e) => setPrWeight(e.target.value)}
                      placeholder="ex: 140"
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-muted mb-1">Répétitions Max :</label>
                    <input
                      type="number"
                      value={prReps}
                      onChange={(e) => setPrReps(e.target.value)}
                      placeholder="ex: 12"
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPrModal(false)}
                    className="px-3 py-1.5 rounded-full bg-surface-2 text-muted"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-accent text-white font-bold"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: Log */}
      {activeTab === "log" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-muted uppercase tracking-wider">
              📋 Historique des Séances Muscu
            </h3>
            <button
              onClick={() => setShowLogForm((v) => !v)}
              className="h-8 px-3 rounded-full bg-accent text-white font-semibold text-xs shadow transition-all active:scale-95"
            >
              {showLogForm ? "Fermer" : "+ Enregistrer une Séance"}
            </button>
          </div>

          {showLogForm && (
            <Card className="space-y-3 border-accent">
              <h4 className="font-bold text-xs text-foreground">Nouvelle Séance de Renforcement</h4>
              <form onSubmit={handleSaveWorkout} className="space-y-3 text-xs">
                <div>
                  <label className="block text-muted mb-1">Titre de la séance :</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-muted mb-1">Date :</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-muted mb-1">Durée (min) :</label>
                    <input
                      type="number"
                      value={durationMin}
                      onChange={(e) => setDurationMin(Number(e.target.value))}
                      required
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-muted mb-1">Intensité / RPE (1 à 5) :</label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                  >
                    <option value={1}>1 - Très Léger</option>
                    <option value={2}>2 - Modéré</option>
                    <option value={3}>3 - Vigoureux</option>
                    <option value={4}>4 - Difficile (RPE 8-9)</option>
                    <option value={5}>5 - Épuisement Total (RPE 10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted mb-1">Notes & Exercices effectués :</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="ex: Soulevé de terre 4x5 à 140kg, tractions lestées +15kg..."
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-9 rounded-full bg-accent text-white font-bold shadow-md active:scale-95"
                >
                  Sauvegarder la Séance
                </button>
              </form>
            </Card>
          )}

          {workoutSessions.length === 0 ? (
            <p className="text-xs text-muted text-center py-6">
              Aucune séance de renforcement enregistrée pour le moment.
            </p>
          ) : (
            <div className="space-y-2.5">
              {workoutSessions.map((w) => (
                <Card key={w.id} className="space-y-2 border-border">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-foreground flex items-center gap-2">
                      <span>🏋️</span>
                      <span>{w.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted">{w.date}</span>
                      {isAdmin && (
                        <button
                          onClick={() => deleteWorkoutSession(w.id)}
                          className="text-xs text-rose-400 hover:text-rose-300"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>⏱️ {w.durationMin} min</span>
                    <span>⚡ Intensité : {"🔥".repeat(w.intensity)}</span>
                  </div>
                  {w.notes && <p className="text-xs text-muted leading-relaxed">{w.notes}</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
