"use client";

import { useState } from "react";
import { Recipe } from "@/lib/types";

interface ShoppingListModalProps {
  recipes: Recipe[];
  onClose: () => void;
}

export function ShoppingListModal({ recipes, onClose }: ShoppingListModalProps) {
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>(
    recipes.slice(0, 3).map((r) => r.id)
  );
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  function toggleRecipe(id: string) {
    setSelectedRecipeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  const selectedRecipes = recipes.filter((r) => selectedRecipeIds.includes(r.id));
  const allIngredients = Array.from(
    new Set(selectedRecipes.flatMap((r) => r.ingredients))
  );

  function toggleIngredient(item: string) {
    setCheckedIngredients((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              🛒 Liste de Courses & Meal Prep
            </h3>
            <p className="text-xs text-muted">
              Sélectionne tes recettes de la semaine pour générer la liste d&apos;ingrédients
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 hover:bg-border flex items-center justify-center text-muted text-sm font-semibold transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Recipe Selector */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
              1. Choisis tes recettes ({selectedRecipeIds.length} sélectionnée{selectedRecipeIds.length > 1 ? "s" : ""})
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {recipes.map((r) => {
                const isSelected = selectedRecipeIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleRecipe(r.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 flex items-center gap-2 ${
                      isSelected
                        ? "bg-accent-2/20 border-accent-2 text-accent-2"
                        : "bg-surface-2 border-border text-muted hover:text-foreground"
                    }`}
                  >
                    <span>{isSelected ? "✓" : "+"}</span>
                    <span>{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Consolidated Ingredients Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
                2. Ingrédients à acheter ({allIngredients.length} articles)
              </h4>
              {allIngredients.length > 0 && (
                <button
                  onClick={() => setCheckedIngredients({})}
                  className="text-[11px] text-muted hover:text-accent"
                >
                  Tout décocher
                </button>
              )}
            </div>

            {allIngredients.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted bg-surface-2 rounded-xl border border-border">
                Sélectionne au moins une recette ci-dessus pour générer ta liste de courses.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {allIngredients.map((item) => {
                  const isChecked = Boolean(checkedIngredients[item]);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleIngredient(item)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                        isChecked
                          ? "bg-surface-2/40 border-border text-muted line-through opacity-60"
                          : "bg-surface-2 border-border text-foreground hover:border-accent-2/50"
                      }`}
                    >
                      <span>{item}</span>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                        isChecked ? "bg-accent-2 border-accent-2 text-white" : "border-border bg-surface"
                      }`}>
                        {isChecked ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-border flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-white font-semibold text-xs rounded-full shadow-md hover:bg-accent/90 transition-all active:scale-95"
          >
            Fermer & Garder ma liste
          </button>
        </div>
      </div>
    </div>
  );
}
