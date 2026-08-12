"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Card, SectionTitle } from "@/components/Card";
import { useAdmin } from "@/lib/admin-context";
import { playAudioFile } from "@/lib/speech";

interface ExerciseGuide {
  id: string;
  name: string;
  sets: string;
  targetMuscles: string;
  bjjBenefit: string;
  icon: string;
  steps: {
    start: string;
    action: string;
    breathing: string;
    proTip: string;
  };
}

interface RoutinePro {
  id: string;
  title: string;
  category: string;
  level: "Débutant" | "Intermédiaire" | "Athlète Élite" | "Tous Niveaux";
  durationMin: number;
  icon: string;
  color: string;
  description: string;
  exercises: ExerciseGuide[];
}

const BJJ_ROUTINES_PRO: RoutinePro[] = [
  {
    id: "grip",
    title: "Grip of Steel & Avant-bras",
    category: "Poigne & Préhension Gi",
    level: "Athlète Élite",
    durationMin: 15,
    icon: "🦾",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    description: "Développe une poigne de fer incassable pour verrouiller les revers, poignets et kimonos sans fatiguer tes bras.",
    exercises: [
      {
        id: "gi-pullups",
        name: "Tractions sur Gi / Serviette",
        sets: "4 séries × 8 à 12 reps",
        targetMuscles: "Avant-bras, Trapezes, Grands dorsaux",
        bjjBenefit: "Empêche l'adversaire de casser tes grips en garde fermée et contrôle du col.",
        icon: "🥋",
        steps: {
          start: "Passe deux serviettes ou un vieux Gi par-dessus la barre de traction. Saisis les bords fermement en prise marteau.",
          action: "Tire avec tes dorsaux et tes avant-bras pour amener le menton au-dessus de tes mains. Marque 1 sec de pause en haut.",
          breathing: "Expire lors de la montée, inspire doucement en contrôlant la descente.",
          proTip: "Ne relâche pas la tension sur la poigne lors de la descente : c'est le travail excentrique qui forge le grip !",
        },
      },
      {
        id: "farmer-walk",
        name: "Farmer Walk (Marche du Fermier)",
        sets: "3 séries × 45 secondes",
        targetMuscles: "Grip total, Trapèzes, Gainage abdominal",
        bjjBenefit: "Maintien de la posture et résistance à l'effort sous haute fatigue.",
        icon: "🧳",
        steps: {
          start: "Place deux kettlebells lourdes (ou haltères) de chaque côté de tes pieds. Dos droit, poitrine sortie, verrouille tes omoplates.",
          action: "Soulevé de terre propre pour décoller les charges. Marche à pas réguliers en maintenant le buste hyper-stable.",
          breathing: "Respiration cage thoracique haute et constante, sans relâcher la ceinture abdominale.",
          proTip: "Serre les poignées au maximum de ta force pendant toute la durée de la marche.",
        },
      },
      {
        id: "wrist-roller",
        name: "Wrist Roller / Extensions de Poignets",
        sets: "3 séries × 15 enroulements",
        targetMuscles: "Fléchisseurs et extenseurs des doigts",
        bjjBenefit: "Endurance musculaire des doigts pour les longues phases de garde.",
        icon: "🌀",
        steps: {
          start: "Bras tendus à hauteur d'épaules, tiendras le rouleau de poignet avec la charge suspendue au centre.",
          action: "Enroule la corde alternativement avec le poignet droit puis le poignet gauche jusqu'à faire monter le poids tout en haut.",
          breathing: "Inspire au départ, expire de façon fluide pendant la rotation des poignets.",
          proTip: "Garde les coudes verrouillés pour également solliciter les deltoïdes antérieurs.",
        },
      },
    ],
  },
  {
    id: "core-hips",
    title: "Core & Mobilité des Hanches",
    category: "Gainage Rotatif & Pontage",
    level: "Intermédiaire",
    durationMin: 20,
    icon: "🧘‍♂️",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    description: "Renforce les muscles stabilisateurs du bassin et des hanches pour des sorties de montée explosives et des balayages fluides.",
    exercises: [
      {
        id: "tgu",
        name: "Turkish Get-Up (Relevé Turc)",
        sets: "3 séries × 5 reps / côté",
        targetMuscles: "Épaules, Sangle abdominale, Fessiers, Hanches",
        bjjBenefit: "Améliore la stabilité d'épaule au sol et la capacité de se relever sous pression.",
        icon: "🏋️‍♂️",
        steps: {
          start: "Allongé sur le dos, une kettlebell verrouillée bras tendu au-dessus de la poitrine du côté de la jambe pliée.",
          action: "Prends appui sur le coude opposé, passe sur la main, lève le bassin, glisse la jambe arrière sous le corps et redresse-toi en fente.",
          breathing: "Inspire à chaque étape de transition, expire lors de la poussée vers le haut.",
          proTip: "Garde les yeux fixés sur la kettlebell du début à la fin du mouvement.",
        },
      },
      {
        id: "kb-bridge",
        name: "Pontages Lourds (Weighted Bridges)",
        sets: "4 séries × 12 reps (pause 2 sec)",
        targetMuscles: "Chaîne postérieure, Fessiers, Ischio-jambiers",
        bjjBenefit: "Nécessaire pour le bridging de puissance (sortie de montée et de contrôle latéral).",
        icon: "🌉",
        steps: {
          start: "Sur le dos, pieds à plat près des fessiers. Pose un disque ou une kettlebell sur le bas du bassin.",
          action: "Pousse fort dans les talons pour projeter les hanches vers le plafond en contractant puissamment les fessiers en haut.",
          breathing: "Expire puissamment lors du pontage vers le haut, inspire en redescendant.",
          proTip: "En haut du mouvement, pivote légèrement sur une épaule pour simuler un pontage réel de JJB.",
        },
      },
      {
        id: "weighted-shrimp",
        name: "Écrevisse Lestée (Weighted Shrimping)",
        sets: "3 séries × 10 reps / côté",
        targetMuscles: "Obliques, Flexeurs de hanche, Bas du dos",
        bjjBenefit: "Rétention de garde et création d'espace vital sous le poids de l'adversaire.",
        icon: "🦐",
        steps: {
          start: "Position de garde sur le côté, un disque de 5-10kg maintenu sur la poitrine.",
          action: "Pousse sur les pieds et sors les hanches vers l'arrière le plus loin possible en repliant les genoux vers le buste.",
          breathing: "Expire lors de l'expulsion des hanches, inspire lors de la remise en axe.",
          proTip: "Garde les coudes collés aux côtes comme pour créer un frame (cadre de protection).",
        },
      },
    ],
  },
  {
    id: "takedown-power",
    title: "Explosive Takedowns & Legs",
    category: "Puissance & Aménées au sol",
    level: "Athlète Élite",
    durationMin: 30,
    icon: "🚀",
    color: "border-accent/40 bg-accent/10 text-accent",
    description: "Développe une détente verticale et une extension de hanche maximale pour des Double Legs et Single Legs ultra-rapides.",
    exercises: [
      {
        id: "deadlift",
        name: "Soulevé de Terre (Deadlift Athletique)",
        sets: "4 séries × 5 reps (Charge lourde)",
        targetMuscles: "Ischio-jambiers, Fessiers, Lombaires, Grip",
        bjjBenefit: "Génère la force brute nécessaire pour soulever et amener l'adversaire au sol.",
        icon: "🏋️",
        steps: {
          start: "Pieds largeur d'épaules sous la barre. Saisie en prise mixte ou pronation. Poitrine sortie, lombaires neutres.",
          action: "Pousse dans le sol avec les jambes tout en tirant la barre le long des tibias et cuisses jusqu'à l'extension complète.",
          breathing: "Blocage respiratoire (Valsalva) au démarrage, expire une fois la barre verrouillée en haut.",
          proTip: "Ne cambre jamais le bas du dos en haut : la finition se fait par la contraction fessière.",
        },
      },
      {
        id: "kb-swings",
        name: "Kettlebell Swings Explosifs",
        sets: "4 séries × 20 reps",
        targetMuscles: "Hanches, Fessiers, Ischios, Core",
        bjjBenefit: "Transfert d'énergie explosif pour les projections (Seoi Nage, Baïonnette).",
        icon: "🔔",
        steps: {
          start: "Kettlebell posée devant toi. Flexion de hanches (Hinge), dos plat, attrape la poignée à deux mains.",
          action: "Passe la KB entre les cuisses vers l'arrière puis projette les hanches vers l'avant de manière ultra-explosive.",
          breathing: "Inspiration vive à la descente, expiration explosive au moment de l'extension de hanche.",
          proTip: "Les bras ne tirent pas la charge : c'est uniquement le coup de fouet des hanches qui fait voler la kettlebell.",
        },
      },
      {
        id: "jump-squats",
        name: "Jump Squats (Squats Sautés)",
        sets: "3 séries × 10 reps",
        targetMuscles: "Quadriceps, Mollets, Puissance plyométrique",
        bjjBenefit: "Changement de niveau instantané pour pénétrer sous la garde adverse.",
        icon: "💥",
        steps: {
          start: "Pieds largeur d'épaules. Descends en demi-squat contrôlé.",
          action: "Explose vers le haut en poussant sur les pointes de pieds pour sauter le plus haut possible. Atterris en douceur.",
          breathing: "Inspire à la descente, expire lors de l'impulsion sautée.",
          proTip: "Amortis immédiatement l'atterrissage en enchaînant la répétition suivante sans marquer d'arrêt.",
        },
      },
    ],
  },
  {
    id: "neck-shoulder",
    title: "Neck & Shoulder Armor",
    category: "Blindage Anti-Soumission",
    level: "Tous Niveaux",
    durationMin: 15,
    icon: "🛡️",
    color: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    description: "Renforce les trapèzes, les muscles du cou et les coiffes des rotateurs pour résister aux guillotines et clés d'épaules.",
    exercises: [
      {
        id: "neck-bridges",
        name: "Ponts de Lutteur Iso (Neck Bridges)",
        sets: "3 séries × 30 secondes",
        targetMuscles: "Muscles profonds du cou, Trapèzes",
        bjjBenefit: "Protection cervicale maximale contre les strangulations et guillotines.",
        icon: "🧠",
        steps: {
          start: "Tête posée sur un tapis souple, pieds à plat au sol. Décolle le bassin.",
          action: "Transfère le poids du corps sur le sommet du crâne en maintenant une contraction isométrique contrôlée.",
          breathing: "Respiration continue et calme, ne jamais bloquer l'air.",
          proTip: "Niveaux débutants : utilisez les mains au sol en soutien de sécurité de chaque côté de la tête.",
        },
      },
      {
        id: "face-pulls",
        name: "Face Pulls à la Poulie / Élastique",
        sets: "4 séries × 15 reps (pause 1 sec)",
        targetMuscles: "Deltoïdes postérieurs, Rotateurs externes",
        bjjBenefit: "Posture redressée et prévention des blessures d'épaules (Kimura/Americana).",
        icon: "🏹",
        steps: {
          start: "Attache une corde à la poulie haute ou un élastique au poteau à hauteur de visage.",
          action: "Tire la corde vers le front en écartant les poignées et en amenant les coudes vers l'arrière et le haut.",
          breathing: "Expire lors de la traction vers le visage, inspire au retour.",
          proTip: "Pense à 'montrer tes biceps' en fin de mouvement pour garantir une rotation externe complète.",
        },
      },
    ],
  },
];

