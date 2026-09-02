"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface LineSeries {
  key: string;
  name: string;
  color: string;
  strokeDasharray?: string;
}

interface TrendLineChartProps {
  data: any[];
  xKey: string;
  series: LineSeries[];
  yUnit?: string;
  height?: number;
}

export default function TrendLineChart({
  data,
  xKey,
  series,
  yUnit = "",
  height = 280,
}: TrendLineChartProps) {
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
        Loading trend trajectory...
      </div>
    );
  }

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `${val}${yUnit}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-xl text-xs space-y-1.5">
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
                          {yUnit}
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
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px", color: "#64748b" }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
              strokeDasharray={s.strokeDasharray}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
