"use client";

import { useMemo } from "react";
import { useData } from "@/lib/data-context";
import { Card } from "@/components/Card";

export function ActivityHeatmap() {
  const { sessions } = useData();

  // Generate 52 weeks (364 days) up to today
  const { weeks, totalSessionsInYear } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionMap = new Map<string, number>();
    sessions.forEach((s) => {
      const count = sessionMap.get(s.date) || 0;
      sessionMap.set(s.date, count + 1);
    });

    const days: { dateStr: string; count: number; dayOfWeek: number }[] = [];
    let countInYear = 0;

    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = sessionMap.get(dateStr) || 0;
      if (count > 0) countInYear += count;

      days.push({
        dateStr,
        count,
        dayOfWeek: d.getDay(),
      });
    }

    // Group into 52 weeks (7 days per week column)
    const weeksArray: (typeof days)[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArray.push(days.slice(i, i + 7));
    }

    return { weeks: weeksArray, totalSessionsInYear: countInYear };
  }, [sessions]);

  function getCellColor(count: number) {
    if (count === 0) return "bg-surface-2 border-border/30";
    if (count === 1) return "bg-emerald-600/60 border-emerald-500/50";
    if (count === 2) return "bg-emerald-500 border-emerald-400";
    return "bg-amber-400 border-amber-300 shadow-sm shadow-amber-500/50";
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          📅 Matrice de Régularité Annuelle
        </h3>
        <span className="text-xs text-muted font-medium">
          <strong className="text-accent-2">{totalSessionsInYear}</strong> séances sur 1 an
        </span>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-1.5 min-w-[650px] p-1">
          {weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1.5 flex-1">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr} : ${day.count} séance${day.count > 1 ? "s" : ""}`}
                  className={`w-3 h-3 rounded-sm border transition-all hover:scale-125 ${getCellColor(
                    day.count
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-[11px] text-muted pt-1">
        <span>Moins</span>
        <div className="w-3 h-3 rounded-sm bg-surface-2 border border-border/30" />
        <div className="w-3 h-3 rounded-sm bg-emerald-600/60 border border-emerald-500/50" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400" />
        <div className="w-3 h-3 rounded-sm bg-amber-400 border border-amber-300" />
        <span>Plus</span>
      </div>
    </Card>
  );
}
