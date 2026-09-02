"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { RankingItem } from "@/lib/types";

interface HorizontalBarRankingsProps {
  data: RankingItem[];
  color?: string;
  onClickItem?: (id: number) => void;
}

export default function HorizontalBarRankings({
  data,
  color = "#2563eb",
  onClickItem,
}: HorizontalBarRankingsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-xs text-slate-400">
        Loading rankings visualization...
      </div>
    );
  }

  // Reverse so highest score is at the top of horizontal layout
  const chartData = [...data].reverse().map((item) => ({
    id: item.id,
    name: item.ticker || item.name,
    fullName: item.name,
    score: item.leadership_score,
    potential: item.future_potential,
    probability: Math.round(item.probability * 100),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#475569"
            fontSize={11}
            fontWeight={600}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-xl text-xs space-y-1">
                    <p className="font-bold text-slate-900">{d.fullName}</p>
                    <p className="text-blue-600 font-semibold">
                      Leadership Score: <span className="font-mono">{d.score.toFixed(1)}</span>
                    </p>
                    <p className="text-violet-600 font-semibold">
                      Future Potential: <span className="font-mono">{d.potential.toFixed(1)}</span>
                    </p>
                    <p className="text-emerald-600 font-semibold">
                      Leadership Probability: <span className="font-mono">{d.probability}%</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="score"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(entry) => onClickItem && onClickItem(entry.id)}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === chartData.length - 1 ? "#059669" : color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
