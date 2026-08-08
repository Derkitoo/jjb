"use client";

function canVibrate(): boolean {
  return typeof window !== "undefined" && "navigator" in window && typeof navigator.vibrate === "function";
}

export function vibrateTick() {
  if (canVibrate()) {
    try {
      navigator.vibrate(40);
    } catch {}
  }
}

export function vibrateGo() {
  if (canVibrate()) {
    try {
      navigator.vibrate([150, 50, 150]);
    } catch {}
  }
}

export function vibrateRest() {
  if (canVibrate()) {
    try {
      navigator.vibrate(250);
    } catch {}
  }
}

export function vibrateFinish() {
  if (canVibrate()) {
    try {
      navigator.vibrate([300, 100, 300, 100, 500]);
    } catch {}
  }
}
