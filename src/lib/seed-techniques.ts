import { Technique } from "./types";

// Curriculum générique de progression en JJB, à titre indicatif : chaque
// académie / fédération a ses propres exigences de passage de grade. Sert de
// checklist personnelle, pas d'une référence officielle.
export const SEED_TECHNIQUES: Technique[] = [
  // --- Ceinture blanche : les fondamentaux ---
  { id: "t-1", name: "Garde fermée", belt: "blanche", category: "garde", status: "a_decouvrir" },
  { id: "t-2", name: "Passage de garde genou-élbow", belt: "blanche", category: "passage", status: "a_decouvrir" },
  { id: "t-3", name: "Étranglement en croix (cross collar)", belt: "blanche", category: "soumission", status: "a_decouvrir" },
  { id: "t-4", name: "Clé de bras (armbar) depuis la garde", belt: "blanche", category: "soumission", status: "a_decouvrir" },
  { id: "t-5", name: "Échappement du montage (mount escape)", belt: "blanche", category: "echappement", status: "a_decouvrir" },
  { id: "t-6", name: "Échappement du côté contrôlé (side control)", belt: "blanche", category: "echappement", status: "a_decouvrir" },
  { id: "t-7", name: "Montée en garde (bridge & shrimp)", belt: "blanche", category: "echappement", status: "a_decouvrir" },
  { id: "t-8", name: "Contrôle dos avec crochets", belt: "blanche", category: "controle", status: "a_decouvrir" },

  // --- Ceinture bleue : construire son jeu ---
  { id: "t-9", name: "Balayage ciseaux (scissor sweep)", belt: "bleue", category: "garde", status: "a_decouvrir" },
  { id: "t-10", name: "Balayage hip bump", belt: "bleue", category: "garde", status: "a_decouvrir" },
  { id: "t-11", name: "Garde araignée (spider guard)", belt: "bleue", category: "garde", status: "a_decouvrir" },
  { id: "t-12", name: "Passage torreando", belt: "bleue", category: "passage", status: "a_decouvrir" },
  { id: "t-13", name: "Étranglement triangle", belt: "bleue", category: "soumission", status: "a_decouvrir" },
  { id: "t-14", name: "Kimura depuis side control", belt: "bleue", category: "soumission", status: "a_decouvrir" },
  { id: "t-15", name: "Prise de dos depuis la garde", belt: "bleue", category: "controle", status: "a_decouvrir" },
  { id: "t-16", name: "Projection hanche (hip throw / o-goshi)", belt: "bleue", category: "projection", status: "a_decouvrir" },

  // --- Ceinture violette : affiner et diversifier ---
  { id: "t-17", name: "Garde De la Riva", belt: "violette", category: "garde", status: "a_decouvrir" },
  { id: "t-18", name: "X-guard", belt: "violette", category: "garde", status: "a_decouvrir" },
  { id: "t-19", name: "Passage genou glissé (knee slide)", belt: "violette", category: "passage", status: "a_decouvrir" },
  { id: "t-20", name: "Passage smash (stack pass)", belt: "violette", category: "passage", status: "a_decouvrir" },
  { id: "t-21", name: "Étranglement Ezekiel", belt: "violette", category: "soumission", status: "a_decouvrir" },
  { id: "t-22", name: "Clé de cheville (straight ankle lock)", belt: "violette", category: "soumission", status: "a_decouvrir" },
  { id: "t-23", name: "Berimbolo (introduction)", belt: "violette", category: "controle", status: "a_decouvrir" },
  { id: "t-24", name: "Enchaînements de balayages (chain sweeps)", belt: "violette", category: "garde", status: "a_decouvrir" },

  // --- Ceinture marron : précision et combinaisons ---
  { id: "t-25", name: "50/50 guard", belt: "marron", category: "garde", status: "a_decouvrir" },
  { id: "t-26", name: "Leg drag pass", belt: "marron", category: "passage", status: "a_decouvrir" },
  { id: "t-27", name: "Heel hook (contrôlé, entraînement encadré)", belt: "marron", category: "soumission", status: "a_decouvrir" },
  { id: "t-28", name: "Étranglement lapel (worm guard / lapel choke)", belt: "marron", category: "soumission", status: "a_decouvrir" },
  { id: "t-29", name: "Reprise de garde avancée sous pression", belt: "marron", category: "echappement", status: "a_decouvrir" },
  { id: "t-30", name: "Enchaînements passage → contrôle → soumission", belt: "marron", category: "controle", status: "a_decouvrir" },

  // --- Ceinture noire : maîtrise et jeu personnel ---
  { id: "t-31", name: "Système de garde personnel affirmé", belt: "noire", category: "garde", status: "a_decouvrir" },
  { id: "t-32", name: "Adaptation du jeu gi / no-gi", belt: "noire", category: "controle", status: "a_decouvrir" },
  { id: "t-33", name: "Enseignement / décomposition technique à un partenaire", belt: "noire", category: "controle", status: "a_decouvrir" },
  { id: "t-34", name: "Stratégie de combat en compétition", belt: "noire", category: "controle", status: "a_decouvrir" },
];
