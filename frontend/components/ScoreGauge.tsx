import React from "react";

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  showTier?: boolean;
}

export default function ScoreGauge({
  score,
  label = "Leadership Score",
  size = "md",
  showTier = true,
}: ScoreGaugeProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

  let color = "#2563eb"; // blue
  let tierLabel = "Moderate Contender";
  let badgeBg = "bg-blue-50 border-blue-200 text-blue-700";

  if (safeScore >= 80) {
    color = "#059669"; // emerald
    tierLabel = "Dominant Industry Leader";
    badgeBg = "bg-emerald-50 border-emerald-200 text-emerald-700";
  } else if (safeScore >= 68) {
    color = "#0284c7"; // sky
    tierLabel = "Frontier Challenger";
    badgeBg = "bg-sky-50 border-sky-200 text-sky-700";
  } else if (safeScore >= 50) {
    color = "#7c3aed"; // violet
    tierLabel = "Established Competitor";
    badgeBg = "bg-violet-50 border-violet-200 text-violet-700";
  } else {
    color = "#d97706"; // amber
    tierLabel = "Emerging / Transitional";
    badgeBg = "bg-amber-50 border-amber-200 text-amber-700";
  }

  const strokeWidth = size === "lg" ? 10 : size === "md" ? 8 : 6;
  const radius = size === "lg" ? 54 : size === "md" ? 42 : 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;
  const viewBoxSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={viewBoxSize}
          height={viewBoxSize}
          className="-rotate-90 transform transition-all duration-700"
        >
          {/* Background circle */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground progress circle */}
          <circle
            cx={viewBoxSize / 2}
            cy={viewBoxSize / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span
            className={`font-black tracking-tight text-slate-900 ${
              size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-lg"
            }`}
          >
            {safeScore.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">/ 100</span>
        </div>
      </div>

      {label && <p className="mt-2 text-xs font-semibold text-slate-700">{label}</p>}

      {showTier && (
        <span
          className={`mt-1.5 inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${badgeBg}`}
        >
          {tierLabel}
        </span>
      )}
    </div>
  );
}
