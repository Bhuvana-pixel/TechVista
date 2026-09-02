# TechVista — Product Walkthrough & Verification Report

**TechVista** is a production-oriented, AI-powered corporate and technology leadership intelligence platform. It evaluates companies and breakthrough technologies based on multi-indicator scoring engines and forecasts leadership trajectories across a 10–15 year horizon (**2027, 2030, 2035, and 2040**).

The entire system is engineered specifically to operate reliably within **Vercel Free Tier (Frontend)** and **Render Free Tier (Backend)** with **PostgreSQL (Neon / Supabase)**.

---

## 1. What Was Built

### A. Full-Stack System Architecture
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, and Recharts.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Scikit-Learn, Pandas, NumPy.
- **Database**: PostgreSQL with automatic SQLite fallback for rapid local offline development.
- **Cold-Start Protection**: Non-blocking `WakeUpBanner` on the frontend that gracefully pings `/api/health` and displays warm-up status during Render free-tier inactivity wakeups.

### B. Two Primary Intelligence Modules
1. **Module 1 — Company Leader Prediction**:
   - Analyzes financial velocity, operating margin, market capitalization (log-scaled), capital investments, R&D intensity, granted patents, workforce growth, technology adoption, and news sentiment.
   - Computes transparent 0–100 Leadership Scores with factor attribution and forecasts future trajectories.
2. **Module 2 — Technology Leader Prediction**:
   - Analyzes global venture funding, active patent counts, scientific publications (arXiv/OpenAlex), enterprise adoption rates, market TAM growth CAGR, active startups, and job postings.
   - Computes balanced 0–100 Technology Leadership Scores and diffusion forecasts.

### C. Machine Learning & Forecasting Pipeline
- **Zero Lookahead Data Leakage**: Enforces strict chronological time-series splitting (Train: $\le 2021$, Validation: $2022-2023$, Test: $\ge 2024$).
- **Model Tournament**: Compares **Gradient Boosting**, **Random Forest**, and **Ridge Regression**, selecting the top performer and logging metrics in the `model_versions` registry.
- **Long-Term Horizon Forecasting**: Projects scores for **2027**, **2030**, **2035**, and **2040** with asymptotic saturation dampening, expanding uncertainty bounds ($\pm\sigma$), and time-decaying confidence intervals.
- **Explainable AI (Factor Attribution)**: Decomposes score deviations into positive drivers (e.g. `R&D Growth: +8.4`) and negative headwinds (e.g. `Workforce Drag: -1.8`), synthesizing dynamic factual explanations.
- **Pre-computed Storage**: Forecasts are persisted in PostgreSQL, preventing high memory/CPU spikes during user visits on Render's 512MB RAM free tier.

### D. Verified Seed / Demo Benchmark Dataset
- **10 Corporate Titans**: Microsoft (`MSFT`), NVIDIA (`NVDA`), Apple (`AAPL`), Alphabet (`GOOGL`), Amazon (`AMZN`), Meta (`META`), AMD (`AMD`), Tesla (`TSLA`), Intel (`INTC`), Oracle (`ORCL`).
- **10 Breakthrough Technologies**: Generative AI, Artificial Intelligence, Robotics & Embodied AI, Quantum Computing, Edge Computing, Cloud Computing, Cybersecurity & Zero Trust, Autonomous Vehicles, AR/VR & Spatial Computing, 6G Connectivity.
- **11 Years of Continuous Metrics (2015–2025)** per entity.
- Representative tech news stream with NLP sentiment scores.
- Data sources registry documenting SEC EDGAR, USPTO, arXiv, and industry adoption indices.

---

## 2. Complete Page Navigation & Features

| Route | Page | Key Features |
| :--- | :--- | :--- |
| `/` | **Dashboard** | 6 KPI cards, Top Company & Tech horizontal ranking bars, Market Growth trends, Capital Deployment trends, Multi-Year Forecast comparison matrix. |
| `/companies` | **Companies Directory** | Search by name/ticker, Industry filter, card grid with leadership scores, potentials, and probabilities. |
| `/companies/[id]` | **Company Deep-Dive** | ScoreGauge, "Why this score?" FactorAttributionCard, Weighted Score Breakdown, 10–15yr Horizon Forecast Curve, Historical Financial/R&D table & chart. |
| `/technologies` | **Tech Directory** | Search, Category filter, domain cards with diffusion scores and probabilities. |
| `/technologies/[id]` | **Tech Deep-Dive** | ScoreGauge, FactorAttributionCard, Component Distribution, 10–15yr Horizon Forecast, Historical Adoption & Funding trends. |
| `/rankings` | **Rankings Leaderboard**| Tabbed Company vs Technology leaderboards, multi-column sorting, search, min score slider, and trend pills. |
| `/compare` | **Comparison Matrix** | Cohort selector (up to 4 entities), interactive multi-indicator **Radar Chart**, and side-by-side metric benchmark matrix. |
| `/forecasts` | **Scenario Simulator** | Horizon switcher (2025, 2027, 2030, 2035, 2040), uncertainty corridor area chart ($\pm\sigma$), and non-financial disclaimer. |
| `/news` | **News & Sentiment** | Real-time sentiment stream with Bullish/Positive/Cautious tags, sentiment score numbers, and company/tech associations. |
| `/data-sources` | **Data Governance** | Source provenance table, citations, URLs, verification dates, and Mode A/Mode B architecture explanation. |
| `/admin` | **Admin Console** | System telemetry, CSV dataset upload with validation error report download, on-demand ML model retraining triggers, Model versions registry, and Ingestion audit logs. |
| `/login` | **Authentication** | JWT login and registration with quick one-click demo credentials autofill. |

