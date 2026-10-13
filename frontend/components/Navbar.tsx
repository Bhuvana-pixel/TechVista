"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  Cpu,
  Trophy,
  GitCompare,
  TrendingUp,
  Newspaper,
  Database,
  ShieldCheck,
  Menu,
  X,
  Search,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Globe
} from "lucide-react";
import ApiService from "@/lib/api";
import GlobalSearchModal from "./GlobalSearchModal";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
}

// Core links directly visible on desktop
const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/geographic", label: "Geographic Insights", icon: Globe, badge: "New" },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/technologies", label: "Technologies", icon: Cpu },
  { href: "/rankings", label: "Rankings", icon: Trophy },
  { href: "/forecasts", label: "Forecasts", icon: TrendingUp },
];

// Secondary items in the "Explore" dropdown
const EXPLORE_NAV_ITEMS: NavItem[] = [
  {
    href: "/compare",
    label: "Compare Cohorts",
    icon: GitCompare,
    description: "Multi-entity radar & metric benchmarking",
  },
  {
    href: "/news",
    label: "News & Sentiment",
    icon: Newspaper,
    description: "Real-time NLP sentiment analysis",
  },
  {
    href: "/data-sources",
    label: "Data Sources",
    icon: Database,
    description: "Citations, SEC EDGAR & PitchBook feeds",
  },
  {
    href: "/admin",
    label: "Admin Console",
    icon: ShieldCheck,
    description: "ML pipeline telemetry & CSV upload",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  // Health check polling
  useEffect(() => {
    const check = async () => {
      try {
        await ApiService.checkHealth();
        setIsBackendHealthy(true);
      } catch {
        setIsBackendHealthy(false);
      }
    };
    check();
    const timer = setInterval(check, 30000);
    return () => clearInterval(timer);
  }, []);

  const isExploreActive = EXPLORE_NAV_ITEMS.some((item) => pathname === item.href);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-base font-black tracking-tight text-slate-900">
                    TECH<span className="text-blue-600">VISTA</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    AI
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-0.5 hidden sm:block">
                  Leadership Intelligence
                </span>
              </div>
            </a>

            {/* Desktop Navigation (>= 1024px) */}
            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {MAIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </a>
                );
              })}

              {/* Explore & Tools Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isExploreActive || dropdownOpen
                      ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                  <span>Explore</span>
                  <ChevronDown
                    className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu Panel */}
                {dropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-white p-2 border border-slate-200 shadow-xl shadow-slate-200/50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 z-50">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Analytics & Governance
                    </div>
                    <div className="space-y-1">
                      {EXPLORE_NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <a
                            key={item.href}
                            href={item.href}
                            onClick={() => setDropdownOpen(false)}
                            className={`flex items-start gap-3 p-2 rounded-xl transition ${
                              isActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <div
                              className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                isActive
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold leading-tight">{item.label}</span>
                              <span className="text-[11px] text-slate-400 leading-snug">
                                {item.description}
                              </span>
                            </div>
                          </a>
                        );
                      })}
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 px-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">API Documentation</span>
                      <a
                        href="http://127.0.0.1:8000/docs"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        OpenAPI <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Header Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-100 text-xs text-slate-500 hover:text-slate-800 border border-slate-200/80 transition shadow-xs group"
              title="Search (⌘K)"
            >
              <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition" />
              <span className="hidden sm:inline font-medium">Search...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-white rounded-md border border-slate-200 text-slate-400 font-mono font-bold shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Engine Telemetry Badge */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                isBackendHealthy === true
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isBackendHealthy === false
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isBackendHealthy === true
                    ? "bg-emerald-500 animate-pulse"
                    : isBackendHealthy === false
                    ? "bg-rose-500"
                    : "bg-amber-500 animate-ping"
                }`}
              />
              <span className="text-[11px]">
                {isBackendHealthy === true ? "Engine Online" : isBackendHealthy === false ? "Cold Start" : "Checking..."}
              </span>
            </div>

            {/* Quick Compare CTA (Desktop only) */}
            <a
              href="/compare"
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition"
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>Compare</span>
            </a>

            {/* Mobile / Tablet Menu Toggle (< 1024px) */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="h-5 w-5 text-blue-600" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Full Screen Slide-Down Menu (< 1024px) */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white border-b border-slate-200 shadow-2xl max-h-[85vh] overflow-y-auto px-4 py-5 space-y-5 animate-in slide-in-from-top-2 duration-200">
              {/* Quick Search inside Drawer */}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-medium"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <span>Search companies, tech, forecasts...</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white rounded border border-slate-200 text-slate-600 font-mono font-bold">
                  ⌘K
                </kbd>
              </button>

              {/* Core Modules */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block mb-2">
                  Core Intelligence Modules
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {MAIN_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs"
                            : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Analytics & Tools */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 block mb-2">
                  Analytics & Governance Tools
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {EXPLORE_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-xs"
                            : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                          <span>{item.label}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer with Status & API Docs */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isBackendHealthy === true ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                  <span className="font-medium text-[11px]">
                    Backend: {isBackendHealthy === true ? "Online (Healthy)" : "Connecting..."}
                  </span>
                </div>
                <a
                  href="http://127.0.0.1:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 font-semibold flex items-center gap-1 hover:underline text-[11px]"
                >
                  OpenAPI Docs <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Command Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
