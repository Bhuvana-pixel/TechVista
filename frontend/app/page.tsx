"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Cpu,
  Trophy,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  GitCompare,
  Newspaper,
  Layers
} from "lucide-react";
import ApiService from "@/lib/api";
import { DashboardData } from "@/lib/types";
import HorizontalBarRankings from "@/components/Charts/HorizontalBarRankings";
import TrendLineChart from "@/components/Charts/TrendLineChart";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiService.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">
          Loading TechVista AI Leadership Dashboard...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center glass-panel rounded-2xl border border-slate-200 shadow-sm">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          ✕
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Service Temporarily Unavailable</h3>
        <p className="text-sm text-slate-500 max-w-md mb-6">{error}</p>
        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold transition shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    );
  }

  const { kpis, top_companies, top_technologies, market_growth_trends, investment_trends, innovation_trends, forecast_comparison } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Platform Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Multi-Indicator Leadership Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              See the Technology Leaders of <span className="gradient-text">Tomorrow.</span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Evaluating global corporate titans and breakthrough technologies across financial velocity, R&D intensity, patents, enterprise adoption, and 10–15 year horizon ML forecasting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/rankings"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition shadow-md shadow-blue-500/20"
            >
              <Trophy className="h-4 w-4" />
              <span>Global Rankings</span>
            </a>
            <a
              href="/compare"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition shadow-xs"
            >
              <GitCompare className="h-4 w-4 text-slate-500" />
              <span>Compare Cohorts</span>
            </a>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Companies</span>
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {kpis.companies_analyzed}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Global Mega-Caps</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Technologies</span>
            <Cpu className="h-4 w-4 text-violet-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {kpis.technologies_analyzed}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Frontier Sectors</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Leading Company</span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {kpis.top_company}
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-600 mt-1 block">
            Score: {kpis.top_company_score.toFixed(1)}/100
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Dominant Tech</span>
            <Sparkles className="h-4 w-4 text-cyan-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {kpis.top_technology}
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-600 mt-1 block">
            Score: {kpis.top_technology_score.toFixed(1)}/100
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">High Potential</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {kpis.high_potential_count}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Prob ≥ 80% Leaders</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Avg Leadership</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 font-mono">
            {kpis.average_company_score.toFixed(1)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Global Index Baseline</span>
        </div>
      </div>

      {/* Dual Rankings Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Rankings */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Company Leadership Index
              </h3>
            </div>
            <a
              href="/rankings"
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
            >
              All Companies <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Financials (20%), Market Cap (15%), Investment (15%), R&D (15%), Patents (15%), Workforce (10%), Sentiment (10%)
          </p>
          <HorizontalBarRankings
            data={top_companies}
            color="#2563eb"
            onClickItem={(id) => (window.location.href = `/companies/${id}`)}
          />
        </div>

        {/* Technology Rankings */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Breakthrough Technology Index
              </h3>
            </div>
            <a
              href="/rankings"
              className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 transition"
            >
              All Technologies <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Investment (20%), Innovation (20%), Adoption (20%), Market TAM Growth (20%), Ecosystem Interest (20%)
          </p>
          <HorizontalBarRankings
            data={top_technologies}
            color="#7c3aed"
            onClickItem={(id) => (window.location.href = `/technologies/${id}`)}
          />
        </div>
      </div>

      {/* Macro Historical Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Growth Trends */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Macro Growth Trends (% YoY)
              </h3>
              <p className="text-xs text-slate-500">Corporate revenue growth vs technology market expansion</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
              2018 – 2025
            </span>
          </div>
          <TrendLineChart
            data={market_growth_trends}
            xKey="year"
            series={[
              { key: "company_growth", name: "Enterprise Rev Growth (%)", color: "#2563eb" },
              { key: "tech_market_growth", name: "Tech Market Expansion (%)", color: "#059669" },
            ]}
            yUnit="%"
          />
        </div>

        {/* Corporate R&D Expenditure */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Capital Deployment Trends ($B)
              </h3>
              <p className="text-xs text-slate-500">Corporate R&D spending vs venture capital allocated</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
              SEC EDGAR & PitchBook
            </span>
          </div>
          <TrendLineChart
            data={investment_trends}
            xKey="year"
            series={[
              { key: "enterprise_rd", name: "Enterprise R&D ($B)", color: "#0284c7" },
              { key: "tech_venture_investment", name: "Tech Venture CapEx ($B)", color: "#7c3aed" },
            ]}
            yUnit="B"
          />
        </div>
      </div>

      {/* Multi-Year Forecast Horizon Comparison Matrix */}
      <div className="glass-panel rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              10–15 Year Leadership Forecast Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Probabilistic trajectory benchmark scores across 2025 baseline, 2030, and 2040 horizons
            </p>
          </div>
          <a
            href="/forecasts"
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
          >
            Scenario Simulator <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">2025 Baseline</th>
                <th className="px-4 py-3 text-right">2030 Horizon</th>
                <th className="px-4 py-3 text-right">2040 Horizon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecast_comparison.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.entity}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
                    {item.score_2025.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-blue-600 font-bold">
                    {item.score_2030.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-600 font-extrabold">
                    {item.score_2040.toFixed(1)}
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
