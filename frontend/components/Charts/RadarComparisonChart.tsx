"use client";

import React, { useEffect, useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface EntityKey {
  key: string;
  name: string;
  color: string;
}

interface RadarComparisonChartProps {
  data: any[];
  entityKeys: EntityKey[];
  angleKey?: string;
  height?: number;
}

export default function RadarComparisonChart({
  data,
  entityKeys,
  angleKey = "indicator",
  height = 360,
}: RadarComparisonChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center text-xs text-slate-400"
      >
        Loading comparative radar...
      </div>
    );
  }

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey={angleKey}
            tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="#cbd5e1"
            tick={{ fill: "#94a3b8", fontSize: 10 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-xl text-xs space-y-1">
                    <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                      {label}
                    </p>
                    {payload.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}:
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "11px", paddingTop: "10px", color: "#64748b" }}
          />
          {entityKeys.map((entity) => (
            <Radar
              key={entity.key}
              name={entity.name}
              dataKey={entity.key}
              stroke={entity.color}
              fill={entity.color}
              fillOpacity={0.25}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
