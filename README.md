# TechVista — AI-Powered Company & Technology Leadership Platform

> **See the Technology Leaders of Tomorrow.**

TechVista is an enterprise-grade technology intelligence platform that evaluates companies and emerging technological paradigms across multidimensional indicators and forecasts future leadership potential over a 10–15 year horizon (2027–2040).

The system is engineered to operate on **Vercel Free Tier (Frontend)** and **Render Free Tier (Backend)** connected to a free PostgreSQL database (**Neon** or **Supabase**), with zero reliance on paid APIs, GPU clusters, Kafka, Celery, or Redis.

---

## Key Highlights

- **Dual-Domain Analytics**:
  - **Module 1 — Company Leader Prediction**: Evaluates multinational corporations across Financial Strength (20%), Market Position (15%), Capital Investment (15%), R&D Deployment (15%), Innovation Velocity (15%), Workforce Expansion (10%), and Sentiment (10%).
  - **Module 2 — Technology Leader Prediction**: Evaluates breakthrough domains across Investment (20%), Innovation & Patents (20%), Enterprise Adoption (20%), Market TAM Growth (20%), and Ecosystem Interest (20%).
- **Machine Learning & Time-Series Forecasting**:
  - Compares Gradient Boosting, Random Forest, and Ridge Regression models.
  - Chronological time-series splitting strictly eliminates lookahead data leakage.
  - Generates multi-year scenario forecasts for **2027**, **2030**, **2035**, and **2040** with upper/lower bounds ($\pm\sigma$) and confidence indicators.
- **Explainable AI (Factor Attribution)**:
  - Deconstructs leadership scores into positive drivers (`+8.4 R&D Growth`) and negative drags (`-1.8 Workforce Growth`).
  - Synthesizes dynamic, empirical explanations directly from model features.
- **Render Free Tier Cold-Start Shield**:
  - Non-blocking wake-up banner alerts analysts if the backend is cold-starting from inactivity, automatically retrying so the application never appears broken.
- **Admin Console & CSV Ingestion**:
  - Comprehensive CSV validator for companies, technologies, and metric time-series with instant validation error report downloads.
  - On-demand model retraining triggers with real-time progress and registry logging.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts |
| **Backend** | Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Joblib |
| **Machine Learning** | Scikit-Learn (Gradient Boosting, Random Forest, Ridge), NumPy, Pandas |
| **Database** | PostgreSQL (Neon / Supabase / Render), SQLite auto-fallback for local development |
| **Deployment** | Vercel Free Tier (Frontend) + Render Free Tier (Backend Web Service) |

---

## Repository Structure

```
TechVista/
├── frontend/                     # Next.js 14 App Router application
│   ├── app/                      # App router pages:
│   │   ├── page.tsx              # Main Leadership Dashboard
│   │   ├── companies/            # Company Catalog & Deep-Dive Profile
│   │   ├── technologies/         # Technology Catalog & Deep-Dive Profile
│   │   ├── rankings/             # Filterable Rankings & Leaderboards
│   │   ├── compare/              # 4-Entity Cohort Comparison & Radar
│   │   ├── forecasts/            # 2027–2040 Horizon Scenario Simulator
│   │   ├── news/                 # News & NLP Sentiment Stream
│   │   ├── data-sources/         # Data Governance & Citations
│   │   ├── admin/                # Admin Console, CSV Upload & ML Training
│   │   └── login/                # Analyst & Admin Authentication
│   ├── components/               # Score gauges, explainable cards, charts, nav
│   ├── lib/                      # API client and TypeScript interfaces
│   └── package.json
│
├── backend/                      # FastAPI Python REST API & ML Engine
│   ├── app/
│   │   ├── main.py               # Application entrypoint & CORS middleware
│   │   ├── config.py             # Settings & database resolution
│   │   ├── database.py           # Connection engine & pool management
│   │   ├── models/               # SQLAlchemy relational entities
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── routers/              # Modular REST endpoint routes
│   │   ├── services/             # Scoring engines & forecasting logic
│   │   ├── ml/                   # ML tournament, features & explainability
│   │   └── utils/                # CSV validators & normalization utilities
│   ├── scripts/                  # Standalone seed and training scripts
│   ├── tests/                    # Pytest test suite (scoring, ML, API)
│   └── requirements.txt
│
├── data/                         # CSV templates & seed data files
├── docs/                         # Deployment & Architecture guides
├── render.yaml                   # Render deployment blueprint
├── vercel.json                   # Vercel deployment blueprint
├── .env.example                  # Environment configuration template
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run initial database seed & model initialization
python scripts/seed_data.py

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
FastAPI documentation will be accessible at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```
TechVista will be running at `http://localhost:3000`.

---

## Demo Credentials

For quick local testing and evaluation in `/login` and `/admin`:
- **Admin Account**: `admin@techvista.ai` / `AdminPass123!`
- **Analyst Account**: `analyst@techvista.ai` / `Analyst123!`

*(The login page also provides one-click autofill buttons for these credentials).*

---

## Running Automated Tests

Run the complete backend test suite:
```bash
python -m pytest backend/tests -v
```
Tests cover:
- Normalizer bounds and clamp enforcement
- Transparent multi-indicator scoring engines
- Leakage-free chronological time-series ML training
- Factor attribution & explainable AI text synthesis
- Core API routes (Health, Dashboard, Companies, Rankings, Forecasts, Compare)

---

## Deployment Instructions

Detailed step-by-step deployment instructions for **Vercel** + **Render** + **Neon/Supabase** are documented in:
👉 [docs/deployment.md](docs/deployment.md)

---

## Free-Tier Constraints & Mitigations

1. **Render Free Tier Cold Starts**:
   - Render automatically sleeps inactive services after 15 minutes. TechVista includes a non-blocking `WakeUpBanner` component on the frontend that gracefully pings `/api/health` and informs the user while the container boots.
2. **Memory Constraints (512MB RAM)**:
   - Scikit-learn Gradient Boosting and Random Forest regressors are used instead of heavy deep learning frameworks.
   - All multi-year predictions (2027, 2030, 2035, 2040) are pre-calculated and persisted in PostgreSQL, preventing high CPU/memory spikes during user visits.
3. **No Paid Dependencies**:
   - Built to run without Redis, Celery workers, Elasticsearch, or AWS paid services.
