"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTimer } from "@/lib/timer-context";

function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const PHASE_LABEL: Record<string, string> = {
  prep: "Préparation",
  work: "Round",
  rest: "Repos",
};

export default function TimerBanner() {
  const pathname = usePathname();
  const { phase, remainingMs, roundRunning, elapsedMs, stopwatchRunning } =
    useTimer();

  if (pathname === "/timer") return null;

  const roundActive = phase === "prep" || phase === "work" || phase === "rest";

  if (!roundActive && !stopwatchRunning) return null;

  const label = roundActive
    ? `${PHASE_LABEL[phase]} · ${formatTime(remainingMs)}`
    : `Chrono libre · ${formatTime(elapsedMs)}`;
  const isPaused = roundActive ? !roundRunning : !stopwatchRunning;

  return (
    <Link
      href="/timer"
      className="fixed inset-x-4 bottom-20 md:inset-x-auto md:right-6 md:bottom-6 z-40 flex items-center justify-between gap-3 rounded-full bg-accent text-white pl-4 pr-2 py-2 shadow-lg shadow-black/30"
    >
      <span className="text-sm font-semibold flex items-center gap-2">
        <span className="text-base">{isPaused ? "⏸️" : "⏱️"}</span>
        {label}
      </span>
      <span className="text-xs bg-white/20 rounded-full px-3 py-1.5 font-medium shrink-0">
        Reprendre
      </span>
    </Link>
  );
}
