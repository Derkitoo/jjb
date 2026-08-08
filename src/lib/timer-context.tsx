"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { playFinish, playGo, playRestStart, playTick } from "./beep";
import { vibrateFinish, vibrateGo, vibrateRest, vibrateTick } from "./haptics";
import { speakFinish, speakLastMinute, speakRest, speakRoundStart } from "./speech";

// État vivant dans un Provider monté une fois dans le layout racine : il
// survit à la navigation entre pages (le layout ne se démonte pas), ce qui
// évite que le chrono ne se réinitialise quand on change d'onglet.

export type RoundPhase = "idle" | "prep" | "work" | "rest" | "done";

export interface RoundConfig {
  rounds: number;
  workMin: number;
  restMin: number;
  prepSec: number;
  voiceCoachEnabled?: boolean;
}

interface TimerContextValue {
  // Minuteur de rounds
  config: RoundConfig;
  setConfig: (patch: Partial<RoundConfig>) => void;
  phase: RoundPhase;
  currentRound: number;
  remainingMs: number;
  roundRunning: boolean;
  startRoundTimer: () => void;
  pauseRoundTimer: () => void;
  resetRoundTimer: () => void;

  // Chrono libre
  elapsedMs: number;
  stopwatchRunning: boolean;
  startStopwatch: () => void;
  pauseStopwatch: () => void;
  resetStopwatch: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

const DEFAULT_CONFIG: RoundConfig = {
  rounds: 5,
  workMin: 5,
  restMin: 1,
  prepSec: 10,
  voiceCoachEnabled: true,
};

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<RoundConfig>(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<RoundPhase>("idle");
  const [currentRound, setCurrentRound] = useState(1);
  const [remainingMs, setRemainingMs] = useState(0);
  const [roundRunning, setRoundRunning] = useState(false);

  // Chrono libre state
  const [elapsedMs, setElapsedMs] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const stopwatchStartRef = useRef<number | null>(null);

  const phaseEndAtRef = useRef<number | null>(null);
  const lastTickSecondRef = useRef<number | null>(null);
  const spokeLastMinuteRef = useRef(false);
  const configRef = useRef(config);
  const currentRoundRef = useRef(currentRound);

  // Screen Wake Lock Sentinel Reference
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    configRef.current = config;
  }, [config]);
  useEffect(() => {
    currentRoundRef.current = currentRound;
  }, [currentRound]);

  // Screen Wake Lock handler to keep screen awake while timer is running
  useEffect(() => {
    const isTimerActive = roundRunning || stopwatchRunning;
    
    async function requestWakeLock() {
      if (isTimerActive && typeof window !== "undefined" && "wakeLock" in navigator) {
        try {
          if (!wakeLockRef.current) {
            wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
          }
        } catch (err) {
          console.log("Wake Lock unsupported or denied:", err);
        }
      } else if (!isTimerActive && wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {}
      }
    }

    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [roundRunning, stopwatchRunning]);

  const setConfig = useCallback((patch: Partial<RoundConfig>) => {
    setConfigState((c) => ({ ...c, ...patch }));
  }, []);

  const advancePhase = useCallback(() => {
    const { workMin, restMin, rounds, voiceCoachEnabled } = configRef.current;
    const workMs = workMin * 60 * 1000;
    const restMs = restMin * 60 * 1000;
    spokeLastMinuteRef.current = false;

    setPhase((prevPhase) => {
      if (prevPhase === "prep") {
        playGo();
        vibrateGo();
        if (voiceCoachEnabled) speakRoundStart(currentRoundRef.current);
        phaseEndAtRef.current = Date.now() + workMs;
        setRemainingMs(workMs);
        lastTickSecondRef.current = null;
        return "work";
      }
      if (prevPhase === "work") {
        const isLastRound = currentRoundRef.current >= rounds;
        if (isLastRound) {
          playFinish();
          vibrateFinish();
          if (voiceCoachEnabled) speakFinish();
          setRoundRunning(false);
          setRemainingMs(0);
          return "done";
        }
        playRestStart();
        vibrateRest();
        if (voiceCoachEnabled) speakRest();
        phaseEndAtRef.current = Date.now() + restMs;
        setRemainingMs(restMs);
        lastTickSecondRef.current = null;
        return "rest";
      }
      if (prevPhase === "rest") {
        playGo();
        vibrateGo();
        const nextRound = currentRoundRef.current + 1;
        if (voiceCoachEnabled) speakRoundStart(nextRound);
        setCurrentRound((r) => r + 1);
        phaseEndAtRef.current = Date.now() + workMs;
        setRemainingMs(workMs);
        lastTickSecondRef.current = null;
        return "work";
      }
      return prevPhase;
    });
  }, []);

  useEffect(() => {
    if (!roundRunning) return;
    const interval = setInterval(() => {
      const endAt = phaseEndAtRef.current;
      if (endAt == null) return;
      const remaining = endAt - Date.now();
      if (remaining <= 0) {
        advancePhase();
      } else {
        setRemainingMs(remaining);
        const sec = Math.ceil(remaining / 1000);

        // Annonce vocale de la dernière minute
        if (
          phase === "work" &&
          sec === 60 &&
          !spokeLastMinuteRef.current &&
          configRef.current.voiceCoachEnabled
        ) {
          spokeLastMinuteRef.current = true;
          speakLastMinute();
        }

        if (sec <= 3 && sec >= 1 && lastTickSecondRef.current !== sec) {
          lastTickSecondRef.current = sec;
          playTick();
          vibrateTick();
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [roundRunning, phase, advancePhase]);

  const startRoundTimer = useCallback(() => {
    setPhase((prevPhase) => {
      if (prevPhase === "idle" || prevPhase === "done") {
        const { prepSec, workMin } = configRef.current;
        const prepMs = prepSec * 1000;
        const workMs = workMin * 60 * 1000;
        setCurrentRound(1);
        phaseEndAtRef.current = Date.now() + (prepMs > 0 ? prepMs : workMs);
        setRemainingMs(prepMs > 0 ? prepMs : workMs);
        lastTickSecondRef.current = null;
        setRoundRunning(true);
        return prepMs > 0 ? "prep" : "work";
      }
      // reprise depuis pause
      setRemainingMs((ms) => {
        phaseEndAtRef.current = Date.now() + ms;
        return ms;
      });
      lastTickSecondRef.current = null;
      setRoundRunning(true);
      return prevPhase;
    });
  }, []);

  const pauseRoundTimer = useCallback(() => {
    setRoundRunning(false);
    if (phaseEndAtRef.current != null) {
      setRemainingMs(Math.max(0, phaseEndAtRef.current - Date.now()));
    }
    phaseEndAtRef.current = null;
  }, []);

  const resetRoundTimer = useCallback(() => {
    setRoundRunning(false);
    phaseEndAtRef.current = null;
    setPhase("idle");
    setCurrentRound(1);
    setRemainingMs(0);
  }, []);

  // --- Chrono libre ---
  useEffect(() => {
    if (!stopwatchRunning) return;
    const interval = setInterval(() => {
      if (stopwatchStartRef.current == null) return;
      setElapsedMs(Date.now() - stopwatchStartRef.current);
    }, 250);
    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  const startStopwatch = useCallback(() => {
    setElapsedMs((ms) => {
      stopwatchStartRef.current = Date.now() - ms;
      return ms;
    });
    setStopwatchRunning(true);
  }, []);

  const pauseStopwatch = useCallback(() => {
    setStopwatchRunning(false);
  }, []);

  const resetStopwatch = useCallback(() => {
    setStopwatchRunning(false);
    setElapsedMs(0);
  }, []);

  const value: TimerContextValue = {
    config,
    setConfig,
    phase,
    currentRound,
    remainingMs,
    roundRunning,
    startRoundTimer,
    pauseRoundTimer,
    resetRoundTimer,
    elapsedMs,
    stopwatchRunning,
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used within a TimerProvider");
  return ctx;
}
