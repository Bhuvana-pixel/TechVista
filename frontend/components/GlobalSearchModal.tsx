"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Building2, Cpu, Newspaper, ArrowRight, X } from "lucide-react";
import ApiService from "@/lib/api";
import { Company, Technology, NewsItem } from "@/lib/types";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      loadCatalog();
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const [cRes, tRes, nRes] = await Promise.all([
        ApiService.getCompanies(),
        ApiService.getTechnologies(),
        ApiService.getNews("limit=6"),
      ]);
      setCompanies(cRes);
      setTechnologies(tRes);
      setNews(nRes);
    } catch (e) {
      console.error("Failed to load catalog for search", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredCompanies = query.trim()
    ? companies.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.ticker.toLowerCase().includes(query.toLowerCase()) ||
          c.industry.toLowerCase().includes(query.toLowerCase())
      )
    : companies.slice(0, 4);

  const filteredTechnologies = query.trim()
    ? technologies.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      )
    : technologies.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 bg-slate-50/50">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, tickers, emerging technologies, or news..."
            className="w-full py-4 text-sm bg-transparent border-none text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {/* Companies */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Companies ({filteredCompanies.length})</span>
            </div>
            <div className="space-y-1">
              {filteredCompanies.map((c) => (
                <a
                  key={c.id}
                  href={`/companies/${c.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {c.ticker}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {c.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">{c.industry} • {c.country}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </a>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-violet-600" />
              <span>Breakthrough Technologies ({filteredTechnologies.length})</span>
            </div>
            <div className="space-y-1">
              {filteredTechnologies.map((t) => (
                <a
                  key={t.id}
                  href={`/technologies/${t.id}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 transition group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-violet-600 transition">
                      {t.name}
                    </h4>
                    <p className="text-[10px] text-slate-500">{t.category}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono shadow-xs">ESC</kbd> to exit</span>
          <span className="font-semibold text-blue-600">TechVista Search Index</span>
        </div>
      </div>
    </div>
  );
}
