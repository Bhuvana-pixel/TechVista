import React from "react";
import { Sparkles, Shield, Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-lg mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              TECH<span className="text-blue-600">VISTA</span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-4">
              AI-powered corporate and technology leadership forecasting platform.
              Multi-indicator scoring engines and gradient boosting algorithms evaluate 10–15 year leadership horizons across global enterprise ecosystems.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-xs">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span>Engineered for Vercel + Render Free Tier Deployment</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Intelligence Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/companies" className="text-slate-600 hover:text-blue-600 transition font-medium">Company Leader Prediction</a></li>
              <li><a href="/technologies" className="text-slate-600 hover:text-blue-600 transition font-medium">Technology Leader Prediction</a></li>
              <li><a href="/rankings" className="text-slate-600 hover:text-blue-600 transition font-medium">Comprehensive Leaderboards</a></li>
              <li><a href="/compare" className="text-slate-600 hover:text-blue-600 transition font-medium">Multi-Entity Comparison</a></li>
              <li><a href="/forecasts" className="text-slate-600 hover:text-blue-600 transition font-medium">2027–2040 Horizon Forecasts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Governance & Data
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/data-sources" className="text-slate-600 hover:text-blue-600 transition font-medium">Data Transparency & Citations</a></li>
              <li><a href="/news" className="text-slate-600 hover:text-blue-600 transition font-medium">NLP Sentiment Feeds</a></li>
              <li><a href="/admin" className="text-slate-600 hover:text-blue-600 transition font-medium">Admin Console & CSV Ingestion</a></li>
              <li>
                <a
                  href="http://127.0.0.1:8000/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition font-semibold flex items-center gap-1"
                >
                  FastAPI OpenAPI Docs <Terminal className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TechVista Analytics Platform. All rights reserved.</p>
          <p className="max-w-lg text-center sm:text-right text-slate-400">
            Disclaimer: Forecasts represent model-based estimates derived from historical indicators and do not constitute financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
