"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Building2,
  Cpu,
  Info,
  Calendar,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import ApiService from "@/lib/api";
import { Company, Technology, ForecastResponse } from "@/lib/types";
import ForecastScenarioChart from "@/components/Charts/ForecastScenarioChart";

export default function ForecastsPage() {
  const [entityType, setEntityType] = useState<"company" | "technology">("company");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Load companies & technologies catalogs
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [cRes, tRes] = await Promise.all([
          ApiService.getCompanies(),
          ApiService.getTechnologies(),
        ]);
        setCompanies(cRes);
        setTechnologies(tRes);
        if (cRes.length > 0) setSelectedId(cRes[0].id);
      } catch (e) {
        console.error("Entity load error", e);
      }
    };
    fetchEntities();
  }, []);

  // Whenever entityType or selectedId changes, fetch forecast
  useEffect(() => {
    if (!selectedId) return;

    const fetchForecastData = async () => {
      try {
        setLoading(true);
        const res = entityType === "company"
          ? await ApiService.getCompanyForecast(selectedId)
          : await ApiService.getTechnologyForecast(selectedId);
        setForecast(res);
      } catch (e) {
        console.error("Forecast fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchForecastData();
  }, [entityType, selectedId]);

  const handleTypeChange = (type: "company" | "technology") => {
    setEntityType(type);
    if (type === "company" && companies.length > 0) {
      setSelectedId(companies[0].id);
    } else if (type === "technology" && technologies.length > 0) {
      setSelectedId(technologies[0].id);
    }
  };

  const currentList = entityType === "company" ? companies : technologies;
  const currentEntity = currentList.find((x) => x.id === selectedId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Long-Range Scenario Modeling</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          10–15 Year Leadership Horizon Forecasts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore probabilistic future trajectories across 2027, 2030, 2035, and 2040 horizons powered by gradient boosting and damped diffusion models.
        </p>
      </div>

      {/* Control Panel: Type Switcher & Entity Dropdown */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Type Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => handleTypeChange("company")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              entityType === "company"
                ? "bg-primary text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" /> Companies
          </button>
          <button
            onClick={() => handleTypeChange("technology")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              entityType === "technology"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" /> Technologies
          </button>
        </div>

        {/* Entity Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Select Target:</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary min-w-[200px]"
          >
            {currentList.map((item) => (
              <option key={item.id} value={item.id}>
                {"ticker" in item && item.ticker ? `${item.ticker} - ${item.name}` : item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Forecast Output */}
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">
          Calculating multi-horizon scenario distributions...
        </div>
      ) : !forecast ? (
        <div className="py-16 text-center text-slate-500 text-xs glass-panel rounded-xl">
          No forecast available for this entity.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Horizon Snapshot KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {/* 2025 Current */}
            <div className="glass-panel rounded-2xl p-4 border border-slate-200 shadow-xs bg-slate-50">
              <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block mb-1">
                2025 BASELINE
              </span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {forecast.current_score.toFixed(1)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-1 font-medium">Current Score</span>
            </div>

            {/* Target Horizons: 2027, 2030, 2035, 2040 */}
            {forecast.forecasts.map((f) => (
              <div
                key={f.year}
                className="glass-panel rounded-2xl p-4 border border-slate-200 shadow-xs bg-white"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-blue-600 font-mono font-bold">
                    {f.year} HORIZON
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono font-medium">
                    {Math.round(f.confidence * 100)}% conf
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-600 font-mono">
                  {f.leadership_score.toFixed(1)}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Prob: {Math.round(f.probability * 100)}%</span>
                  <span className="font-mono text-slate-400">[{f.lower_bound} - {f.upper_bound}]</span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Chart */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Trajectory Simulation Curve: {forecast.entity_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Includes 95% forecast dispersion corridor with asymptotic saturation dampening
                </p>
              </div>
            </div>

            <ForecastScenarioChart
              currentScore={forecast.current_score}
              forecasts={forecast.forecasts}
              entityName={forecast.entity_name}
            />
          </div>

          {/* Detailed Horizon Forecast Table */}
          <div className="glass-panel rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Detailed Scenario Horizon Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Forecast Year</th>
                    <th className="px-4 py-3 text-right">Projected Leadership Score</th>
                    <th className="px-4 py-3 text-right">Future Potential Ceiling</th>
                    <th className="px-4 py-3 text-right">Leadership Probability</th>
                    <th className="px-4 py-3 text-right">Lower Bound (-σ)</th>
                    <th className="px-4 py-3 text-right">Upper Bound (+σ)</th>
                    <th className="px-4 py-3 text-right">Model Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {forecast.forecasts.map((f) => (
                    <tr key={f.year} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        <span>{f.year}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                        {f.leadership_score.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-violet-600">
                        {f.future_potential.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-sky-600">
                        {Math.round(f.probability * 100)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {f.lower_bound.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {f.upper_bound.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-600 font-bold">
                        {Math.round(f.confidence * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mandatory Non-Financial Disclaimer (Section 15) */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Important Machine Learning Forecasting Disclaimer
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {forecast.disclaimer} Model-generated leadership probabilities and projections do not account for unforeseen geopolitical black-swan events, regulatory interventions, or catastrophic economic shifts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
