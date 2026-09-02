"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import ApiService from "@/lib/api";

export default function WakeUpBanner() {
  const [isWaking, setIsWaking] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkConnection = async () => {
    try {
      setRetrying(true);
      await ApiService.checkHealth();
      setIsWaking(false);
    } catch {
      setIsWaking(true);
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (!isWaking || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-2.5 text-xs shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Render Free Tier Cold Start:</strong> The TechVista backend service is waking up after inactivity (~30s). Live forecasting scores and analytics will stream shortly.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={checkConnection}
            disabled={retrying}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold transition shadow-xs"
          >
            <RefreshCw className={`h-3 w-3 ${retrying ? "animate-spin" : ""}`} />
            <span>{retrying ? "Connecting..." : "Retry"}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-950 px-1 font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
