# TechVista — Architecture & Machine Learning Methodology

TechVista is an AI-powered intelligence platform evaluating multinational technology companies and breakthrough technological domains to forecast leadership outcomes over a 10–15 year horizon (2027–2040).

---

## 1. System Architecture

```
                                USER BROWSER
                                     │
                                     ▼
                   VERCEL SERVERLESS EDGE (Next.js 14)
          ┌─────────────────────────────────────────────────────┐
          │  • React Server & Client Components                 │
          │  • Tailwind CSS Dark Theme & Responsive Glassmorphism│
          │  • Recharts / Responsive Vector Visualizations      │
          │  • Cold-Start Sleep/Wake Detection Banner           │
          └──────────────────────────┬──────────────────────────┘
                                     │  HTTPS / REST JSON
                                     ▼
                      RENDER WEB SERVICE (FastAPI)
          ┌─────────────────────────────────────────────────────┐
          │  • Pydantic v2 Request/Response Validation          │
          │  • Configurable Multi-Indicator Scoring Engine      │
          │  • Scikit-Learn Model Registry & Versioning         │
          │  • Explainable AI Factor Attribution (SHAP-aligned) │
          │  • CSV Dataset Validator & Ingestion Logger         │
          └──────────────────────────┬──────────────────────────┘
                                     │  SQLAlchemy 2.0 ORM
                                     ▼
                   POSTGRESQL DATABASE (Neon / Supabase)
          ┌─────────────────────────────────────────────────────┐
          │  • Relational Schema (Companies, Techs, Metrics)    │
          │  • Pre-computed Predictions (2027, 2030, 2035, 2040)│
          │  • Model Registry (Metrics, Versions, Features)     │
          │  • Ingestion Audit Logs & Verified Data Sources     │
          └─────────────────────────────────────────────────────┘
```

---

## 2. Multi-Indicator Scoring Engines

### A. Company Leadership Score
Normalizes raw indicators (financials, market capitalization, R&D expenditure, patents, employee headcount) into a common 0–100 scale using min-max scaling and logarithmic transforms to ensure mega-cap metrics do not disproportionately swamp growth velocity:

$$\text{Leadership Score} = \sum (w_i \times s_i)$$

| Dimension | Default Weight | Key Underlying Indicators |
| :--- | :---: | :--- |
| **Financial Strength** | 20% | Revenue Growth Rate (%) + Net Operating Profit Margin (%) |
| **Market Position** | 15% | Log-scaled Market Capitalization ($B) + Market Share (%) |
| **Capital Investment** | 15% | Absolute & Relative Capital Deployment ($B) |
| **R&D Intensity** | 15% | R&D Spending / Total Revenue Ratio (%) + Total R&D ($B) |
| **Innovation Velocity** | 15% | Annual Granted Patents + Enterprise Technology Adoption Index |
| **Workforce Expansion**| 10% | Net Employee Growth Rate (%) |
| **Market Sentiment** | 10% | NLP Sentiment Stream Score (-1.0 to +1.0 mapped to 0–100) |

Weights are fully configurable on the backend without modifying application routing.

---

### B. Technology Leadership Score
Evaluates breakthrough computing domains across structural diffusion parameters:

$$\text{Technology Score} = 0.20 \times \text{Inv} + 0.20 \times \text{Innov} + 0.20 \times \text{Adopt} + 0.20 \times \text{Growth} + 0.20 \times \text{Interest}$$

- **Investment (20%):** Global Venture Capital funding and enterprise CapEx ($B).
- **Innovation (20%):** Active global patents + Peer-reviewed academic publications (arXiv, OpenAlex).
- **Adoption Rate (20%):** Enterprise deployment penetration index (0–100%).
- **Market Growth (20%):** Total Addressable Market (TAM) CAGR % expansion.
- **Industry Interest (20%):** Active startup count + job postings demand + ecosystem sentiment.

---

## 3. Machine Learning & Forecasting Pipeline

### Prevention of Data Leakage (Chronological Splitting)
Standard random k-fold cross validation leaks future temporal trends into past training records. TechVista strictly enforces **Chronological Time-Series Splitting**:
- **Training Set:** Historical years $\le 2021$
- **Validation Set:** Horizon years $2022 - 2023$
- **Test Set:** Recent benchmark years $\ge 2024$

### Model Tournament & Selection
The pipeline trains and benchmarks multiple algorithms on identical chronological folds:
1. **Gradient Boosting Regressor** (`GradientBoostingRegressor(n_estimators=60, max_depth=3)`)
2. **Random Forest Regressor** (`RandomForestRegressor(n_estimators=50, max_depth=4)`)
3. **Ridge Regularized Regression** (`Ridge(alpha=1.0)`)

The system calculates validation **$R^2$**, **MAE**, and **RMSE**, promoting the winning algorithm to active status and logging performance in the `model_versions` table.

---

## 4. Multi-Year Horizon Forecasting & Explainable AI

### Long-Term Trajectory Horizon Modeling (2027, 2030, 2035, 2040)
Long-term forecasts decay growth momentum using an asymptotic saturation function to reflect market TAM constraints:
$$\Delta S = \text{slope} \times \Delta t \times e^{-0.04 \times \Delta t}$$
- **Uncertainty Bounds:** Margin of error ($\pm \sigma$) widens over time from $\pm 3.5$ points in 2027 to $\pm 13.2$ points in 2040.
- **Confidence Decay:** Model confidence adjusts from $\sim 88\%$ in 2027 down to $\sim 62\%$ in 2040.

### Explainable AI (Factor Attribution)
For every prediction, the platform decomposes feature deviations from peer cohort baselines into:
- **Positive Catalysts:** e.g. `R&D Intensity (+8.4 pts)`, `Revenue Growth (+7.1 pts)`
- **Negative Headwinds:** e.g. `Workforce Expansion (-1.8 pts)`
- **Dynamic Factual Explanation:** Synthesized strictly from empirical feature importances without hallucinations.
