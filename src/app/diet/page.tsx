"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/data-context";
import { useAdmin } from "@/lib/admin-context";
import { Card, SectionTitle } from "@/components/Card";
import {
  Recipe,
  RECIPE_CATEGORY_LABELS,
  RecipeCategory,
} from "@/lib/types";
import MacrosTab from "@/components/MacrosTab";

import { ShoppingListModal } from "@/components/ShoppingListModal";

const CATEGORY_OPTIONS = Object.entries(RECIPE_CATEGORY_LABELS) as [
  RecipeCategory,
  string
][];

const CATEGORY_EMOJI: Record<RecipeCategory, string> = {
  "petit-dejeuner": "🍳",
  dejeuner: "🥗",
  diner: "🍽️",
  collation: "🍎",
  "post-training": "🥤",
};

const CATEGORY_TINT: Record<RecipeCategory, string> = {
  "petit-dejeuner": "bg-amber-500/15",
  dejeuner: "bg-emerald-500/15",
  diner: "bg-indigo-500/15",
  collation: "bg-pink-500/15",
  "post-training": "bg-sky-500/15",
};

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
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [view, setView] = useState<"liste" | "grille">("grille");

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
      {showShoppingList && (
        <ShoppingListModal
          recipes={recipes}
          onClose={() => setShowShoppingList(false)}
        />
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {recipes.length} recette{recipes.length > 1 ? "s" : ""} healthy
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShoppingList(true)}
            className="shrink-0 h-10 px-3.5 rounded-full bg-accent-2/20 hover:bg-accent-2 border border-accent-2/40 text-accent-2 hover:text-white font-semibold text-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            🛒 Liste de Courses
          </button>
          <div className="flex bg-surface-2 border border-border rounded-full p-0.5">
            <button
              onClick={() => setView("grille")}
              aria-label="Vue grille"
              className={`h-8 w-8 rounded-full text-sm transition-colors ${
                view === "grille" ? "bg-accent-2 text-white" : "text-muted"
              }`}
            >
              ▦
            </button>
            <button
              onClick={() => setView("liste")}
              aria-label="Vue liste"
              className={`h-8 w-8 rounded-full text-sm transition-colors ${
                view === "liste" ? "bg-accent-2 text-white" : "text-muted"
              }`}
            >
              ☰
            </button>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="shrink-0 h-10 px-4 rounded-full bg-accent-2 text-white font-semibold text-sm"
          >
            {showForm ? "Fermer" : "+ Recette"}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une recette…"
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
      />

      <select
        value={filter}
        onChange={(e) =>
          setFilter(e.target.value as RecipeCategory | "all" | "favorites")
        }
        className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
      >
        <option value="all">Toutes les recettes</option>
        <option value="favorites">⭐ Favoris</option>
        {CATEGORY_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {showForm && (
        <RecipeForm
          onSubmit={(r) => {
            addRecipe(r);
            setShowForm(false);
          }}
        />
      )}

      {filtered.length === 0 ? (
        <Card className="text-sm text-muted">Aucune recette ici.</Card>
      ) : view === "grille" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <RecipeGridCard
              key={r.id}
              recipe={r}
              onToggleFavorite={() => toggleFavorite(r.id)}
              onDelete={() => deleteRecipe(r.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <RecipeRow
              key={r.id}
              recipe={r}
              onToggleFavorite={() => toggleFavorite(r.id)}
              onDelete={() => deleteRecipe(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeDetail({
  recipe,
  onDelete,
}: {
  recipe: Recipe;
  onDelete: () => void;
}) {
  const { isAdmin } = useAdmin();
  return (
    <div className="text-sm space-y-3">
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
      {isAdmin && (
        <button onClick={onDelete} className="text-xs text-accent font-medium">
          Supprimer cette recette
        </button>
      )}
    </div>
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
        <div className="mt-3 pt-3 border-t border-border">
          <RecipeDetail recipe={recipe} onDelete={onDelete} />
        </div>
      )}
    </Card>
  );
}

function RecipeGridCard({
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
    <Card
      className={`p-0 overflow-hidden relative ${
        open ? "col-span-2 sm:col-span-3" : ""
      }`}
    >
      <button
        onClick={onToggleFavorite}
        aria-label="Favori"
        className="absolute top-2 right-2 z-10 text-lg drop-shadow"
      >
        {recipe.favorite ? "⭐" : "☆"}
      </button>
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left">
        <div
          className={`h-20 flex items-center justify-center text-4xl ${CATEGORY_TINT[recipe.category]}`}
        >
          {CATEGORY_EMOJI[recipe.category]}
        </div>
        <div className="p-3">
          <div className="text-sm font-medium leading-snug line-clamp-2">
            {recipe.name}
          </div>
          <div className="text-xs text-muted mt-1">
            {recipe.kcal} kcal · {recipe.prepMinutes} min
          </div>
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-border">
          <RecipeDetail recipe={recipe} onDelete={onDelete} />
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
