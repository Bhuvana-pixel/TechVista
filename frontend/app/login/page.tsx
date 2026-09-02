"use client";

import React, { useState } from "react";
import { Lock, Mail, User, ArrowRight, Sparkles, CheckCircle2, Shield } from "lucide-react";
import ApiService from "@/lib/api";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        await ApiService.register({ name, email, password });
        setSuccessMsg("Account registered and authenticated successfully! Redirecting...");
      } else {
        await ApiService.login({ email, password });
        setSuccessMsg("Authentication successful! Redirecting...");
      }
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: "admin" | "analyst") => {
    if (role === "admin") {
      setEmail("admin@techvista.ai");
      setPassword("AdminPass123!");
    } else {
      setEmail("analyst@techvista.ai");
      setPassword("Analyst123!");
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-blue-500/20 mb-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRegister ? "Create Analyst Account" : "Access TechVista Console"}
          </h1>
          <p className="text-xs text-slate-500">
            Secure JWT access for technology leadership intelligence & forecasting
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name:
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@techvista.ai"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password:
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition mt-2 shadow-md shadow-blue-500/20"
            >
              <span>{loading ? "Verifying..." : isRegister ? "Create Account" : "Authenticate"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Switch Login/Register */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {isRegister ? (
              <p>
                Already have credentials?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Log In
                </button>
              </p>
            ) : (
              <p>
                New organization?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-blue-600 hover:underline font-bold"
                >
                  Register Account
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Quick Demo Credentials Access */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <Shield className="h-3.5 w-3.5 text-blue-600" />
            <span>Demo Benchmark Credentials (Click to Autofill):</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fillDemo("admin")}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] font-semibold transition shadow-xs"
            >
              Admin: admin@techvista.ai
            </button>
            <button
              onClick={() => fillDemo("analyst")}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] font-semibold transition shadow-xs"
            >
              Analyst: analyst@techvista.ai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