function formatTimer(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function WorkoutPage() {
  const { ready, workoutSessions, addWorkoutSession, deleteWorkoutSession, exercisePRs, updateExercisePR } = useData();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState<"routines" | "prs" | "log">("routines");
  const [selectedRoutine, setSelectedRoutine] = useState<RoutinePro | null>(null);
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<ExerciseGuide | null>(null);

  // Live Routine Guided Player States
  const [guidedMode, setGuidedMode] = useState(false);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [timerTotalSec, setTimerTotalSec] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Form states for manual log
  const [title, setTitle] = useState("Renforcement Musculaire BJJ");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
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

  function startGuidedWorkout(r: RoutinePro) {
    setSelectedRoutine(r);
    setGuidedMode(true);
    setCurrentExIndex(0);
    const totalSec = r.durationMin * 60;
    setTimerTotalSec(totalSec);
    setTimerSec(totalSec);
    setTimerRunning(true);
    playAudioFile("dbz-round-start.mp3");
  }

  function finishAndSaveGuidedWorkout() {
    if (!selectedRoutine) return;
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const elapsedSec = timerTotalSec - timerSec;
    const elapsedMin = Math.max(1, Math.round(elapsedSec / 60));

    addWorkoutSession({
      date: new Date().toISOString().slice(0, 10),
      title: `Séance Pro : ${selectedRoutine.title}`,
      durationMin: elapsedMin,
      intensity: 4,
      exercises: selectedRoutine.exercises.map((e) => ({ name: e.name, sets: 4, reps: 10 })),
      notes: `Séance Guidée Pro effectuée (${formatTimer(elapsedSec)} d'effort).`,
    });

    setGuidedMode(false);
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
        ? selectedRoutine.exercises.map((e) => ({ name: e.name, sets: 4, reps: 10 }))
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
      date: new Date().toISOString().slice(0, 10),
    });
    setShowPrModal(false);
    setPrWeight("");
    setPrReps("");
  }

  return (
    <div className="space-y-6">
      {/* Exercise Detail Modal */}
      {selectedExerciseModal && (
        <ExerciseGuideModal
          exercise={selectedExerciseModal}
          onClose={() => setSelectedExerciseModal(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionTitle
          title="Renforcement Pro BJJ"
          subtitle="Préparation physique & conditionnement spécifique avec guides d'exécution pas-à-pas"
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
          🏋️ Programmes BJJ Pro
        </button>
        <button
          onClick={() => setActiveTab("prs")}
          className={`flex-1 h-9 rounded-full text-xs font-semibold transition-colors ${
            activeTab === "prs" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          🏆 Records (PRs)
        </button>
        <button
          onClick={() => setActiveTab("log")}
          className={`flex-1 h-9 rounded-full text-xs font-semibold transition-colors ${
            activeTab === "log" ? "bg-accent text-white" : "text-muted"
          }`}
        >
          📋 Journal ({workoutSessions.length})
        </button>
      </div>

      {/* Tab 1: Pro Routines */}
      {activeTab === "routines" && (
        <div className="space-y-5">
          {/* Routine Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BJJ_ROUTINES_PRO.map((r) => (
              <Card
                key={r.id}
                className={`p-4 border text-left transition-all duration-200 space-y-3 ${r.color} hover:brightness-125`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl p-2 rounded-xl bg-surface/60 border border-white/10">{r.icon}</span>
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground">{r.title}</h3>
                      <p className="text-[11px] text-muted">{r.category}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface border border-white/10 shrink-0">
                    {r.level}
                  </span>
                </div>

                <p className="text-xs text-muted leading-snug">{r.description}</p>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => startGuidedWorkout(r)}
                    className="flex-1 h-9 rounded-xl bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>▶</span>
                    <span>Lancer la Séance ({r.durationMin}m)</span>
                  </button>

                  <button
                    onClick={() => setSelectedRoutine(r)}
                    className="h-9 px-3 rounded-xl bg-surface border border-white/10 text-foreground font-semibold text-xs transition-colors hover:bg-surface-2"
                  >
                    🔍 Guides ({r.exercises.length})
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Guided Workout Player Modal / Fullscreen Card */}
          {guidedMode && selectedRoutine && (
            <Card className="space-y-4 border-2 border-accent bg-surface-2/90 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedRoutine.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">
                      Mode Entraînement Guidé : {selectedRoutine.title}
                    </h3>
                    <p className="text-xs text-accent font-semibold">
                      Exercice {currentExIndex + 1} / {selectedRoutine.exercises.length}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setGuidedMode(false)}
                  className="text-xs text-muted hover:text-foreground bg-surface px-2.5 py-1 rounded-full border border-border"
                >
                  Quitter
                </button>
              </div>

              {/* Timer Progress */}
              <div className="p-4 rounded-2xl bg-surface border border-accent/40 text-center space-y-2">
                <div className="text-3xl font-black text-foreground font-mono">
                  {formatTimer(timerSec)}
                </div>
                <div className="w-full bg-surface-2 h-2.5 rounded-full overflow-hidden border border-border">
                  <div
                    className="bg-accent h-full transition-all duration-1000"
                    style={{
                      width: `${((timerTotalSec - timerSec) / timerTotalSec) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    onClick={() => setTimerRunning((v) => !v)}
                    className="px-4 py-1.5 rounded-full bg-surface-2 border border-border text-foreground text-xs font-bold active:scale-95"
                  >
                    {timerRunning ? "⏸ Pause" : "▶ Reprendre"}
                  </button>
                </div>
              </div>

              {/* Current Guided Exercise Card */}
              {selectedRoutine.exercises[currentExIndex] && (
                <div className="space-y-3 p-4 rounded-2xl bg-surface border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedRoutine.exercises[currentExIndex].icon}</span>
                      <div>
                        <h4 className="font-extrabold text-sm text-foreground">
                          {selectedRoutine.exercises[currentExIndex].name}
                        </h4>
                        <span className="text-xs text-accent font-bold">
                          {selectedRoutine.exercises[currentExIndex].sets}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedExerciseModal(selectedRoutine.exercises[currentExIndex])}
                      className="px-2.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-bold border border-accent/30"
                    >
                      💡 Exécution Pas-à-Pas
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-muted border-t border-border/60 pt-2">
                    <p className="leading-snug">
                      <strong className="text-foreground">📍 Position :</strong>{" "}
                      {selectedRoutine.exercises[currentExIndex].steps.start}
                    </p>
                    <p className="leading-snug">
                      <strong className="text-foreground">🔄 Exécution :</strong>{" "}
                      {selectedRoutine.exercises[currentExIndex].steps.action}
                    </p>
                    <p className="text-[11px] text-accent leading-snug">
                      <strong>🥋 Bénéfice JJB :</strong>{" "}
                      {selectedRoutine.exercises[currentExIndex].bjjBenefit}
                    </p>
                  </div>
                </div>
              )}

              {/* Exercise Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentExIndex === 0}
                  onClick={() => setCurrentExIndex((i) => Math.max(0, i - 1))}
                  className="px-3 py-2 rounded-xl bg-surface-2 text-xs font-bold disabled:opacity-40"
                >
                  ◀ Exercice Précédent
                </button>

                {currentExIndex < selectedRoutine.exercises.length - 1 ? (
                  <button
                    onClick={() => setCurrentExIndex((i) => i + 1)}
                    className="px-4 py-2 rounded-xl bg-surface-2 border border-border text-foreground text-xs font-bold hover:bg-border"
                  >
                    Suivant ➔
                  </button>
                ) : (
                  <button
                    onClick={finishAndSaveGuidedWorkout}
                    className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-extrabold shadow-md shadow-accent/20 active:scale-95"
                  >
                    ✓ Terminer & Enregistrer la Séance
                  </button>
                )}
              </div>
            </Card>
          )}

          {/* Routine Exercises Guide Drawer */}
          {selectedRoutine && !guidedMode && (
            <Card className="space-y-4 border-accent/40 bg-surface-2/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <span>{selectedRoutine.icon}</span>
                  <span>Guides d&apos;Exécution : {selectedRoutine.title}</span>
                </div>
                <button
                  onClick={() => setSelectedRoutine(null)}
                  className="text-xs text-muted hover:text-foreground"
                >
                  Fermer ✕
                </button>
              </div>

              <div className="space-y-3">
                {selectedRoutine.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => setSelectedExerciseModal(ex)}
                    className="p-3 rounded-xl bg-surface border border-border space-y-1.5 text-xs cursor-pointer hover:border-accent/40 transition-all"
                  >
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span className="flex items-center gap-2">
                        <span>{ex.icon}</span>
                        <span>{ex.name}</span>
                      </span>
                      <span className="text-accent text-[11px]">{ex.sets}</span>
                    </div>
                    <p className="text-[11px] text-muted line-clamp-2">{ex.bjjBenefit}</p>
                    <span className="text-[10px] text-accent font-semibold block pt-1">
                      ➔ Cliquer pour voir la fiche d&apos;exécution pas-à-pas
                    </span>
                  </div>
                ))}
              </div>
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

function ExerciseGuideModal({
  exercise,
  onClose,
}: {
  exercise: ExerciseGuide;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-white/10 rounded-3xl p-5 space-y-4 shadow-2xl shadow-black/90 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl p-2 rounded-xl bg-surface-2 border border-white/10">{exercise.icon}</span>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">{exercise.name}</h3>
              <p className="text-xs text-accent font-bold">{exercise.sets}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border text-muted hover:text-foreground font-bold flex items-center justify-center transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-accent/10 border border-accent/30 space-y-1">
          <span className="text-[11px] font-bold text-accent uppercase tracking-wider">🥋 Application Tactique JJB</span>
          <p className="text-xs text-foreground font-medium leading-relaxed">{exercise.bjjBenefit}</p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
            <strong className="text-foreground block font-bold">📍 1. Position Initiale & Placement :</strong>
            <p className="text-muted leading-relaxed">{exercise.steps.start}</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
            <strong className="text-foreground block font-bold">🔄 2. Mouvement & Exécution :</strong>
            <p className="text-muted leading-relaxed">{exercise.steps.action}</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
            <strong className="text-foreground block font-bold">💨 3. Respiration & Rythme :</strong>
            <p className="text-muted leading-relaxed">{exercise.steps.breathing}</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <strong className="text-amber-300 block font-bold">💡 Astuce Pro d&apos;Exécution :</strong>
            <p className="text-muted leading-relaxed">{exercise.steps.proTip}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-10 rounded-full bg-accent text-white font-bold text-xs shadow-md shadow-accent/20 active:scale-95"
        >
          Fermer la Fiche d&apos;Exécution
        </button>
      </div>
    </div>
  );
}
