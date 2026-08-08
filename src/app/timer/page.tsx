"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { useTimer } from "@/lib/timer-context";
import { Card, SectionTitle } from "@/components/Card";

function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const PHASE_LABEL: Record<string, string> = {
  idle: "Prêt",
  prep: "Préparation",
  work: "Round",
  rest: "Repos",
  done: "Terminé 🎉",
};

export default function TimerPage() {
  const [tab, setTab] = useState<"rounds" | "free">("rounds");
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Chrono"
        subtitle="Minuteur de rounds ou chrono libre pour ta séance"
      />
      <div className="flex gap-2 bg-surface-2 border border-border rounded-full p-1">
        <button
          onClick={() => setTab("rounds")}
          className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors ${
            tab === "rounds" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          Rounds
        </button>
        <button
          onClick={() => setTab("free")}
          className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors ${
            tab === "free" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          Chrono libre
        </button>
      </div>
      {tab === "rounds" ? <RoundTimer /> : <FreeStopwatch />}
    </div>
  );
}

function RoundTimer() {
  const { addSession } = useData();
  const {
    config,
    setConfig,
    phase,
    currentRound,
    remainingMs,
    roundRunning,
    startRoundTimer,
    pauseRoundTimer,
    resetRoundTimer,
  } = useTimer();
  const { rounds, workMin, restMin, prepSec } = config;
  const [saved, setSaved] = useState(false);

  function handleStart() {
    setSaved(false);
    startRoundTimer();
  }

  function handleReset() {
    resetRoundTimer();
    setSaved(false);
  }

  function handleSaveSession() {
    addSession({
      date: new Date().toISOString().slice(0, 10),
      type: "sparring",
      durationMin: rounds * workMin,
      intensity: 4,
      techniques: "",
      notes: `Minuteur : ${rounds} rounds de ${workMin} min (repos ${restMin} min).`,
    });
    setSaved(true);
  }

  const workMs = workMin * 60 * 1000;
  const restMs = restMin * 60 * 1000;
  const prepMs = prepSec * 1000;
  const totalPhaseMs =
    phase === "prep" ? prepMs : phase === "rest" ? restMs : workMs;
  const progress =
    totalPhaseMs > 0 ? 1 - Math.max(0, remainingMs) / totalPhaseMs : 0;

  return (
    <div className="space-y-6">
      {phase === "idle" && (
        <Card className="space-y-4">
          <NumberField
            label="Nombre de rounds"
            value={rounds}
            onChange={(v) => setConfig({ rounds: v })}
            min={1}
            max={20}
          />
          <NumberField
            label="Durée d'un round (min)"
            value={workMin}
            onChange={(v) => setConfig({ workMin: v })}
            min={1}
            max={20}
          />
          <NumberField
            label="Repos entre rounds (min)"
            value={restMin}
            onChange={(v) => setConfig({ restMin: v })}
            min={0}
            max={10}
          />
          <NumberField
            label="Préparation avant le 1er round (sec)"
            value={prepSec}
            onChange={(v) => setConfig({ prepSec: v })}
            min={0}
            max={60}
            step={5}
          />
        </Card>
      )}

      <Card className="flex flex-col items-center py-8 gap-4">
        <div className="text-sm uppercase tracking-wide text-muted font-semibold">
          {PHASE_LABEL[phase]}
          {(phase === "work" || phase === "rest") && (
            <span className="ml-2 text-foreground">
              Round {currentRound}/{rounds}
            </span>
          )}
        </div>
        <div
          className={`text-6xl font-black tabular-nums ${
            phase === "rest"
              ? "text-accent-2"
              : phase === "done"
              ? "text-accent"
              : "text-foreground"
          }`}
        >
          {phase === "idle"
            ? formatTime((prepSec > 0 ? prepSec : workMin * 60) * 1000)
            : formatTime(remainingMs)}
        </div>
        {phase !== "idle" && phase !== "done" && (
          <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-[width] duration-150"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        )}

        <div className="flex gap-3 mt-2">
          {!roundRunning && phase !== "done" && (
            <button
              onClick={handleStart}
              className="h-12 px-8 rounded-full bg-accent text-white font-semibold"
            >
              {phase === "idle" ? "Démarrer" : "Reprendre"}
            </button>
          )}
          {roundRunning && (
            <button
              onClick={pauseRoundTimer}
              className="h-12 px-8 rounded-full bg-surface-2 border border-border font-semibold"
            >
              Pause
            </button>
          )}
          {phase !== "idle" && (
            <button
              onClick={handleReset}
              className="h-12 px-8 rounded-full bg-surface-2 border border-border font-semibold"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {phase === "done" && (
          <button
            onClick={handleSaveSession}
            disabled={saved}
            className="mt-2 h-11 px-6 rounded-full bg-accent-2 text-white font-semibold disabled:opacity-50"
          >
            {saved ? "Séance enregistrée ✓" : "Enregistrer comme séance"}
          </button>
        )}
      </Card>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <label className="text-sm block">
      <span className="block text-muted mb-1">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="h-9 w-9 rounded-full bg-surface-2 border border-border font-bold"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 text-center bg-surface-2 border border-border rounded-lg px-3 py-2"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="h-9 w-9 rounded-full bg-surface-2 border border-border font-bold"
        >
          +
        </button>
      </div>
    </label>
  );
}

function FreeStopwatch() {
  const { addSession } = useData();
  const {
    elapsedMs,
    stopwatchRunning,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
  } = useTimer();
  const [saved, setSaved] = useState(false);

  function handleStart() {
    setSaved(false);
    startStopwatch();
  }
  function handleReset() {
    resetStopwatch();
    setSaved(false);
  }
  function handleSave() {
    const minutes = Math.max(1, Math.round(elapsedMs / 60000));
    addSession({
      date: new Date().toISOString().slice(0, 10),
      type: "sparring",
      durationMin: minutes,
      intensity: 3,
      techniques: "",
      notes: "Chrono libre.",
    });
    setSaved(true);
  }

  const totalSec = Math.floor(elapsedMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return (
    <Card className="flex flex-col items-center py-10 gap-6">
      <div className="text-6xl font-black tabular-nums">
        {h > 0 ? `${h}:` : ""}
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </div>
      <div className="flex gap-3">
        {!stopwatchRunning ? (
          <button
            onClick={handleStart}
            className="h-12 px-8 rounded-full bg-accent text-white font-semibold"
          >
            {elapsedMs > 0 ? "Reprendre" : "Démarrer"}
          </button>
        ) : (
          <button
            onClick={pauseStopwatch}
            className="h-12 px-8 rounded-full bg-surface-2 border border-border font-semibold"
          >
            Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="h-12 px-8 rounded-full bg-surface-2 border border-border font-semibold"
        >
          Réinitialiser
        </button>
      </div>
      {elapsedMs > 0 && !stopwatchRunning && (
        <button
          onClick={handleSave}
          disabled={saved}
          className="h-11 px-6 rounded-full bg-accent-2 text-white font-semibold disabled:opacity-50"
        >
          {saved ? "Séance enregistrée ✓" : "Enregistrer comme séance"}
        </button>
      )}
    </Card>
  );
}