---

## 3. Verification & Test Results

### A. Automated Backend Test Suite (Pytest)
```
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\sanje\Desktop\Projects\TechVista

backend/tests/test_api.py::test_api_health_endpoint PASSED               [ 14%]
backend/tests/test_api.py::test_api_dashboard_and_companies PASSED       [ 28%]
backend/tests/test_ml.py::test_ml_company_training_pipeline_and_metrics PASSED [ 42%]
backend/tests/test_ml.py::test_factor_attribution_explainable_ai PASSED  [ 57%]
backend/tests/test_scoring.py::test_normalizer_clamp_and_scaling PASSED  [ 71%]
backend/tests/test_scoring.py::test_company_scoring_engine_bounds_and_breakdown PASSED [ 85%]
backend/tests/test_scoring.py::test_technology_scoring_engine_bounds_and_breakdown PASSED [100%]

======================= 7 passed in 0.39s ========================
```

### B. Production Frontend Build (Next.js 14)
```
Route (app)                              Size     First Load JS
┌ ○ /                                    6.35 kB         195 kB
├ ○ /_not-found                          887 B          85.5 kB
├ ○ /admin                               7.39 kB          92 kB
├ ○ /companies                           4.36 kB        88.9 kB
├ λ /companies/[id]                      3.06 kB         200 kB
├ ○ /compare                             10.9 kB         190 kB
├ ○ /data-sources                        4.38 kB        88.9 kB
├ ○ /forecasts                           4.97 kB         197 kB
├ ○ /login                               4.5 kB         89.1 kB
├ ○ /news                                4.09 kB        88.7 kB
├ ○ /rankings                            5.25 kB        89.8 kB
├ ○ /technologies                        4.32 kB        88.9 kB
└ λ /technologies/[id]                   2.99 kB         200 kB
+ First Load JS shared by all            84.6 kB

✓ Compiled successfully (0 TypeScript errors, 0 ESLint errors)
```

### C. Live End-to-End System Integration Test
```
=== TechVista End-to-End System Integration Test ===
[OK] Frontend Root            [200] -> <!DOCTYPE html><html lang="en" class="dark"><head><meta charSet="utf-8...
[OK] API Health               [200] -> {"status":"healthy","environment":"development","database":"connected"...
[OK] Dashboard                [200] -> {"kpis":{"companies_analyzed":10,"technologies_analyzed":10,"top_compa...
[OK] Company Detail (MSFT)    [200] -> {"id":1,"name":"Microsoft Corporation","ticker":"MSFT","industry":"Sof...
[OK] Tech Detail (GenAI)      [200] -> {"id":1,"name":"Generative AI","category":"Artificial Intelligence","d...
[OK] Company Rankings         [200] -> [{"rank":1,"id":4,"name":"Alphabet Inc.","ticker":"GOOGL","industry":"...
[OK] Tech Rankings            [200] -> [{"rank":1,"id":6,"name":"Cloud Computing","category":"Enterprise Syst...
[OK] Forecast 10-15yr         [200] -> {"entity_id":1,"entity_name":"Microsoft Corporation","entity_type":"co...
[OK] Multi-Entity Compare     [200] -> {"entities":[{"id":1,"name":"Microsoft Corporation","ticker":"MSFT","i...
[OK] News Stream              [200] -> [{"id":8,"title":"Global Edge Computing Spending Driven by Real-Time T...
[OK] Data Sources             [200] -> [{"id":1,"name":"SEC EDGAR 10-K / 10-Q Filings","source_type":"Financi...
[OK] Admin Status Telemetry   [200] -> {"backend_status":"ONLINE - HEALTHY","database_status":"CONNECTED","ac...
```
