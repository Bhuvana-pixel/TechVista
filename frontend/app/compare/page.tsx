"use client";

import React, { useState, useEffect } from "react";
import {
  GitCompare,
  Building2,
  Cpu,
  Plus,
  X,
  TrendingUp,
  Layers,
  Sparkles
} from "lucide-react";
import ApiService from "@/lib/api";
import { Company, Technology } from "@/lib/types";
import RadarComparisonChart from "@/components/Charts/RadarComparisonChart";
import LocationFilterBar from "@/components/LocationFilterBar";

const ENTITY_COLORS = ["#2563eb", "#059669", "#7c3aed", "#d97706"];

export default function ComparePage() {
  const [mode, setMode] = useState<"companies" | "technologies">("companies");
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [allTechnologies, setAllTechnologies] = useState<Technology[]>([]);
  const [countryFilter, setCountryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  // Selected IDs (defaults: first 2)
  const [selectedCompIds, setSelectedCompIds] = useState<number[]>([1, 2]);
  const [selectedTechIds, setSelectedTechIds] = useState<number[]>([1, 2]);

  const [compareData, setCompareData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Initial load of master list
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [comps, techs] = await Promise.all([
          ApiService.getCompanies(),
          ApiService.getTechnologies(),
        ]);
        setAllCompanies(comps);
        setAllTechnologies(techs);
      } catch (e) {
        console.error("Master list load error", e);
      }
    };
    fetchMaster();
  }, []);

  // Filter companies based on location filter
  const filteredCompanies = allCompanies.filter((c) => {
    const matchesCountry = countryFilter === "all" || c.country === countryFilter;
    const matchesState = stateFilter === "all" || c.state === stateFilter;
    return matchesCountry && matchesState;
  });

  // Fetch comparison whenever selection changes
  useEffect(() => {
    const fetchComparison = async () => {
      const ids = mode === "companies" ? selectedCompIds : selectedTechIds;
      if (ids.length === 0) {
        setCompareData(null);
        return;
      }

      try {
        setLoading(true);
        const res = mode === "companies"
          ? await ApiService.compareCompanies(ids)
          : await ApiService.compareTechnologies(ids);
        setCompareData(res);
      } catch (e) {
        console.error("Compare error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [mode, selectedCompIds, selectedTechIds]);

  const toggleSelect = (id: number) => {
    if (mode === "companies") {
      if (selectedCompIds.includes(id)) {
        if (selectedCompIds.length > 1) {
          setSelectedCompIds(selectedCompIds.filter((x) => x !== id));
        }
      } else {
        if (selectedCompIds.length < 4) {
          setSelectedCompIds([...selectedCompIds, id]);
        }
      }
    } else {
      if (selectedTechIds.includes(id)) {
        if (selectedTechIds.length > 1) {
          setSelectedTechIds(selectedTechIds.filter((x) => x !== id));
        }
      } else {
        if (selectedTechIds.length < 4) {
          setSelectedTechIds([...selectedTechIds, id]);
        }
      }
    }
  };

  const currentSelection = mode === "companies" ? selectedCompIds : selectedTechIds;
  const masterList = mode === "companies" ? filteredCompanies : allTechnologies;

  // Build radar entity keys
  const radarEntityKeys = compareData?.entities?.map((e: any, idx: number) => ({
    key: mode === "companies" ? e.ticker : e.name,
    name: mode === "companies" ? `${e.ticker} (${e.name})` : e.name,
    color: ENTITY_COLORS[idx % ENTITY_COLORS.length]
  })) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
          <GitCompare className="h-3.5 w-3.5" />
          <span>Multi-Entity Cohort Benchmarking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Leadership Comparison Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select up to 4 companies or 4 emerging technologies to benchmark scores, multi-factor breakdowns, and future outlooks side-by-side.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setCompareData(null); setMode("companies"); }}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            mode === "companies"
              ? "bg-primary text-white shadow-sm shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Compare Companies (Max 4)
        </button>
        <button
          onClick={() => { setCompareData(null); setMode("technologies"); }}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            mode === "technologies"
              ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Cpu className="h-4 w-4" />
          Compare Technologies (Max 4)
        </button>
      </div>

      {/* Entity Selector Pills */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-800">
              Selected Cohort ({currentSelection.length}/4 maximum):
            </span>
            <span className="text-[11px] text-slate-500 block">
              Click to add or remove an entity for multi-dimensional radar comparison
            </span>
          </div>

          {mode === "companies" && (
            <LocationFilterBar
              country={countryFilter}
              state={stateFilter}
              onCountryChange={setCountryFilter}
              onStateChange={setStateFilter}
              compact={true}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {masterList.map((item) => {
            const isSelected = currentSelection.includes(item.id);
            const index = currentSelection.indexOf(item.id);
            const color = isSelected ? ENTITY_COLORS[index % ENTITY_COLORS.length] : undefined;

            return (
              <button
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  isSelected
                    ? "shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
                style={
                  isSelected
                    ? { backgroundColor: `${color}15`, borderColor: color, color: color }
                    : {}
                }
              >
                {isSelected ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                <span>{"ticker" in item && item.ticker ? `${item.ticker} - ${item.name}` : item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Visualizations */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Calculating multidimensional cohort delta...
        </div>
      ) : !compareData || !compareData.entities || compareData.entities.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs glass-panel rounded-xl">
          Please select at least 1 entity to compare.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Radar Chart Panel */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Multidimensional Factor Comparison Radar
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Normalized 0–100 scale across all core indicator dimensions
            </p>
            <RadarComparisonChart
              data={compareData.radar_data}
              entityKeys={radarEntityKeys}
            />
          </div>

          {/* Key Metrics Comparison Table */}
          <div className="glass-panel rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Detailed Indicator Benchmark Matrix
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Metric / Indicator</th>
                    {compareData.entities.map((e: any, idx: number) => (
                      <th
                        key={e.id}
                        className="px-4 py-3 text-right font-bold"
                        style={{ color: ENTITY_COLORS[idx % ENTITY_COLORS.length] }}
                      >
                        {e.ticker || e.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Leadership Score */}
                  <tr className="bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900">Leadership Score</td>
                    {compareData.entities.map((e: any) => (
                      <td key={e.id} className="px-4 py-3 text-right font-mono font-bold text-sm text-emerald-600">
                        {(e.leadership_score ?? 0).toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  {/* Future Potential */}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">Future Potential Ceiling</td>
                    {compareData.entities.map((e: any) => (
                      <td key={e.id} className="px-4 py-3 text-right font-mono font-bold text-xs text-blue-600">
                        {(e.future_potential ?? 0).toFixed(1)}
                      </td>
                    ))}
                  </tr>
                  {/* Leadership Probability */}
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-700">Leadership Probability</td>
                    {compareData.entities.map((e: any) => (
                      <td key={e.id} className="px-4 py-3 text-right font-mono font-semibold text-xs text-violet-600">
                        {Math.round((e.probability ?? 0) * 100)}%
                      </td>
                    ))}
                  </tr>

                  {/* Mode-specific raw indicators */}
                  {mode === "companies" ? (
                    <>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Market Capitalization</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-slate-900 font-semibold">
                            ${(e.raw_metrics?.market_cap ?? 0).toFixed(1)}B
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Annual Revenue</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-slate-800">
                            ${(e.raw_metrics?.revenue ?? 0).toFixed(1)}B
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Annual R&D Spending</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-slate-800">
                            ${(e.raw_metrics?.rd_spending ?? 0).toFixed(1)}B
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Active Patent Count</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-slate-800">
                            {(e.raw_metrics?.patents ?? 0).toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Technology Adoption Index</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-violet-600 font-bold">
                            {(e.raw_metrics?.technology_adoption ?? 0).toFixed(0)}/100
                          </td>
                        ))}
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Global Venture Investment</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-slate-900 font-semibold">
                            ${(e.raw_metrics?.investment ?? 0).toFixed(1)}B
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Market TAM Size</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-slate-800">
                            ${(e.raw_metrics?.market_size ?? 0).toFixed(1)}B
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Enterprise Adoption Rate</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-emerald-600 font-bold">
                            {(e.raw_metrics?.adoption_rate ?? 0).toFixed(1)}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Active Startups Tracked</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-slate-800">
                            {(e.raw_metrics?.startup_count ?? 0).toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-slate-600">Global Job Postings</td>
                        {compareData.entities.map((e: any) => (
                          <td key={e.id} className="px-4 py-3 text-right font-mono text-amber-600 font-bold">
                            {e.raw_metrics?.job_postings ?? 0}k
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
