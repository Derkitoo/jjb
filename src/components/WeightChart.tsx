"use client";

import { WeighIn } from "@/lib/types";

const COLOR_LINE = "#e11d2e";
const COLOR_TARGET = "#17b88a";
const COLOR_MUTED = "#9aa0ac";
const COLOR_GRID = "#262b38";

export function WeightChart({
  data,
  targetWeightKg,
}: {
  data: WeighIn[];
  targetWeightKg?: number | null;
}) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-muted">
        Ajoute au moins 2 pesées pour voir ta courbe de progression.
      </p>
    );
  }

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map((w) => w.weightKg);
  const allValues =
    targetWeightKg != null ? [...weights, targetWeightKg] : weights;
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const pad = Math.max((rawMax - rawMin) * 0.15, 0.5);
  const min = rawMin - pad;
  const max = rawMax + pad;
  const range = max - min || 1;

  const width = 600;
  const height = 180;
  const padding = 28;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const x = (i: number) =>
    sorted.length > 1 ? padding + (i / (sorted.length - 1)) * innerW : padding;
  const y = (v: number) => padding + innerH - ((v - min) / range) * innerH;

  const points = sorted.map((w, i) => `${x(i)},${y(w.weightKg)}`).join(" ");
  const first = sorted[0].weightKg;
  const last = sorted[sorted.length - 1].weightKg;
  const delta = last - first;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40"
        preserveAspectRatio="none"
      >
        <line
          x1={padding}
          x2={width - padding}
          y1={height - padding}
          y2={height - padding}
          stroke={COLOR_GRID}
          strokeWidth={1}
        />
        {targetWeightKg != null && (
          <>
            <line
              x1={padding}
              x2={width - padding}
              y1={y(targetWeightKg)}
              y2={y(targetWeightKg)}
              stroke={COLOR_TARGET}
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
            <text
              x={width - padding}
              y={y(targetWeightKg) - 6}
              fontSize={10}
              textAnchor="end"
              fill={COLOR_TARGET}
            >
              Objectif {targetWeightKg} kg
            </text>
          </>
        )}
        <polyline
          points={points}
          fill="none"
          stroke={COLOR_LINE}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {sorted.map((w, i) => (
          <circle key={w.id} cx={x(i)} cy={y(w.weightKg)} r={3.5} fill={COLOR_LINE} />
        ))}
        <text x={padding} y={16} fontSize={10} fill={COLOR_MUTED}>
          {max.toFixed(1)} kg
        </text>
        <text x={padding} y={height - padding + 16} fontSize={10} fill={COLOR_MUTED}>
          {min.toFixed(1)} kg
        </text>
      </svg>
      <p className="text-xs text-muted mt-1">
        {delta === 0
          ? "Poids stable"
          : delta > 0
          ? `+${delta.toFixed(1)} kg depuis la première pesée`
          : `${delta.toFixed(1)} kg depuis la première pesée`}
      </p>
    </div>
  );
}
