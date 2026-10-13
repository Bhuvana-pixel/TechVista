"use client";

import React, { useEffect, useState } from "react";
import { Globe, MapPin, RotateCcw } from "lucide-react";
import ApiService from "@/lib/api";

interface LocationFilterBarProps {
  country: string;
  state: string;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  onReset?: () => void;
  compact?: boolean;
  className?: string;
}

export default function LocationFilterBar({
  country,
  state,
  onCountryChange,
  onStateChange,
  onReset,
  compact = false,
  className = "",
}: LocationFilterBarProps) {
  const [countries, setCountries] = useState<string[]>([]);
  const [statesMap, setStatesMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const res = await ApiService.getCompanyLocations();
        setCountries(res.countries || []);
        setStatesMap(res.states || {});
      } catch (err) {
        console.error("Failed to load company locations", err);
      } finally {
        setLoading(false);
      }
    };
    loadLocations();
  }, []);

  const handleCountrySelect = (newCountry: string) => {
    onCountryChange(newCountry);
    onStateChange("all");
  };

  const availableStates = country !== "all" && statesMap[country] ? statesMap[country] : [];
  const isStateDisabled = country === "all" || availableStates.length === 0;

  return (
    <div
      className={`flex flex-wrap items-center gap-2.5 ${
        compact ? "" : "glass-panel p-3 rounded-2xl border border-slate-200 shadow-xs"
      } ${className}`}
    >
      {/* Country Filter */}
      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Country:</span>
        <select
          value={country}
          onChange={(e) => handleCountrySelect(e.target.value)}
          disabled={loading}
          className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer pr-1"
        >
          <option value="all">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* State / Province Filter */}
      <div
        className={`flex items-center gap-1.5 border rounded-xl px-2.5 py-1.5 transition ${
          isStateDisabled
            ? "bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed"
            : "bg-slate-50 border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 cursor-pointer"
        }`}
      >
        <MapPin className={`h-3.5 w-3.5 shrink-0 ${isStateDisabled ? "text-slate-400" : "text-emerald-600"}`} />
        <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">State/Province:</span>
        <select
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
          disabled={isStateDisabled}
          className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer disabled:cursor-not-allowed pr-1"
        >
          <option value="all">
            {country === "all" ? "All States (Select Country First)" : `All States in ${country}`}
          </option>
          {availableStates.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      {(country !== "all" || state !== "all") && (
        <button
          onClick={() => {
            onCountryChange("all");
            onStateChange("all");
            if (onReset) onReset();
          }}
          title="Reset Location Filter"
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold transition"
        >
          <RotateCcw className="h-3 w-3" />
          <span className="hidden md:inline">Reset Location</span>
        </button>
      )}

      {/* Active Filter Pill Badge */}
      {(country !== "all" || state !== "all") && (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold font-mono">
          <span>
            🌐 {country === "all" ? "All Countries" : country}
            {state !== "all" && ` › ${state}`}
          </span>
        </div>
      )}
    </div>
  );
}
