"use client";

import React, { useState, useEffect } from "react";
import { Newspaper, TrendingUp, AlertCircle, ExternalLink, Filter } from "lucide-react";
import ApiService from "@/lib/api";
import { NewsItem } from "@/lib/types";

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSentiment, setFilterSentiment] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getNews();
        setNews(data);
      } catch (err) {
        console.error("Failed to load news feed", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = news.filter((n) => {
    if (filterSentiment === "all") return true;
    return n.sentiment.toLowerCase() === filterSentiment.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold mb-2">
          <Newspaper className="h-3.5 w-3.5" />
          <span>Real-Time Intelligence & NLP Feed</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          News Sentiment Stream
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Algorithmic Natural Language Processing (NLP) sentiment scoring evaluated across global financial reports, tech disclosures, and research releases.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between glass-panel p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-700 font-semibold">Filter by Sentiment:</span>
          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="all">All Sentiments</option>
            <option value="Bullish">Bullish</option>
            <option value="Positive">Positive</option>
            <option value="Cautious">Cautious</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} curated articles
        </span>
      </div>

      {/* News Stream List */}
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">
          Streaming NLP sentiment records...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-xs glass-panel rounded-2xl border border-slate-200 p-8">
          No articles match this sentiment filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isBullish = item.sentiment === "Bullish";
            const isPositive = item.sentiment === "Positive";

            return (
              <div
                key={item.id}
                className="glass-panel-interactive p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-800">{item.source}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(item.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {item.company_name && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[10px] font-bold">
                        {item.company_name}
                      </span>
                    )}
                    {item.technology_name && (
                      <span className="px-2 py-0.5 rounded bg-violet-50 border border-violet-200 text-violet-700 font-mono text-[10px] font-bold">
                        {item.technology_name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                </div>

                {/* Sentiment Pill */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div
                    className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shadow-xs ${
                      isBullish
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : isPositive
                        ? "bg-sky-50 border-sky-200 text-sky-700"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    <span>{item.sentiment}</span>
                    <span className="font-mono text-[11px] font-bold">
                      {item.sentiment_score > 0 ? `+${item.sentiment_score.toFixed(2)}` : item.sentiment_score.toFixed(2)}
                    </span>
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 transition shadow-xs"
                      title="Open source coverage"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
