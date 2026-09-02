"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Building2,
  Cpu,
  Search,
  Filter,
  ArrowUpDown,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import ApiService from "@/lib/api";
import { RankingItem } from "@/lib/types";

export default function RankingsPage() {
  const [tab, setTab] = useState<"companies" | "technologies">("companies");
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const queryParts: string[] = [];
      if (search.trim()) queryParts.push(`search=${encodeURIComponent(search.trim())}`);
      if (categoryFilter !== "all") {
        if (tab === "companies") queryParts.push(`industry=${encodeURIComponent(categoryFilter)}`);
        else queryParts.push(`category=${encodeURIComponent(categoryFilter)}`);
      }
      if (minScore > 0) queryParts.push(`min_score=${minScore}`);
      queryParts.push(`sort_by=${sortBy}`);
      queryParts.push(`sort_order=${sortOrder}`);

      const queryString = queryParts.join("&");
      const res = tab === "companies"
        ? await ApiService.getCompanyRankings(queryString)
        : await ApiService.getTechnologyRankings(queryString);

      setRankings(res);
    } catch (e) {
      console.error("Failed to load rankings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCategoryFilter("all");
    setSortBy("rank");
    setSortOrder("asc");
  }, [tab]);

  useEffect(() => {
    fetchRankings();
  }, [tab, search, categoryFilter, minScore, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder(column === "rank" ? "asc" : "desc");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
          <Trophy className="h-3.5 w-3.5" />
          <span>Multi-Indicator Global Leaderboards</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Comprehensive Leadership Rankings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Objective algorithmic rankings evaluating technological dominance, growth trajectory, and 10–15 year horizon leadership probability.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setTab("companies")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            tab === "companies"
              ? "bg-primary text-white shadow-sm shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Company Leaderboard
        </button>
        <button
          onClick={() => setTab("technologies")}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            tab === "technologies"
              ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Cpu className="h-4 w-4" />
          Technology Leaderboard
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Min Score Range Slider */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 whitespace-nowrap font-medium">Min Score:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-20 accent-primary cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-blue-600 w-6 text-right">
              {minScore}
            </span>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Refreshing ranking standings...
          </div>
        ) : rankings.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No entities match the current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200 select-none">
                <tr>
                  <th
                    onClick={() => handleSort("rank")}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center gap-1">
                      <span>Rank</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5">
                    {tab === "companies" ? "Company / Ticker" : "Technology Domain"}
                  </th>
                  <th className="px-4 py-3.5">Sector / Category</th>
                  <th
                    onClick={() => handleSort("score")}
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Score</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("future_potential")}
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Future Potential</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("probability")}
                    className="px-4 py-3.5 text-right cursor-pointer hover:text-slate-900 transition"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Leadership Prob</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3.5 text-center">Trend Outlook</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankings.map((item) => {
                  const probPct = Math.round(item.probability * 100);
                  const detailHref = tab === "companies" ? `/companies/${item.id}` : `/technologies/${item.id}`;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Rank */}
                      <td className="px-4 py-3 font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                            item.rank === 1
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : item.rank === 2
                              ? "bg-slate-100 text-slate-800 border border-slate-300"
                              : item.rank === 3
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "text-slate-500"
                          }`}
                        >
                          #{item.rank}
                        </span>
                      </td>

                      {/* Name & Identifier */}
                      <td className="px-4 py-3">
                        <a
                          href={detailHref}
                          className="font-bold text-slate-900 group-hover:text-primary transition block text-sm"
                        >
                          {item.name}
                        </a>
                        {item.ticker && (
                          <span className="font-mono text-[11px] text-slate-500">
                            {item.ticker} • {item.country}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-slate-600">
                        {item.industry || item.category}
                      </td>

                      {/* Score */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-sm text-emerald-600">
                        {item.leadership_score.toFixed(1)}
                      </td>

                      {/* Future Potential */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-xs text-blue-600">
                        {item.future_potential.toFixed(1)}
                      </td>

                      {/* Probability */}
                      <td className="px-4 py-3 text-right font-mono font-semibold text-xs text-violet-600">
                        {probPct}%
                      </td>

                      {/* Trend Badge */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.trend === "Bullish" || item.trend === "Accelerating"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : item.trend === "Neutral" || item.trend === "Stable"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-amber-50 border-amber-200 text-amber-700"
                          }`}
                        >
                          {item.trend}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <a
                          href={detailHref}
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold group-hover:text-primary transition"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
