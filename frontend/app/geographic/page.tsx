"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  MapPin,
  Building2,
  Cpu,
  Trophy,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Info
} from "lucide-react";
import ApiService from "@/lib/api";
import {
  GeoCompanyRankingItem,
  GeoTechnologyRankingItem,
  CountryOverviewCard,
  GeoCompaniesResponse,
  GeoTechnologiesResponse,
  GeoOverviewResponse
} from "@/lib/types";
import LocationFilterBar from "@/components/LocationFilterBar";

export default function GeographicInsightsPage() {
  const [country, setCountry] = useState<string>("all");
  const [state, setState] = useState<string>("all");
  const [topN, setTopN] = useState<number>(5);
  const [year, setYear] = useState<number>(2030);

  const [loading, setLoading] = useState<boolean>(true);
  const [companiesData, setCompaniesData] = useState<GeoCompaniesResponse | null>(null);
  const [techsData, setTechsData] = useState<GeoTechnologiesResponse | null>(null);
  const [overviewData, setOverviewData] = useState<GeoOverviewResponse | null>(null);

  // Fetch geographic insights data whenever filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (country === "all") {
          // Fetch All Countries Overview
          const res = await ApiService.getGeoOverview(`top_n=${topN}&year=${year}`);
          setOverviewData(res);
          setCompaniesData(null);
          setTechsData(null);
        } else {
          // Fetch specific Country / State data
          const queryParts: string[] = [];
          queryParts.push(`country=${encodeURIComponent(country)}`);
          if (state !== "all") queryParts.push(`state=${encodeURIComponent(state)}`);
          queryParts.push(`top_n=${topN}`);
          queryParts.push(`year=${year}`);

          const qStr = queryParts.join("&");
          const [cRes, tRes] = await Promise.all([
            ApiService.getGeoCompanies(qStr),
            ApiService.getGeoTechnologies(qStr)
          ]);

          setCompaniesData(cRes);
          setTechsData(tRes);
          setOverviewData(null);
        }
      } catch (err) {
        console.error("Failed to load geographic insights", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [country, state, topN, year]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
          <Globe className="h-3.5 w-3.5" />
          <span>Regional Leadership & Forecast Modeling</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Geographic Insights & Regional Leaderboards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Dynamic country-wise and state-wise rankings of technology corporations and emerging technological paradigms.
        </p>
      </div>

      {/* Global Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Location Filter */}
          <LocationFilterBar
            country={country}
            state={state}
            onCountryChange={setCountry}
            onStateChange={setState}
            compact={true}
          />

          {/* Controls: Top N & Forecast Year */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Top N Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-500">Show Top:</span>
              <select
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
              </select>
            </div>

            {/* Forecast Year Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-semibold text-slate-500">Horizon Year:</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-blue-700 focus:outline-none cursor-pointer"
              >
                <option value={2025}>2025 (Baseline Score)</option>
                <option value={2027}>2027 Horizon Forecast</option>
                <option value={2030}>2030 Horizon Forecast</option>
                <option value={2035}>2035 Horizon Forecast</option>
                <option value={2040}>2040 Horizon Forecast</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">
          Calculating geographic leadership distributions and tie rankings...
        </div>
      ) : country === "all" ? (
        /* MODE 1: ALL COUNTRIES OVERVIEW GRID */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Global Country Overview ({year} Horizon)
              </h2>
              <p className="text-xs text-slate-500">
                Top companies and emerging technologies evaluated across {overviewData?.total_countries || 0} active global technology hubs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {overviewData?.countries.map((item) => (
              <div
                key={item.country}
                className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-300 transition"
              >
                <div className="space-y-3">
                  {/* Card Country Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                        {item.country.substring(0, 2).toUpperCase()}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{item.country}</h3>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.companies_count} Companies
                    </span>
                  </div>

                  {/* Top Companies List */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-blue-600" /> Top Companies
                      </span>
                      <span>Score</span>
                    </div>
                    {item.top_companies.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Data unavailable</p>
                    ) : (
                      item.top_companies.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${c.is_tied ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                              #{c.rank}{c.is_tied ? " (TIE)" : ""}
                            </span>
                            <span className="font-semibold text-slate-800 truncate max-w-[140px]">{c.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({c.ticker})</span>
                          </div>
                          <span className="font-mono font-bold text-blue-700 text-xs">{c.score.toFixed(1)}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Top Emerging Technologies List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Cpu className="h-3 w-3 text-violet-600" /> Emerging Tech
                      </span>
                      <span>Score</span>
                    </div>
                    {item.top_technologies.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Data unavailable</p>
                    ) : (
                      item.top_technologies.map((t) => (
                        <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${t.is_tied ? "bg-amber-100 text-amber-800" : "bg-violet-50 text-violet-700"}`}>
                              #{t.rank}{t.is_tied ? " (TIE)" : ""}
                            </span>
                            <span className="font-semibold text-slate-800 truncate max-w-[150px]">{t.name}</span>
                          </div>
                          <span className="font-mono font-bold text-violet-700 text-xs">{t.score.toFixed(1)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setCountry(item.country)}
                  className="w-full mt-3 py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-blue-700 font-bold text-xs transition border border-slate-200 hover:border-blue-200 flex items-center justify-center gap-1.5"
                >
                  <span>Inspect {item.country} Deep-Dive</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MODE 2: SPECIFIC COUNTRY / STATE ANALYSIS TABLES */
        <div className="space-y-8">
          {/* Active Filter Title Banner */}
          <div className="glass-panel p-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Leaderboard for {country}</span>
                {state !== "all" && <span className="text-blue-700 font-mono">› {state}</span>}
                <span className="text-xs font-mono font-normal text-slate-500">({year} Horizon • Top {topN})</span>
              </h2>
              <p className="text-xs text-slate-600">
                Evaluating company future potential and regional technology adoption for {state !== "all" ? `${state}, ${country}` : country}.
              </p>
            </div>
          </div>

          {/* Section 1: Top Companies */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Top Companies ({country}{state !== "all" ? ` › ${state}` : ""})
              </h3>
            </div>

            {!companiesData?.data_available || companiesData.companies.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border border-slate-200 space-y-2">
                <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Data Unavailable</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {companiesData?.message || `No company metric records available for ${state !== "all" ? `${state}, ${country}` : country}.`}
                </p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200 select-none">
                      <tr>
                        <th className="px-4 py-3.5">Rank</th>
                        <th className="px-4 py-3.5">Company & Ticker</th>
                        <th className="px-4 py-3.5">Industry</th>
                        <th className="px-4 py-3.5">Location</th>
                        <th className="px-4 py-3.5 text-right">{year} Score</th>
                        <th className="px-4 py-3.5 text-right">Future Potential</th>
                        <th className="px-4 py-3.5 text-right">Leadership Prob</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {companiesData.companies.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-mono font-bold">
                            <div className="flex items-center gap-1">
                              <span className={`inline-flex items-center justify-center h-6 px-2 rounded-md text-xs font-bold ${
                                c.rank === 1
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : c.rank === 2
                                  ? "bg-slate-200 text-slate-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                #{c.rank}
                              </span>
                              {c.is_tied && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                  TIED
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a href={`/companies/${c.id}`} className="font-bold text-slate-900 hover:text-primary transition block text-sm">
                              {c.name}
                            </a>
                            <span className="font-mono text-[11px] text-slate-500">{c.ticker}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{c.industry}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {c.country}{c.state && c.state !== "Data unavailable" ? ` (${c.state})` : ""}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-blue-700 text-sm">
                            {c.score.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-600 font-semibold">
                            {c.future_potential.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-slate-700">
                            {Math.round(c.probability * 100)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Top Emerging Technologies */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-violet-600" />
              <h3 className="text-base font-bold text-slate-900">
                Top Emerging Technologies ({country}{state !== "all" ? ` › ${state}` : ""})
              </h3>
            </div>

            {!techsData?.data_available || techsData.technologies.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-2xl border border-slate-200 space-y-2">
                <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Data Unavailable</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {techsData?.message || `No technology adoption metrics recorded for ${state !== "all" ? `${state}, ${country}` : country}.`}
                </p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200 select-none">
                      <tr>
                        <th className="px-4 py-3.5">Rank</th>
                        <th className="px-4 py-3.5">Technology Domain</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5 text-right">{year} Score</th>
                        <th className="px-4 py-3.5 text-right">Future Potential</th>
                        <th className="px-4 py-3.5 text-right">Enterprise Adoption</th>
                        <th className="px-4 py-3.5">Regional Indicator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {techsData.technologies.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-mono font-bold">
                            <div className="flex items-center gap-1">
                              <span className={`inline-flex items-center justify-center h-6 px-2 rounded-md text-xs font-bold ${
                                t.rank === 1
                                  ? "bg-violet-100 text-violet-800 border border-violet-300"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                #{t.rank}
                              </span>
                              {t.is_tied && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                                  TIED
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <a href={`/technologies/${t.id}`} className="font-bold text-slate-900 hover:text-violet-600 transition block text-sm">
                              {t.name}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{t.category}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-violet-700 text-sm">
                            {t.score.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-600 font-semibold">
                            {t.future_potential.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-700">
                            {t.adoption_rate.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                            {t.regional_indicator}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
