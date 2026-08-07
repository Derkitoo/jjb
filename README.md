# BJJ Coach 🥋

Application perso pour rester actif en jiu-jitsu brésilien : suivi des séances,
chrono d'entraînement (rounds + chrono libre) et coin diète avec recettes healthy.

## Démarrer en local

```bash
npm install
npm run dev
```

Puis ouvre [http://localhost:3000](http://localhost:3000).

## Fonctionnalités

- **Séances** : log de tes entraînements (type, durée, intensité, techniques, notes),
  streak hebdomadaire et stats rapides.
- **Chrono** : minuteur de rounds configurable (nombre de rounds, durée, repos,
  préparation) avec bips sonores, + un chrono libre. Les deux peuvent être
  enregistrés directement comme séance.
- **Diète** : bibliothèque de recettes healthy orientées pratiquant de combat
  (macros, ingrédients, étapes), favoris, recherche, et ajout de tes propres
  recettes.
- **Réglages** : suivi de poids, export/import JSON de toutes tes données
  (tout est stocké en local dans le navigateur, rien n'est envoyé sur un serveur).

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. Aucune base de données :
les données vivent dans le `localStorage` du navigateur, avec export/import JSON
pour les sauvegarder ou changer d'appareil.
