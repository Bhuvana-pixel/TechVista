"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  ArrowLeft,
  ExternalLink,
  Trophy,
  TrendingUp,
  DollarSign,
  Cpu,
  BrainCircuit,
  Info,
  Layers,
  Award
} from "lucide-react";
import ApiService from "@/lib/api";
import { CompanyDetail, ForecastResponse } from "@/lib/types";
import ScoreGauge from "@/components/ScoreGauge";
import FactorAttributionCard from "@/components/FactorAttributionCard";
import ForecastScenarioChart from "@/components/Charts/ForecastScenarioChart";
import TrendLineChart from "@/components/Charts/TrendLineChart";

export default function CompanyDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const [compData, fcData] = await Promise.all([
          ApiService.getCompanyDetail(id),
          ApiService.getCompanyForecast(id),
        ]);
        setCompany(compData);
        setForecast(fcData);
      } catch (err: any) {
        setError(err.message || "Failed to load company intelligence");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="h-9 w-9 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Synthesizing company leadership indicators...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center max-w-lg mx-auto mt-12 border border-slate-200 shadow-sm">
        <p className="text-rose-600 text-sm mb-4">{error || "Company not found"}</p>
        <a href="/companies" className="text-xs text-blue-600 font-semibold hover:underline">
          ← Back to Companies
        </a>
      </div>
    );
  }

  // Breakdown formatting
  const breakdownEntries = company.latest_score_breakdown
    ? [
        { label: "Financial Strength", weight: "20%", score: company.latest_score_breakdown.financial_strength || 0, color: "bg-blue-600" },
        { label: "Market Position", weight: "15%", score: company.latest_score_breakdown.market_position || 0, color: "bg-indigo-600" },
        { label: "Capital Investment", weight: "15%", score: company.latest_score_breakdown.investment || 0, color: "bg-cyan-600" },
        { label: "R&D Deployment", weight: "15%", score: company.latest_score_breakdown.rd || 0, color: "bg-emerald-600" },
        { label: "Innovation Velocity", weight: "15%", score: company.latest_score_breakdown.innovation || 0, color: "bg-violet-600" },
        { label: "Workforce Expansion", weight: "10%", score: company.latest_score_breakdown.workforce_growth || 0, color: "bg-pink-600" },
        { label: "Market Sentiment", weight: "10%", score: company.latest_score_breakdown.sentiment || 0, color: "bg-amber-600" },
      ]
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Back Link */}
      <div>
        <a
          href="/companies"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Company Directory
        </a>
      </div>

      {/* Header Profile Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700">
                {company.ticker}
              </span>
              <span className="text-xs text-slate-500 font-medium">{company.country}</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">{company.industry}</span>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline ml-2 font-semibold"
                >
                  Official Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {company.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {company.description}
            </p>
          </div>

          {/* Top Rank Badge */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 shadow-xs">
            <ScoreGauge
              score={company.leadership_score || 0}
              label="Leadership Score"
              size="md"
            />
            <div className="text-left border-l border-slate-200 pl-4 space-y-1.5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">GLOBAL RANK</span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  #{company.rank}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">FUTURE POTENTIAL</span>
                <span className="text-sm font-bold text-blue-600 font-mono">
                  {company.future_potential?.toFixed(1)} pts
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">LEADERSHIP PROB</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">
                  {Math.round((company.probability || 0.75) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "Why this score?" Explainable AI Section */}
      <FactorAttributionCard
        positiveFactors={company.positive_factors}
        negativeFactors={company.negative_factors}
        explanation={company.explanation}
        confidence={forecast?.confidence || 0.82}
        entityName={company.name}
      />

      {/* Factor Breakdown Weights */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600" />
          Weighted Scoring Engine Composition
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Transparent model calculation: Financial (20%) + Market (15%) + Investment (15%) + R&D (15%) + Innovation (15%) + Workforce (10%) + Sentiment (10%)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {breakdownEntries.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-800 font-semibold">{item.label}</span>
                <span className="text-slate-500 font-mono text-[10px]">{item.weight} weight</span>
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
                10–15 Year Leadership Horizon Forecast (2025–2040)
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
            entityName={company.name}
          />

          <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p>{forecast.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Historical Financial & R&D Performance (2015-2025) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Historical Indicators & Growth Velocity (2015–2025)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Time-series progression of annual revenue ($B) vs annual R&D investment ($B)
        </p>

        <TrendLineChart
          data={company.metrics}
          xKey="year"
          yUnit="B"
          series={[
            { key: "revenue", name: "Annual Revenue ($B)", color: "#2563eb" },
            { key: "rd_spending", name: "R&D Expenditure ($B)", color: "#059669" },
            { key: "profit", name: "Net Profit ($B)", color: "#7c3aed" }
          ]}
        />

        {/* Detailed Metrics Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5">Year</th>
                <th className="px-3 py-2.5 text-right">Revenue</th>
                <th className="px-3 py-2.5 text-right">Rev Growth</th>
                <th className="px-3 py-2.5 text-right">Profit Margin</th>
                <th className="px-3 py-2.5 text-right">Market Cap</th>
                <th className="px-3 py-2.5 text-right">R&D Spend</th>
                <th className="px-3 py-2.5 text-right">Patents</th>
                <th className="px-3 py-2.5 text-right">Tech Adoption</th>
                <th className="px-3 py-2.5 text-right">Sentiment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {company.metrics.map((m) => (
                <tr key={m.year} className="hover:bg-slate-50 transition">
                  <td className="px-3 py-2 font-mono font-bold text-slate-900">{m.year}</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-800">${m.revenue.toFixed(1)}B</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-600 font-bold">+{m.revenue_growth.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-800">{m.profit_margin.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-blue-600 font-bold">${m.market_cap.toFixed(1)}B</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-800">${m.rd_spending.toFixed(1)}B</td>
                  <td className="px-3 py-2 text-right font-mono text-slate-800">{m.patents.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono text-violet-600 font-bold">{m.technology_adoption.toFixed(0)}/100</td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600">
                    {m.sentiment_score > 0 ? `+${m.sentiment_score.toFixed(2)}` : m.sentiment_score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
