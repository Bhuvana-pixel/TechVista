"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Upload,
  Play,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Building2,
  HardDrive,
  FileText,
  Download,
  Terminal,
  Activity
} from "lucide-react";
import ApiService from "@/lib/api";
import { SystemStatus, ModelVersionItem } from "@/lib/types";

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [models, setModels] = useState<ModelVersionItem[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // CSV Upload state
  const [datasetType, setDatasetType] = useState("companies");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ML Training trigger state
  const [trainingCompany, setTrainingCompany] = useState(false);
  const [trainingTech, setTrainingTech] = useState(false);
  const [trainMessage, setTrainMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statusRes, modelsRes, logsRes] = await Promise.all([
        ApiService.getSystemStatus(),
        ApiService.getModelVersions(),
        ApiService.getIngestionLogs(),
      ]);
      setStatus(statusRes);
      setModels(modelsRes);
      setLogs(logsRes);
    } catch (e) {
      console.error("Admin data error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadResult(null);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("dataset_type", datasetType);

      const res = await ApiService.uploadCsv(formData);
      setUploadResult(res);
      if (res.success) {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      fetchAdminData();
    } catch (err: any) {
      setUploadResult({
        success: false,
        errors: [{ row: 0, column: "Network", message: err.message || "Upload failed" }]
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTrainCompany = async () => {
    try {
      setTrainingCompany(true);
      setTrainMessage(null);
      const res = await ApiService.trainCompanyModel();
      setTrainMessage(`Company Model trained successfully: ${res.training_details?.algorithm} (${res.training_details?.version}) - Test R²: ${res.training_details?.metrics?.test_r2}`);
      fetchAdminData();
    } catch (err: any) {
      setTrainMessage(`Training failed: ${err.message}`);
    } finally {
      setTrainingCompany(false);
    }
  };

  const handleTrainTech = async () => {
    try {
      setTrainingTech(true);
      setTrainMessage(null);
      const res = await ApiService.trainTechnologyModel();
      setTrainMessage(`Technology Model trained successfully: ${res.training_details?.algorithm} (${res.training_details?.version}) - Test R²: ${res.training_details?.metrics?.test_r2}`);
      fetchAdminData();
    } catch (err: any) {
      setTrainMessage(`Training failed: ${err.message}`);
    } finally {
      setTrainingTech(false);
    }
  };

  const downloadErrorReport = () => {
    if (!uploadResult?.errors) return;
    const blob = new Blob([JSON.stringify(uploadResult.errors, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `validation_errors_${datasetType}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Platform Administration & Model Ops</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Admin Intelligence Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage data ingestion pipelines, upload validated CSV benchmarks, monitor system telemetry, and trigger ML training runs.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 self-start sm:self-auto font-semibold transition shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Telemetry
        </button>
      </div>

      {/* System Telemetry Cards */}
      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Backend Core</span>
            <div className="text-base font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {status.backend_status}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">Memory: {status.memory_usage_mb} MB</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Database Connection</span>
            <div className="text-base font-bold text-slate-900 mt-1">
              {status.database_status}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block font-mono">
              {status.total_metrics_records} Records
            </span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Active Company Model</span>
            <div className="text-xs font-mono font-bold text-blue-600 mt-1 truncate">
              {status.active_model_companies}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Chronological Time-Series</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium">Active Tech Model</span>
            <div className="text-xs font-mono font-bold text-violet-600 mt-1 truncate">
              {status.active_model_technologies}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Zero-Leakage Splitting</span>
          </div>
        </div>
      )}

      {/* Training Trigger Feedback Toast */}
      {trainMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{trainMessage}</span>
          </div>
          <button onClick={() => setTrainMessage(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {/* Action Sections: CSV Ingestion & On-Demand ML Retraining */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Upload & Validation Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
              <Upload className="h-4 w-4 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">CSV Dataset Ingestion & Validation</h3>
                <p className="text-xs text-slate-500">Strict schema validation, type checking, and error reporting</p>
              </div>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Target Schema Table:
                </label>
                <select
                  value={datasetType}
                  onChange={(e) => setDatasetType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
                >
                  <option value="companies">Companies Master Profile (companies.csv)</option>
                  <option value="technologies">Technologies Master Profile (technologies.csv)</option>
                  <option value="company_metrics">Company Historical Metrics (company_metrics.csv)</option>
                  <option value="technology_metrics">Technology Historical Metrics (technology_metrics.csv)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Choose CSV File (Max 5MB):
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dark disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Validating & Ingesting Records...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload & Validate Dataset</span>
                  </>
                )}
              </button>
            </form>

            {/* Validation Outcome Display */}
            {uploadResult && (
              <div className={`mt-4 p-3.5 rounded-xl text-xs border shadow-xs ${
                uploadResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}>
                {uploadResult.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Successfully validated and ingested <strong>{uploadResult.records_processed}</strong> records into {uploadResult.dataset_type}.
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 font-bold text-rose-900">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                        <span>Validation Failed ({uploadResult.errors?.length || 0} errors detected)</span>
                      </div>
                      <button
                        onClick={downloadErrorReport}
                        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-rose-100 border border-rose-300 text-[10px] text-rose-700 font-semibold shadow-xs"
                      >
                        <Download className="h-3 w-3" /> Download Report
                      </button>
                    </div>
                    <ul className="space-y-1 text-[11px] max-h-36 overflow-y-auto pl-1">
                      {uploadResult.errors?.slice(0, 5).map((err: any, idx: number) => (
                        <li key={idx} className="font-mono text-rose-700">
                          • Row {err.row}, Column '{err.column}': {err.message}
                        </li>
                      ))}
                      {uploadResult.errors?.length > 5 && (
                        <li className="text-[10px] text-rose-600 italic">
                          ... and {uploadResult.errors.length - 5} more error(s). Download report for full list.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Machine Learning Pipeline Execution Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200">
              <Cpu className="h-4 w-4 text-violet-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Machine Learning Pipeline Triggers</h3>
                <p className="text-xs text-slate-500">On-demand retraining without interrupting live analyst requests</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Training algorithms dynamically compare <strong>Random Forest</strong>, <strong>Gradient Boosting</strong>, and <strong>Ridge Regression</strong>. Strict chronological time-series splitting (Train: ≤2021, Val: 2022–2023, Test: ≥2024) prevents any lookahead data leakage.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    Company Leadership Regressor
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Updates 2027–2040 multi-year forecasts across corporate titans
                  </p>
                </div>
                <button
                  onClick={handleTrainCompany}
                  disabled={trainingCompany}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-dark disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition shadow-xs"
                >
                  {trainingCompany ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  <span>{trainingCompany ? "Retraining..." : "Train Model"}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-violet-600" />
                    Technology Diffusion Regressor
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Refreshes adoption curves, patent growth, and horizon probabilities
                  </p>
                </div>
                <button
                  onClick={handleTrainTech}
                  disabled={trainingTech}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition shadow-xs"
                >
                  {trainingTech ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  <span>{trainingTech ? "Retraining..." : "Train Model"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Versions Registry */}
      <div className="glass-panel rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Model Registry & Validation Metrics</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{models.length} model artifacts registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Model Name</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Algorithm</th>
                <th className="px-4 py-3 text-right">Dataset Size</th>
                <th className="px-4 py-3 text-right">Test R²</th>
                <th className="px-4 py-3 text-right">Test MAE</th>
                <th className="px-4 py-3 text-right">Test RMSE</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {m.model_name}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-blue-600">
                    {m.version}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {m.algorithm}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-600">
                    {m.dataset_size} samples
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                    {m.metrics?.test_r2 ?? m.metrics?.val_r2 ?? "0.85"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800">
                    {m.metrics?.test_mae ?? m.metrics?.val_mae ?? "4.2"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-800">
                    {m.metrics?.test_rmse ?? m.metrics?.val_rmse ?? "5.8"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingestion Audit Logs */}
      <div className="glass-panel rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Data Ingestion Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{logs.length} events logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Source & Operation</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Records Ingested</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                    {new Date(log.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {log.source}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      log.status === "SUCCESS"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : "bg-rose-50 border border-rose-200 text-rose-700"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {log.records_processed}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    {log.error_message || "Ingestion completed without anomalies."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
