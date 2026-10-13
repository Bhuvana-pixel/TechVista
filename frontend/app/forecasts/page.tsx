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
import LocationFilterBar from "@/components/LocationFilterBar";

import { Trophy, ArrowUpRight, Crown } from "lucide-react";

export default function ForecastsPage() {
  const [entityType, setEntityType] = useState<"company" | "technology">("company");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [countryFilter, setCountryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  const [selectedId, setSelectedId] = useState<number>(1);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [activeHorizonYr, setActiveHorizonYr] = useState<number>(2030);
  const [loading, setLoading] = useState(false);

  // Load initial companies and technologies
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

  // Fetch forecast leaderboard whenever location filters change
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const queryParts: string[] = [];
        if (countryFilter !== "all") queryParts.push(`country=${encodeURIComponent(countryFilter)}`);
        if (stateFilter !== "all") queryParts.push(`state=${encodeURIComponent(stateFilter)}`);
        const lbRes = await ApiService.getForecastLeaderboard(queryParts.join("&"));
        setLeaderboard(lbRes);
      } catch (e) {
        console.error("Leaderboard load error", e);
      }
    };
    fetchLeaderboard();
  }, [countryFilter, stateFilter]);

  // Compute filtered companies list based on location
  const filteredCompanies = companies.filter((c) => {
    const matchesCountry = countryFilter === "all" || c.country === countryFilter;
    const matchesState = stateFilter === "all" || c.state === stateFilter;
    return matchesCountry && matchesState;
  });

  // Auto-adjust selectedId when location filters change if current selection is not in filtered list
  useEffect(() => {
    if (entityType === "company") {
      if (filteredCompanies.length > 0) {
        const isCurrentValid = filteredCompanies.some((c) => c.id === selectedId);
        if (!isCurrentValid) {
          setSelectedId(filteredCompanies[0].id);
        }
      }
    }
  }, [countryFilter, stateFilter, entityType, companies]);

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
    if (type === "company" && filteredCompanies.length > 0) {
      setSelectedId(filteredCompanies[0].id);
    } else if (type === "technology" && technologies.length > 0) {
      setSelectedId(technologies[0].id);
    }
  };

  const currentList = entityType === "company" ? filteredCompanies : technologies;
  const currentHorizonData = leaderboard?.horizons?.[String(activeHorizonYr)];

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

      {/* Rank #1 Projected Leaders Showcase */}
      {leaderboard && leaderboard.horizons && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  Predicted Horizon Rank #1 Leaders ({activeHorizonYr})
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Top predicted Company and Technology Domain projected to lead the global market in {activeHorizonYr}
              </p>
            </div>

            {/* Horizon Year Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[2027, 2030, 2035, 2040].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setActiveHorizonYr(yr)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
                    activeHorizonYr === yr
                      ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {currentHorizonData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Company #1 Leader */}
              {currentHorizonData.top_company && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                      <Trophy className="h-3 w-3 text-amber-600" /> RANK #1 COMPANY ({activeHorizonYr})
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      Score: {currentHorizonData.top_company.leadership_score.toFixed(1)}/100
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{currentHorizonData.top_company.name}</span>
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        ({currentHorizonData.top_company.ticker})
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      {currentHorizonData.top_company.industry} • {currentHorizonData.top_company.country}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/50">
                    <span className="text-slate-600 font-medium">
                      Leadership Probability: <strong className="text-blue-700 font-mono">{Math.round(currentHorizonData.top_company.probability * 100)}%</strong>
                    </span>
                    <button
                      onClick={() => { setEntityType("company"); setSelectedId(currentHorizonData.top_company.id); }}
                      className="text-amber-800 font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      View Full Curve <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Top Technology #1 Leader */}
              {currentHorizonData.top_technology && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50/60 to-purple-50/40 border border-violet-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-bold font-mono">
                      <Sparkles className="h-3 w-3 text-violet-600" /> RANK #1 TECH DOMAIN ({activeHorizonYr})
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      Score: {currentHorizonData.top_technology.leadership_score.toFixed(1)}/100
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {currentHorizonData.top_technology.name}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium">
                      Category: {currentHorizonData.top_technology.category}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-violet-200/50">
                    <span className="text-slate-600 font-medium">
                      Leadership Probability: <strong className="text-violet-700 font-mono">{Math.round(currentHorizonData.top_technology.probability * 100)}%</strong>
                    </span>
                    <button
                      onClick={() => { setEntityType("technology"); setSelectedId(currentHorizonData.top_technology.id); }}
                      className="text-violet-800 font-bold hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      View Full Curve <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Control Panel: Type Switcher, Geographic Location Filter & Entity Dropdown */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
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

          {/* Location Filters for Companies */}
          {entityType === "company" && (
            <LocationFilterBar
              country={countryFilter}
              state={stateFilter}
              onCountryChange={setCountryFilter}
              onStateChange={setStateFilter}
              compact={true}
            />
          )}
        </div>

        {/* Entity Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 w-full lg:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Target Entity:</span>
          {currentList.length === 0 ? (
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              No entities in selected location
            </span>
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary min-w-[220px]"
            >
              {currentList.map((item) => (
                <option key={item.id} value={item.id}>
                  {"ticker" in item && item.ticker ? `${item.ticker} - ${item.name}` : item.name}
                </option>
              ))}
            </select>
          )}
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
