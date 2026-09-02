"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Cpu,
  ArrowLeft,
  ExternalLink,
  Trophy,
  TrendingUp,
  BrainCircuit,
  Info,
  Layers,
  Sparkles
} from "lucide-react";
import ApiService from "@/lib/api";
import { TechnologyDetail, ForecastResponse } from "@/lib/types";
import ScoreGauge from "@/components/ScoreGauge";
import FactorAttributionCard from "@/components/FactorAttributionCard";
import ForecastScenarioChart from "@/components/Charts/ForecastScenarioChart";
import TrendLineChart from "@/components/Charts/TrendLineChart";

export default function TechnologyDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [technology, setTechnology] = useState<TechnologyDetail | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const [techData, fcData] = await Promise.all([
          ApiService.getTechnologyDetail(id),
          ApiService.getTechnologyForecast(id),
        ]);
        setTechnology(techData);
        setForecast(fcData);
      } catch (err: any) {
        setError(err.message || "Failed to load technology intelligence");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="h-9 w-9 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Evaluating technology innovation parameters...</p>
      </div>
    );
  }

  if (error || !technology) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center max-w-lg mx-auto mt-12 border border-slate-200 shadow-sm">
        <p className="text-rose-600 text-sm mb-4">{error || "Technology not found"}</p>
        <a href="/technologies" className="text-xs text-violet-600 font-semibold hover:underline">
          ← Back to Technologies
        </a>
      </div>
    );
  }

  const breakdownEntries = technology.latest_score_breakdown
    ? [
        { label: "Global Capital Investment", weight: "20%", score: technology.latest_score_breakdown.investment || 0, color: "bg-blue-600" },
        { label: "Innovation & Patents", weight: "20%", score: technology.latest_score_breakdown.innovation || 0, color: "bg-violet-600" },
        { label: "Enterprise Adoption Rate", weight: "20%", score: technology.latest_score_breakdown.adoption || 0, color: "bg-emerald-600" },
        { label: "Market TAM Growth (CAGR)", weight: "20%", score: technology.latest_score_breakdown.market_growth || 0, color: "bg-cyan-600" },
        { label: "Industry & Ecosystem Interest", weight: "20%", score: technology.latest_score_breakdown.industry_interest || 0, color: "bg-amber-600" },
      ]
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <div>
        <a
          href="/technologies"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Technology Directory
        </a>
      </div>

      {/* Header Profile Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">
                {technology.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {technology.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {technology.description}
            </p>
          </div>

          {/* Top Score Badge */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 shadow-xs">
            <ScoreGauge
              score={technology.leadership_score || 0}
              label="Diffusion Index"
              size="md"
            />
            <div className="text-left border-l border-slate-200 pl-4 space-y-1.5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">GLOBAL RANK</span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  #{technology.rank}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">FUTURE POTENTIAL</span>
                <span className="text-sm font-bold text-violet-600 font-mono">
                  {technology.future_potential?.toFixed(1)} pts
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">LEADERSHIP PROB</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">
                  {Math.round((technology.probability || 0.75) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Why this score?" Explainable AI Section */}
      <FactorAttributionCard
        positiveFactors={technology.positive_factors}
        negativeFactors={technology.negative_factors}
        explanation={technology.explanation}
        confidence={forecast?.confidence || 0.82}
        entityName={technology.name}
      />

      {/* Factor Breakdown Weights */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Layers className="h-4 w-4 text-violet-600" />
          Balanced 5-Factor Scoring Composition
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Evaluates: Investment (20%) + Innovation/Patents (20%) + Enterprise Adoption (20%) + Market TAM Growth (20%) + Ecosystem Interest (20%)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {breakdownEntries.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-800 font-semibold">{item.label}</span>
                <span className="text-slate-500 font-mono text-[10px]">{item.weight}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                  />
                </div>
                <span className="font-mono text-xs font-bold text-slate-900 w-9 text-right">
                  {item.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Year Forecast Horizon Curve */}
      {forecast && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-200 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                10–15 Year Technology Horizon Forecast (2025–2040)
              </h3>
              <p className="text-xs text-slate-500">
                Gradient boosting regression with time-horizon uncertainty bands (±σ) and confidence decay
              </p>
            </div>
            <div className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
              Model Confidence: <strong>{Math.round(forecast.confidence * 100)}%</strong>
            </div>
          </div>

          <ForecastScenarioChart
            currentScore={forecast.current_score}
            forecasts={forecast.forecasts}
            entityName={technology.name}
          />

          <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p>{forecast.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Historical Adoption & Investment Performance (2015-2025) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Historical Diffusion Progression (2015–2025)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Time-series progression of venture investment ($B) vs enterprise adoption penetration (%)
        </p>

        <TrendLineChart
          data={technology.metrics}
          xKey="year"
          series={[
            { key: "investment", name: "Global Investment ($B)", color: "#2563eb" },
            { key: "market_size", name: "Market TAM Size ($B)", color: "#7c3aed" },
            { key: "adoption_rate", name: "Adoption Rate (%)", color: "#059669" }
          ]}
        />

        {/* Detailed Metrics Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Year</th>
                <th className="px-3 py-2.5 text-right">Investment</th>
                <th className="px-3 py-2.5 text-right">Market TAM</th>
                <th className="px-3 py-2.5 text-right">Adoption Rate</th>
                <th className="px-3 py-2.5 text-right">Patents</th>
                <th className="px-3 py-2.5 text-right">Academic Papers</th>
                <th className="px-3 py-2.5 text-right">Startups</th>
                <th className="px-3 py-2.5 text-right">Job Postings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {technology.metrics.map((m) => (
                <tr key={m.year} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-mono font-bold text-slate-900">{m.year}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-800">${m.investment.toFixed(1)}B</td>
                  <td className="px-3 py-2 text-right font-mono text-blue-600 font-bold">${m.market_size.toFixed(1)}B</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-600 font-bold">{m.adoption_rate.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-800">{(m.patent_count || 0).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-800">{m.research_papers.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-800">{m.startup_count.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono text-amber-600 font-bold">{m.job_postings}k</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
