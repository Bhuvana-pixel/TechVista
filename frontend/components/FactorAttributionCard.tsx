import React from "react";
import { TrendingUp, TrendingDown, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { FactorAttribution, FactorItem } from "@/lib/types";

interface FactorAttributionCardProps {
  attribution?: FactorAttribution;
  positiveFactors?: FactorItem[];
  negativeFactors?: FactorItem[];
  explanation?: string;
  confidence?: number;
  entityName?: string;
}

export default function FactorAttributionCard({
  attribution,
  positiveFactors,
  negativeFactors,
  explanation,
  confidence,
  entityName,
}: FactorAttributionCardProps) {
  const posFactors = attribution?.positive_factors ?? positiveFactors ?? [];
  const negFactors = attribution?.negative_factors ?? negativeFactors ?? [];
  const textExplanation =
    attribution?.text_explanation ??
    explanation ??
    "Leading market positioning with robust technical research velocity.";

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Explainable AI: Why this score?
            </h3>
            <p className="text-xs text-slate-500">
              Factor attribution calibrated against cohort peer medians
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
          SHAP Aligned
        </span>
      </div>

      {/* Dynamic Factual Explanation */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 leading-relaxed font-medium">
        <p>{textExplanation}</p>
      </div>

      {/* Positive & Negative Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Positive Drivers */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>Key Competitive Catalysts</span>
          </div>

          {posFactors && posFactors.length > 0 ? (
            <div className="space-y-2">
              {posFactors.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white/90 p-2.5 rounded-lg border border-emerald-100 text-xs shadow-xs"
                >
                  <span className="text-slate-800 font-semibold">{f.feature || f.label}</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    +{Math.abs(f.impact).toFixed(1)} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No dominant positive outliers.</p>
          )}
        </div>

        {/* Negative Drags */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
            <TrendingDown className="h-4 w-4" />
            <span>Structural Headwinds / Drags</span>
          </div>

          {negFactors && negFactors.length > 0 ? (
            <div className="space-y-2">
              {negFactors.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white/90 p-2.5 rounded-lg border border-rose-100 text-xs shadow-xs"
                >
                  <span className="text-slate-800 font-semibold">{f.feature || f.label}</span>
                  <span className="font-mono text-rose-700 font-bold">
                    -{Math.abs(f.impact).toFixed(1)} pts
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No significant drag factors identified.</p>
          )}
        </div>
      </div>
    </div>
  );
}
