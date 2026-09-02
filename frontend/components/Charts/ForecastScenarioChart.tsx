"use client";

import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { HorizonPrediction } from "@/lib/types";

interface ForecastScenarioChartProps {
  currentScore: number;
  forecasts: HorizonPrediction[];
  entityName: string;
}

export default function ForecastScenarioChart({
  currentScore,
  forecasts,
  entityName,
}: ForecastScenarioChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-72 w-full flex items-center justify-center text-xs text-slate-400">
        Loading scenario projection...
      </div>
    );
  }

  // Combine 2025 baseline with 2027, 2030, 2035, 2040 horizons
  const chartData = [
    {
      year: "2025 (Baseline)",
      score: currentScore,
      lower: currentScore,
      upper: currentScore,
      range: [currentScore, currentScore],
      confidence: 1.0,
      probability: 1.0,
    },
    ...forecasts.map((f) => ({
      year: String(f.year),
      score: f.leadership_score,
      lower: f.lower_bound,
      upper: f.upper_bound,
      range: [f.lower_bound, f.upper_bound],
      confidence: f.confidence,
      probability: f.probability,
    })),
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis
            domain={[40, 100]}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-xl text-xs space-y-1">
                    <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                      {entityName} — Horizon {label}
                    </p>
                    <p className="text-emerald-600 font-semibold">
                      Forecast Score: <span className="font-mono font-bold">{d.score.toFixed(1)}</span>
                    </p>
                    <p className="text-blue-600 font-semibold">
                      Uncertainty Band (±σ):{" "}
                      <span className="font-mono">
                        [{d.lower.toFixed(1)} – {d.upper.toFixed(1)}]
                      </span>
                    </p>
                    <p className="text-violet-600 font-semibold">
                      Leadership Probability:{" "}
                      <span className="font-mono">{Math.round(d.probability * 100)}%</span>
                    </p>
                    <p className="text-amber-600 font-semibold">
                      Model Confidence:{" "}
                      <span className="font-mono">{Math.round(d.confidence * 100)}%</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={80} stroke="#059669" strokeDasharray="4 4" label={{ value: "Dominant Threshold", fill: "#059669", fontSize: 10, position: "insideTopRight" }} />

          {/* Uncertainty corridor area */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="transparent"
            fill="#3b82f6"
            fillOpacity={0.12}
            name="Upper Bound (+σ)"
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="transparent"
            fill="#ffffff"
            fillOpacity={1}
            name="Lower Bound (-σ)"
          />

          {/* Trajectory line */}
          <Line
            type="monotone"
            dataKey="score"
            name="Projected Leadership Score"
            stroke="#059669"
            strokeWidth={3}
            dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#ffffff" }}
            activeDot={{ r: 6, stroke: "#059669", strokeWidth: 2, fill: "#ffffff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
