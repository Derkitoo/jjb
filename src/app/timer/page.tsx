"use client";

import { useEffect, useRef, useState } from "react";
import { useData } from "@/lib/data-context";
import { Card, SectionTitle } from "@/components/Card";
import { playFinish, playGo, playRestStart, playTick } from "@/lib/beep";

function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type Phase = "idle" | "prep" | "work" | "rest" | "done";

const PHASE_LABEL: Record<Phase, string> = {
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
  const [rounds, setRounds] = useState(5);
  const [workMin, setWorkMin] = useState(5);
  const [restMin, setRestMin] = useState(1);
  const [prepSec, setPrepSec] = useState(10);

  const [phase, setPhase] = useState<Phase>("idle");
  const [currentRound, setCurrentRound] = useState(1);
  const [remainingMs, setRemainingMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);

  const phaseEndAtRef = useRef<number | null>(null);
  const lastTickSecondRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const workMs = workMin * 60 * 1000;
  const restMs = restMin * 60 * 1000;
  const prepMs = prepSec * 1000;

  function advancePhase() {
    setPhase((prevPhase) => {
      if (prevPhase === "prep") {
        playGo();
        phaseEndAtRef.current = Date.now() + workMs;
        setRemainingMs(workMs);
        lastTickSecondRef.current = null;
        return "work";
      }
      if (prevPhase === "work") {
        const isLastRound = currentRound >= rounds;
        if (isLastRound) {
          playFinish();
          setRunning(false);
          setRemainingMs(0);
          return "done";
        }
        playRestStart();
        phaseEndAtRef.current = Date.now() + restMs;
        setRemainingMs(restMs);
        lastTickSecondRef.current = null;
        return "rest";
      }
      if (prevPhase === "rest") {
        playGo();
        setCurrentRound((r) => r + 1);
        phaseEndAtRef.current = Date.now() + workMs;
        setRemainingMs(workMs);
        lastTickSecondRef.current = null;
        return "work";
      }
      return prevPhase;
    });
  }

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      const endAt = phaseEndAtRef.current;
      if (endAt == null) return;
      const remaining = endAt - Date.now();
      if (remaining <= 0) {
        advancePhase();
      } else {
        setRemainingMs(remaining);
        const sec = Math.ceil(remaining / 1000);
        if (
          sec <= 3 &&
          sec >= 1 &&
          lastTickSecondRef.current !== sec &&
          (phase === "work" || phase === "rest" || phase === "prep")
        ) {
          lastTickSecondRef.current = sec;
          playTick();
        }
      }
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase]);

  function handleStart() {
    setSaved(false);
    if (phase === "idle" || phase === "done") {
      setCurrentRound(1);
      const initial = prepMs > 0 ? "prep" : "work";
      phaseEndAtRef.current = Date.now() + (prepMs > 0 ? prepMs : workMs);
      setRemainingMs(prepMs > 0 ? prepMs : workMs);
      setPhase(initial);
    } else if (phaseEndAtRef.current == null) {
      // resuming from pause
      phaseEndAtRef.current = Date.now() + remainingMs;
    }
    lastTickSecondRef.current = null;
    setRunning(true);
  }

  function handlePause() {
    setRunning(false);
    if (phaseEndAtRef.current != null) {
      setRemainingMs(Math.max(0, phaseEndAtRef.current - Date.now()));
    }
    phaseEndAtRef.current = null;
  }

  function handleReset() {
    setRunning(false);
    phaseEndAtRef.current = null;
    setPhase("idle");
    setCurrentRound(1);
    setRemainingMs(0);
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
            onChange={setRounds}
            min={1}
            max={20}
          />
          <NumberField
            label="Durée d'un round (min)"
            value={workMin}
            onChange={setWorkMin}
            min={1}
            max={20}
          />
          <NumberField
            label="Repos entre rounds (min)"
            value={restMin}
            onChange={setRestMin}
            min={0}
            max={10}
          />
          <NumberField
            label="Préparation avant le 1er round (sec)"
            value={prepSec}
            onChange={setPrepSec}
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
          {!running && phase !== "done" && (
            <button
              onClick={handleStart}
              className="h-12 px-8 rounded-full bg-accent text-white font-semibold"
            >
              {phase === "idle" ? "Démarrer" : "Reprendre"}
            </button>
          )}
          {running && (
            <button
              onClick={handlePause}
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
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const startRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      if (startRef.current == null) return;
      setElapsedMs(Date.now() - startRef.current);
    }, 250);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function handleStart() {
    setSaved(false);
    startRef.current = Date.now() - elapsedMs;
    setRunning(true);
  }
  function handlePause() {
    setRunning(false);
  }
  function handleReset() {
    setRunning(false);
    setElapsedMs(0);
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
        {!running ? (
          <button
            onClick={handleStart}
            className="h-12 px-8 rounded-full bg-accent text-white font-semibold"
          >
            {elapsedMs > 0 ? "Reprendre" : "Démarrer"}
          </button>
        ) : (
          <button
            onClick={handlePause}
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
      {elapsedMs > 0 && !running && (
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
