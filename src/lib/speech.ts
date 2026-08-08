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

function getSoundPath(file: string): string {
  if (typeof window === "undefined") return `/sounds/${file}`;
  return window.location.pathname.includes("/jjb") ? `/jjb/sounds/${file}` : `/sounds/${file}`;
}

export function playAudioFile(file: string) {
  try {
    const audio = new Audio(getSoundPath(file));
    audio.volume = 0.8;
    audio.play().catch(() => {});
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
  playDbzPowerup();
}

export function speakDbzLastMinute() {
  playAudioFile("dbz-yt-extract.mp3");
}

export function speakDbzRest() {
  playDbzSenzu();
}

export function speakDbzFinish() {
  playDbzPowerup();
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
