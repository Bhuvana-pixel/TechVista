"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Shield,
  ExternalLink
} from "lucide-react";
import ApiService from "@/lib/api";
import { Company } from "@/lib/types";

export default function CompaniesCatalogPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getCompanies();
        setCompanies(data);
      } catch (err) {
        console.error("Failed to load companies", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const industries = Array.from(new Set(companies.map((c) => c.industry))).filter(Boolean);

  const filtered = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.ticker.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industryFilter === "all" || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-2">
            <Building2 className="h-3.5 w-3.5" />
            <span>Corporate Titans & Innovators</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Company Leadership Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and inspect multinational technology leaders, composite leadership scores, and 10–15 year horizon outlooks.
          </p>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 glass-panel p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company by name or ticker (e.g., NVDA, Microsoft)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-primary"
          >
            <option value="all">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Companies */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Loading company intelligence...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-xl border border-slate-200 p-8">
          <p className="text-slate-500 text-sm">No companies match your current search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((company) => {
            const probPct = Math.round((company.probability || 0.75) * 100);

            return (
              <a
                key={company.id}
                href={`/companies/${company.id}`}
                className="glass-panel-interactive rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="inline-block font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                        {company.ticker}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition">
                        {company.name}
                      </h3>
                      <p className="text-xs text-slate-500">{company.industry} • {company.country}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-emerald-600 font-mono">
                        {(company.leadership_score || 0).toFixed(1)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Score / 100</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {company.description}
                  </p>
                </div>

                <div>
                  {/* Key Indicators Mini-Row */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Future Potential</span>
                      <span className="font-mono font-bold text-blue-600">
                        {(company.future_potential || 0).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Leadership Prob</span>
                      <span className="font-mono font-bold text-violet-600">
                        {probPct}%
                      </span>
                    </div>
                  </div>

                  {/* Action Link Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 group-hover:text-primary transition font-semibold">
                    <span>Deep-Dive Profile</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
