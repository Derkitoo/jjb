"use client";

function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string) {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 1.05; // Slightly faster for punchy delivery
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

export function speakRoundStart(roundNum: number) {
  speak(`Round ${roundNum}. Bagarre !`);
}

export function speakGo() {
  speak("Bagarre ! C'est parti !");
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
