"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { Card, SectionTitle } from "@/components/Card";
import {
  Recipe,
  RECIPE_CATEGORY_LABELS,
  RecipeCategory,
} from "@/lib/types";
import MacrosTab from "@/components/MacrosTab";

const CATEGORY_OPTIONS = Object.entries(RECIPE_CATEGORY_LABELS) as [
  RecipeCategory,
  string
][];

export default function DietPage() {
  const [tab, setTab] = useState<"recettes" | "macros">("recettes");
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Diète"
        subtitle="Recettes healthy et besoins caloriques"
      />
      <div className="flex gap-2 bg-surface-2 border border-border rounded-full p-1">
        <button
          onClick={() => setTab("recettes")}
          className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors ${
            tab === "recettes" ? "bg-accent-2 text-white" : "text-muted"
          }`}
        >
          Recettes
        </button>
        <button
          onClick={() => setTab("macros")}
          className={`flex-1 h-10 rounded-full text-sm font-semibold transition-colors ${
            tab === "macros" ? "bg-accent-2 text-white" : "text-muted"
          }`}
        >
          Mes macros
        </button>
      </div>
      {tab === "recettes" ? <RecipesTab /> : <MacrosTab />}
    </div>
  );
}

function RecipesTab() {
  const { ready, recipes, toggleFavorite, deleteRecipe, addRecipe } = useData();
  const [filter, setFilter] = useState<RecipeCategory | "all" | "favorites">(
    "all"
  );
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (filter === "favorites" && !r.favorite) return false;
      if (filter !== "all" && filter !== "favorites" && r.category !== filter)
        return false;
      if (query && !r.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [recipes, filter, query]);

  if (!ready) return <p className="text-muted text-sm">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {recipes.length} recette{recipes.length > 1 ? "s" : ""} healthy
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="shrink-0 h-10 px-4 rounded-full bg-accent-2 text-white font-semibold text-sm"
        >
          {showForm ? "Fermer" : "+ Recette"}
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une recette…"
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        <FilterChip
          label="Toutes"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <FilterChip
          label="⭐ Favoris"
          active={filter === "favorites"}
          onClick={() => setFilter("favorites")}
        />
        {CATEGORY_OPTIONS.map(([value, label]) => (
          <FilterChip
            key={value}
            label={label}
            active={filter === value}
            onClick={() => setFilter(value)}
          />
        ))}
      </div>

      {showForm && (
        <RecipeForm
          onSubmit={(r) => {
            addRecipe(r);
            setShowForm(false);
          }}
        />
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card className="text-sm text-muted">Aucune recette ici.</Card>
        )}
        {filtered.map((r) => (
          <RecipeRow
            key={r.id}
            recipe={r}
            onToggleFavorite={() => toggleFavorite(r.id)}
            onDelete={() => deleteRecipe(r.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
        active
          ? "bg-accent-2 border-accent-2 text-white"
          : "bg-surface-2 border-border text-muted"
      }`}
    >
      {label}
    </button>
  );
}

function RecipeRow({
  recipe,
  onToggleFavorite,
  onDelete,
}: {
  recipe: Recipe;
  onToggleFavorite: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-left"
        >
          <div className="font-medium flex items-center gap-2">
            {recipe.name}
            {recipe.custom && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border text-muted">
                perso
              </span>
            )}
          </div>
          <div className="text-xs text-muted mt-1">
            {RECIPE_CATEGORY_LABELS[recipe.category]} · {recipe.kcal} kcal ·{" "}
            {recipe.protein}g prot · {recipe.prepMinutes} min
          </div>
        </button>
        <button
          onClick={onToggleFavorite}
          aria-label="Favori"
          className="text-xl shrink-0"
        >
          {recipe.favorite ? "⭐" : "☆"}
        </button>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-border text-sm space-y-3">
          <div className="grid grid-cols-4 gap-2 text-center">
            <MacroChip label="kcal" value={recipe.kcal} />
            <MacroChip label="Prot" value={`${recipe.protein}g`} />
            <MacroChip label="Gluc" value={`${recipe.carbs}g`} />
            <MacroChip label="Lip" value={`${recipe.fat}g`} />
          </div>
          <div>
            <div className="text-muted mb-1 font-medium">Ingrédients</div>
            <ul className="list-disc list-inside space-y-0.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-muted mb-1 font-medium">Préparation</div>
            <ol className="list-decimal list-inside space-y-0.5">
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          <button onClick={onDelete} className="text-xs text-accent font-medium">
            Supprimer cette recette
          </button>
        </div>
      )}
    </Card>
  );
}

function MacroChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface-2 border border-border rounded-lg py-1.5">
      <div className="font-semibold text-sm">{value}</div>
      <div className="text-[10px] text-muted">{label}</div>
    </div>
  );
}

function RecipeForm({
  onSubmit,
}: {
  onSubmit: (r: Omit<Recipe, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<RecipeCategory>("dejeuner");
  const [kcal, setKcal] = useState(400);
  const [protein, setProtein] = useState(30);
  const [carbs, setCarbs] = useState(40);
  const [fat, setFat] = useState(12);
  const [prepMinutes, setPrepMinutes] = useState(20);
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      category,
      kcal,
      protein,
      carbs,
      fat,
      prepMinutes,
      ingredients: ingredients
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      steps: steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      favorite: false,
      custom: true,
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="text-sm block">
          <span className="block text-muted mb-1">Nom de la recette</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
          />
        </label>

        <label className="text-sm block">
          <span className="block text-muted mb-1">Catégorie</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as RecipeCategory)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
          >
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <MiniNumber label="Kcal" value={kcal} onChange={setKcal} />
          <MiniNumber label="Prépa (min)" value={prepMinutes} onChange={setPrepMinutes} />
          <MiniNumber label="Protéines (g)" value={protein} onChange={setProtein} />
          <MiniNumber label="Glucides (g)" value={carbs} onChange={setCarbs} />
          <MiniNumber label="Lipides (g)" value={fat} onChange={setFat} />
        </div>

        <label className="text-sm block">
          <span className="block text-muted mb-1">
            Ingrédients (un par ligne)
          </span>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={3}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
          />
        </label>

        <label className="text-sm block">
          <span className="block text-muted mb-1">
            Étapes de préparation (une par ligne)
          </span>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            rows={3}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
          />
        </label>

        <button
          type="submit"
          className="w-full h-11 rounded-full bg-accent-2 text-white font-semibold"
        >
          Ajouter la recette
        </button>
      </form>
    </Card>
  );
}

function MiniNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="text-sm block">
      <span className="block text-muted mb-1">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2"
      />
    </label>
  );
}
