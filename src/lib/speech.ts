"use client";

function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Web Audio API Synthesizer for DBZ Sound Effects
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

const audioCache = new Map<string, HTMLAudioElement>();

function getSoundUrl(file: string): string {
  if (typeof window === "undefined") return `/sounds/${file}`;
  const origin = window.location.origin;
  const isGithub = window.location.pathname.includes("/jjb");
  const base = isGithub ? "/jjb" : "";
  return `${origin}${base}/sounds/${file}`;
}

export function preloadAndUnlockAudio() {
  if (typeof window === "undefined") return;
  const files = [
    "dbz-round-start.mp3",
    "dbz-last-minute.mp3",
    "dbz-rest.mp3",
    "dbz-finish.mp3",
    "dbz-scouter.mp3",
    "dbz-teleport.mp3",
    "dbz-aura.mp3",
    "dbz-kamehameha.mp3",
    "dbz-senzu.mp3"
  ];
  files.forEach((f) => {
    if (!audioCache.has(f)) {
      const audio = new Audio(getSoundUrl(f));
      audio.volume = 0.8;
      audio.load();
      audioCache.set(f, audio);
    }
  });
}

export function playAudioFile(file: string) {
  try {
    preloadAndUnlockAudio();
    let audio = audioCache.get(file);
    if (!audio) {
      audio = new Audio(getSoundUrl(file));
      audio.volume = 0.8;
      audioCache.set(file, audio);
    }
    audio.currentTime = 0;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Retry with a fresh Audio instance fallback if cached audio was blocked by autoplay policy
        const fallback = new Audio(getSoundUrl(file));
        fallback.volume = 0.8;
        fallback.play().catch(() => {});
      });
    }
  } catch {}
}

export function playDbzPowerup() {
  playAudioFile("dbz-aura.mp3");
}

export function playDbzScouter() {
  playAudioFile("dbz-scouter.mp3");
}

export function playDbzSenzu() {
  playAudioFile("dbz-senzu.mp3");
}

export function playDbzKamehameha() {
  playAudioFile("dbz-kamehameha.mp3");
}

export function playDbzTeleport() {
  playAudioFile("dbz-teleport.mp3");
}

export function speak(text: string, pitch = 1.0, rate = 1.05) {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = rate;
    utterance.pitch = pitch;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

export function speakDbzRoundStart(roundNum: number) {
  playAudioFile("dbz-round-start.mp3");
}

export function speakDbzLastMinute() {
  playAudioFile("dbz-last-minute.mp3");
}

export function speakDbzRest() {
  playAudioFile("dbz-rest.mp3");
}

export function speakDbzFinish() {
  playAudioFile("dbz-finish.mp3");
}

// Classic voices
export function speakRoundStart(roundNum: number) {
  speak(`Round ${roundNum}. Bagarre !`);
}

export function speakRest() {
  speak("Repos. Respirez.");
}

export function speakLastMinute() {
  speak("Dernière minute ! Accélérez !");
}

export function speakFinish() {
  speak("Terminé ! Beau travail, champion !");
}
