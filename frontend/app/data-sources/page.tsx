"use client";

import React, { useState, useEffect } from "react";
import { Database, ShieldCheck, ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react";
import ApiService from "@/lib/api";
import { DataSourceItem } from "@/lib/types";

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getDataSources();
        setSources(data);
      } catch (err) {
        console.error("Failed to load data sources", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold mb-2">
          <Database className="h-3.5 w-3.5" />
          <span>Data Provenance & Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Data Sources & Methodology Transparency
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Every indicator and model input in TechVista is tracked against verified regulatory registries, scientific repositories, or benchmark calibration datasets.
        </p>
      </div>

      {/* Transparency Statement Box */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs leading-relaxed text-slate-700">
            <h3 className="font-bold text-slate-900 text-sm">Mode A & Mode B Data Architecture</h3>
            <p>
              In adherence to our data integrity policy, TechVista operates an explicit dual-mode ingestion architecture:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>
                <strong className="text-slate-900">Demo / Sample Benchmark Mode:</strong> The initial dataset contains realistic, calibrated historical metrics (2015–2025) strictly labeled as demo benchmark data. Synthetic values are never misrepresented as live SEC feeds.
              </li>
              <li>
                <strong className="text-slate-900">External Provider Mode:</strong> The platform features an abstraction layer (<code className="text-blue-600 font-semibold">DataProvider</code>) ready to bind directly to external APIs (SEC EDGAR, USPTO, arXiv, Financial Markets) without modifying core forecasting logic.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sources List Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Registered Ingestion Feeds</h3>
          <span className="text-xs text-slate-500 font-medium">{sources.length} total sources</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading sources registry...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Source Name</th>
                  <th className="px-4 py-3">Data Domain</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Verified</th>
                  <th className="px-4 py-3 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sources.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {s.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                        {s.source_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shadow-xs ${
                        s.status === "Active"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-blue-50 border-blue-200 text-blue-700"
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {new Date(s.last_updated).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.source_url ? (
                        <a
                          href={s.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs transition"
                        >
                          Documentation <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-medium">Internal Feed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
