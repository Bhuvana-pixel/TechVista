# TechVista — Production Deployment Guide

This guide provides step-by-step instructions for deploying **TechVista** using **Vercel Free Tier (Frontend)** and **Render Free Tier (Backend)** with a free cloud PostgreSQL database (**Neon** or **Supabase**).

---

## Architecture Overview

```
                 USER / CLIENT
                       │
                       ▼
                 VERCEL HOSTING
             Next.js 14 App Router
             (HTTPS, Edge CDN, Static Cache)
                       │
            REST API (HTTPS Requests)
            + Cold-Start Wake Handler
                       │
                       ▼
                 RENDER WEB SERVICE
             FastAPI + Scikit-Learn
             (Python 3.11+, 512MB RAM)
                       │
                       ▼
             NEON / SUPABASE POSTGRESQL
             (Managed Serverless PostgreSQL)
```

---

## Step 1: Push Project to GitHub

1. Initialize git repository if not already done:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of TechVista platform"
   ```
2. Create a new repository on GitHub (e.g. `techvista`).
3. Push code to the repository:
   ```bash
   git remote add origin https://github.com/your-username/techvista.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Create Free PostgreSQL Database (Neon or Supabase)

### Option A: Neon (Recommended for Serverless PostgreSQL)
1. Go to [Neon.tech](https://neon.tech) and create a free account.
2. Click **Create Project**, name it `techvista`, and choose your nearest region.
3. Once created, copy the **Connection Details (Pooled connection string)**:
   ```
   postgresql://alex:AbC123XyZ@ep-cool-night-123456-pooler.us-east-2.aws.neon.tech/techvista?sslmode=require
   ```

### Option B: Supabase
1. Go to [Supabase.com](https://supabase.com) and create a free project.
2. Under **Project Settings > Database**, copy the **URI connection string**.

---

## Step 3: Configure & Deploy Backend on Render

1. Go to [Render.com](https://render.com) and sign in.
2. Click **New + > Web Service**.
3. Connect your GitHub repository `techvista`.
4. Configure the service settings:
   - **Name:** `techvista-backend`
   - **Region:** Choose Oregon or Frankfurt (closest to your DB).
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`

---

## Step 4: Configure Backend Environment Variables on Render

Under the **Environment** tab on Render, add the following variables:

| Variable Key | Example Value | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `production` | Enables production security & logging |
| `DEBUG` | `False` | Disables debug stack traces |
| `DATABASE_URL` | `postgresql+psycopg2://...` | Connection string from Neon or Supabase |
| `JWT_SECRET` | `generate-random-32-char-secret-key` | Random cryptographic secret for auth tokens |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | Token expiration (24 hours) |
| `ALLOWED_ORIGINS` | `https://techvista.vercel.app` | Allowed CORS origins (updated in Step 10) |

---

## Step 5: Run Database Seed & Initialization

Render allows running commands via the **Shell** tab once deployed:
1. Open the **Shell** in your Render service dashboard.
2. Run the seed script:
   ```bash
   python scripts/seed_data.py
   ```
3. This creates all tables, seeds 10 corporate leaders, 10 emerging technologies, 11 years of metrics, trains baseline models, and stores pre-computed 2027–2040 forecasts.

---

## Step 6: Copy Render API URL

Once deployed and healthy, copy the assigned HTTPS service URL:
```
https://techvista-backend.onrender.com
```

---

## Step 7: Configure Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) and log in.
2. Click **Add New > Project**.
3. Import your GitHub repository `techvista`.
4. Set the project configuration:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Edit and set to `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

---

## Step 8: Set Vercel Environment Variables

Under **Environment Variables** in Vercel:

| Key | Value |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://techvista-backend.onrender.com` |

---

## Step 9: Deploy Next.js on Vercel

Click **Deploy**. Vercel will build the TypeScript project, optimize static assets, and assign your live production domain:
```
https://techvista.vercel.app
```

---

## Step 10: Update Backend CORS with Live Vercel URL

1. Return to **Render > techvista-backend > Environment**.
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,https://techvista.vercel.app
   ```
3. Save changes. Render will automatically re-deploy with updated CORS origins.

---

## Step 11: Validate Production Endpoints

1. Test Backend Health:
   ```bash
   curl -s https://techvista-backend.onrender.com/api/health
   # Expected response: {"status":"healthy","environment":"production","database":"connected"}
   ```
2. Test OpenAPI Documentation:
   Visit `https://techvista-backend.onrender.com/docs` to test all interactive REST endpoints.
3. Open Frontend Application:
   Visit `https://techvista.vercel.app` and verify dashboard KPIs, rankings, radar charts, and forecasting scenario simulator.

---

## Free-Tier Constraints & Mitigations

### 1. Render Sleep / Cold-Start Handling (Inactivity Spindown)
- **Constraint:** Render Free Tier spins down web services after 15 minutes of inactivity. The first request may take 30–50 seconds to respond.
- **Mitigation:** TechVista implements a non-blocking `WakeUpBanner` component on the frontend that gracefully informs the user that the engine is spinning up and auto-retries, preventing the UI from appearing broken.

### 2. Memory Limits (512MB RAM)
- **Constraint:** Free tier containers have 512MB RAM.
- **Mitigation:** We utilize lightweight `scikit-learn` Gradient Boosting / Random Forest regressors (model weights < 5MB) rather than heavy PyTorch / TensorFlow networks.
- **Pre-computed Storage:** All forecasts (2027, 2030, 2035, 2040) are pre-computed and stored in PostgreSQL, eliminating dynamic on-the-fly model inference during page loads.
