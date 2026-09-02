"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers
} from "lucide-react";
import ApiService from "@/lib/api";
import { Technology } from "@/lib/types";

export default function TechnologiesCatalogPage() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getTechnologies();
        setTechnologies(data);
      } catch (err) {
        console.error("Failed to load technologies", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const categories = Array.from(new Set(technologies.map((t) => t.category))).filter(Boolean);

  const filtered = technologies.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 text-xs font-semibold mb-2">
          <Cpu className="h-3.5 w-3.5" />
          <span>Frontier Technology Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Emerging Technologies Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore breakthrough technological paradigms, enterprise adoption curves, patent density, and 10–15 year horizon leadership scores.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 glass-panel p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search technology (e.g. Generative AI, Quantum Computing, Robotics)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-primary"
          >
            <option value="all">All Domains</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Technologies */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          Evaluating technology velocity and patent indices...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-xl text-slate-500 text-xs border border-slate-200 p-8">
          No technologies match the search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tech) => {
            const probPct = Math.round((tech.probability || 0.75) * 100);

            return (
              <a
                key={tech.id}
                href={`/technologies/${tech.id}`}
                className="glass-panel-interactive rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 mb-1">
                        {tech.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition">
                        {tech.name}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black text-emerald-600 font-mono">
                        {(tech.leadership_score || 0).toFixed(1)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Score / 100</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {tech.description}
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Future Potential</span>
                      <span className="font-mono font-bold text-violet-600">
                        {(tech.future_potential || 0).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Leadership Prob</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {probPct}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 group-hover:text-violet-600 transition font-semibold">
                    <span>Explore Diffusion & Forecast</span>
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
