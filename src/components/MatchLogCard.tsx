"use client";

import { useState } from "react";
import { useData } from "@/lib/data-context";
import { Card } from "@/components/Card";
import { MATCH_METHOD_LABELS, MatchMethod, MatchResult } from "@/lib/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function MatchLogCard() {
  const { matchLogs, addMatchLog, deleteMatchLog } = useData();

  const [showForm, setShowForm] = useState(false);
  const [compName, setCompName] = useState("");
  const [date, setDate] = useState(todayISO());
  const [opponent, setOpponent] = useState("");
  const [result, setResult] = useState<MatchResult>("win");
  const [method, setMethod] = useState<MatchMethod>("submission");
  const [technique, setTechnique] = useState("");
  const [notes, setNotes] = useState("");

  const totalMatches = matchLogs.length;
  const wins = matchLogs.filter((m) => m.result === "win").length;
  const subWins = matchLogs.filter((m) => m.result === "win" && m.method === "submission").length;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(0) : "0";
  const subRate = wins > 0 ? ((subWins / wins) * 100).toFixed(0) : "0";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!compName.trim() || !opponent.trim()) return;

    addMatchLog({
      competitionName: compName.trim(),
      date,
      opponentName: opponent.trim(),
      result,
      method,
      techniqueName: technique.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setCompName("");
    setOpponent("");
    setTechnique("");
    setNotes("");
    setShowForm(false);
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            🏆 Carnet de Matchs Compétition
          </h3>
          <p className="text-xs text-muted">
            {totalMatches} match{totalMatches > 1 ? "s" : ""} enregistré{totalMatches > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3.5 py-1.5 rounded-full bg-accent text-white font-semibold text-xs transition-all shadow-md hover:bg-accent/90 active:scale-95"
        >
          {showForm ? "Fermer" : "+ Nouveau match"}
        </button>
      </div>

      {/* Match Stats Summary */}
      {totalMatches > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-surface-2 p-2.5 rounded-xl border border-border">
            <span className="block text-[10px] text-muted mb-0.5">Taux de Victoires</span>
            <span className="font-extrabold text-sm text-emerald-400">{winRate}% ({wins}V / {totalMatches - wins}D)</span>
          </div>
          <div className="bg-surface-2 p-2.5 rounded-xl border border-border">
            <span className="block text-[10px] text-muted mb-0.5">Finalisations</span>
            <span className="font-extrabold text-sm text-amber-400">{subWins} soumissions</span>
          </div>
          <div className="bg-surface-2 p-2.5 rounded-xl border border-border">
            <span className="block text-[10px] text-muted mb-0.5">Taux de Finish</span>
            <span className="font-extrabold text-sm text-accent">{subRate}% des victoires</span>
          </div>
        </div>
      )}

      {/* Add Match Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-surface-2 border border-border rounded-xl space-y-3 animate-fadeIn text-xs">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-muted mb-1 font-semibold">Compétition *</span>
              <input
                type="text"
                required
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="Ex : Championnat de France"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="block text-muted mb-1 font-semibold">Date *</span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-muted mb-1 font-semibold">Nom de l&apos;adversaire *</span>
              <input
                type="text"
                required
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="Ex : Alex Silva"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              />
            </label>

            <label className="block">
              <span className="block text-muted mb-1 font-semibold">Résultat *</span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setResult("win")}
                  className={`py-1.5 rounded-lg font-bold transition-all border ${
                    result === "win"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow"
                      : "bg-surface border-border text-muted"
                  }`}
                >
                  🟢 Victoire
                </button>
                <button
                  type="button"
                  onClick={() => setResult("loss")}
                  className={`py-1.5 rounded-lg font-bold transition-all border ${
                    result === "loss"
                      ? "bg-rose-600 text-white border-rose-600 shadow"
                      : "bg-surface border-border text-muted"
                  }`}
                >
                  🔴 Défaite
                </button>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-muted mb-1 font-semibold">Méthode *</span>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as MatchMethod)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 font-medium"
              >
                {Object.entries(MATCH_METHOD_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="block text-muted mb-1 font-semibold">Technique / Soumission</span>
              <input
                type="text"
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
                placeholder="Ex : Triangle, Clé de bras..."
                className="w-full bg-surface border border-border rounded-lg px-3 py-2"
              />
            </label>
          </div>

          <label className="block">
            <span className="block text-muted mb-1 font-semibold">Notes d&apos;analyse</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex : Bonne amenée au sol, revoir la défense de garde papillon..."
              className="w-full bg-surface border border-border rounded-lg px-3 py-2"
            />
          </label>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-accent text-white font-bold transition-all shadow hover:bg-accent/90"
          >
            Enregistrer le match
          </button>
        </form>
      )}

      {/* Match Logs History List */}
      <div className="space-y-2">
        {matchLogs.length === 0 ? (
          <p className="text-xs text-muted text-center py-4 bg-surface-2/50 rounded-xl border border-border/50">
            Aucun match enregistré pour l&apos;instant. Cliquez sur &quot;+ Nouveau match&quot; pour consigner vos résultats de compétition.
          </p>
        ) : (
          matchLogs.map((m) => {
            const isWin = m.result === "win";
            return (
              <div
                key={m.id}
                className="p-3 bg-surface-2 rounded-xl border border-border flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        isWin ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {isWin ? "VICTOIRE" : "DÉFAITE"}
                    </span>
                    <span className="font-bold text-foreground truncate">{m.opponentName}</span>
                    <span className="text-muted text-[11px]">({m.competitionName})</span>
                  </div>

                  <div className="text-muted text-[11px] flex items-center gap-2">
                    <span>📅 {m.date}</span>
                    <span>•</span>
                    <span>{MATCH_METHOD_LABELS[m.method as MatchMethod]}</span>
                    {m.techniqueName && (
                      <>
                        <span>•</span>
                        <span className="text-accent font-semibold">⚡ {m.techniqueName}</span>
                      </>
                    )}
                  </div>

                  {m.notes && <p className="text-[11px] text-muted/90 italic pt-0.5">{m.notes}</p>}
                </div>

                <button
                  onClick={() => deleteMatchLog(m.id)}
                  className="text-muted hover:text-rose-400 p-1 font-bold text-xs"
                  title="Supprimer ce match"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
