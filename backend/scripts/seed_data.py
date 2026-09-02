import os
import sys
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base, engine, SessionLocal
from app.models.entities import (
    User, Company, CompanyMetric, Technology, TechnologyMetric,
    Prediction, ModelVersion, News, DataSource, IngestionLog
)
from app.services.auth_service import get_password_hash
from app.services.scoring import ScoringEngine
from app.services.forecasting import generate_entity_forecast
from app.ml.pipeline import MLPipeline

def seed_database():
    print("--- Initializing TechVista Relational Database Schema ---")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Check if already seeded
    if db.query(Company).count() > 0:
        print("Database already contains data. Skipping re-seed.")
        db.close()
        return

    print("--- Seeding Admin and Demo Users ---")
    admin_user = User(
        name="Admin User",
        email="admin@techvista.ai",
        password_hash=get_password_hash("AdminPass123!"),
        role="admin"
    )
    demo_user = User(
        name="Demo Analyst",
        email="analyst@techvista.ai",
        password_hash=get_password_hash("Analyst123!"),
        role="user"
    )
    db.add_all([admin_user, demo_user])
    db.commit()

    print("--- Seeding Data Sources Transparency ---")
    sources = [
        DataSource(name="SEC EDGAR 10-K / 10-Q Filings", source_type="Financial", source_url="https://www.sec.gov/edgar", status="Active"),
        DataSource(name="USPTO & WIPO Patent Registries", source_type="Patents", source_url="https://patents.google.com", status="Active"),
        DataSource(name="arXiv & OpenAlex Scientific Publications", source_type="Research", source_url="https://arxiv.org", status="Active"),
        DataSource(name="Enterprise Tech Adoption Index", source_type="Adoption", source_url="https://techvista.ai/sources/adoption", status="Demo Mode"),
        DataSource(name="Global Financial News & NLP Sentiment Stream", source_type="News & Sentiment", source_url="https://techvista.ai/sources/news", status="Demo Mode"),
    ]
    db.add_all(sources)
    db.commit()

    print("--- Seeding 10 Tech Leaders (Companies) ---")
    companies_data = [
        {
            "name": "Microsoft Corporation", "ticker": "MSFT", "industry": "Software & Cloud", "sector": "Information Technology",
            "country": "United States", "website": "https://www.microsoft.com", "logo_url": "https://images.unsplash.com/photo-1633409381658-a0c36b447445?w=128&auto=format&fit=crop&q=60",
            "description": "Global leader in enterprise cloud computing (Azure), enterprise productivity software, and frontier AI investments via OpenAI collaboration."
        },
        {
            "name": "NVIDIA Corporation", "ticker": "NVDA", "industry": "Semiconductors & AI", "sector": "Information Technology",
            "country": "United States", "website": "https://www.nvidia.com", "logo_url": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=128&auto=format&fit=crop&q=60",
            "description": "Dominant pioneer in GPU accelerated computing, CUDA parallel computing architecture, and generative AI data center infrastructure."
        },
        {
            "name": "Apple Inc.", "ticker": "AAPL", "industry": "Consumer Tech & Hardware", "sector": "Consumer Electronics",
            "country": "United States", "website": "https://www.apple.com", "logo_url": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=128&auto=format&fit=crop&q=60",
            "description": "Global consumer electronics powerhouse commanding premium market share across mobile hardware, Apple Silicon chips, and privacy-centric edge AI."
        },
        {
            "name": "Alphabet Inc.", "ticker": "GOOGL", "industry": "Internet & AI Research", "sector": "Communication Services",
            "country": "United States", "website": "https://abc.xyz", "logo_url": "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=60",
            "description": "Parent company of Google and Google DeepMind, pioneering frontier foundational models (Gemini), Google Cloud, and global web search ecosystems."
        },
        {
            "name": "Amazon.com Inc.", "ticker": "AMZN", "industry": "Cloud & E-Commerce", "sector": "Consumer Discretionary",
            "country": "United States", "website": "https://www.amazon.com", "logo_url": "https://images.unsplash.com/photo-1523474255658-4af61b1e32ff?w=128&auto=format&fit=crop&q=60",
            "description": "World-leading cloud infrastructure provider (AWS), global e-commerce logistical network, and generative AI bedrock platforms."
        },
        {
            "name": "Meta Platforms Inc.", "ticker": "META", "industry": "Social Media & Open AI", "sector": "Communication Services",
            "country": "United States", "website": "https://about.meta.com", "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=60",
            "description": "Pioneering open-weights AI models (Llama family), digital social metaverse infrastructure, and high-performance AI custom silicon."
        },
        {
            "name": "Advanced Micro Devices", "ticker": "AMD", "industry": "Semiconductors", "sector": "Information Technology",
            "country": "United States", "website": "https://www.amd.com", "logo_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=128&auto=format&fit=crop&q=60",
            "description": "High-performance data center accelerator manufacturer (Instinct MI300 series) and premier CPU/GPU architecture designer."
        },
        {
            "name": "Tesla Inc.", "ticker": "TSLA", "industry": "Automotive & Robotics", "sector": "Automotive & Energy",
            "country": "United States", "website": "https://www.tesla.com", "logo_url": "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=128&auto=format&fit=crop&q=60",
            "description": "Pioneer in electric vehicles, Full Self-Driving vision neural networks, humanoid robotics (Optimus), and distributed energy storage."
        },
        {
            "name": "Intel Corporation", "ticker": "INTC", "industry": "Semiconductors & Foundry", "sector": "Information Technology",
            "country": "United States", "website": "https://www.intel.com", "logo_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=128&auto=format&fit=crop&q=60",
            "description": "Legacy microchip designer and foundry pioneer executing high-NA EUV semiconductor manufacturing modernization."
        },
        {
            "name": "Oracle Corporation", "ticker": "ORCL", "industry": "Enterprise Cloud & DB", "sector": "Information Technology",
            "country": "United States", "website": "https://www.oracle.com", "logo_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&auto=format&fit=crop&q=60",
            "description": "Enterprise cloud database provider expanding high-density AI supercluster hosting (OCI) and autonomous database systems."
        }
    ]

    company_objs = {}
    for c_data in companies_data:
        c = Company(**c_data)
        db.add(c)
        db.flush()
        company_objs[c.ticker] = c

    print("--- Seeding 10 Key Emerging Technologies ---")
    technologies_data = [
        {"name": "Generative AI", "category": "Artificial Intelligence", "description": "Large foundational models transforming text, video, software synthesis, and multi-modal creative production.", "website": "https://techvista.ai/tech/genai"},
        {"name": "Artificial Intelligence", "category": "Core Computing", "description": "Broad AI encompassing machine learning, deep neural networks, reinforcement learning, and autonomous reasoning systems.", "website": "https://techvista.ai/tech/ai"},
        {"name": "Robotics & Embodied AI", "category": "Automation", "description": "Humanoid robots and physical automation systems integrating multi-modal perception with end-to-end motor control.", "website": "https://techvista.ai/tech/robotics"},
        {"name": "Quantum Computing", "category": "Frontier Physics", "description": "Superconducting and ion-trap quantum hardware solving complex combinatorial optimization, cryptography, and molecular simulation.", "website": "https://techvista.ai/tech/quantum"},
        {"name": "Edge Computing", "category": "Infrastructure", "description": "Decentralized computing architecture processing low-latency inferencing at device perimeter nodes.", "website": "https://techvista.ai/tech/edge"},
        {"name": "Cloud Computing", "category": "Enterprise Systems", "description": "Hyperscale distributed infrastructure providing elastic compute, serverless frameworks, and high-performance clusters.", "website": "https://techvista.ai/tech/cloud"},
        {"name": "Cybersecurity & Zero Trust", "category": "Security", "description": "AI-driven defensive telemetry, automated anomaly mitigation, and post-quantum cryptographic standards.", "website": "https://techvista.ai/tech/cyber"},
        {"name": "Autonomous Vehicles", "category": "Transportation", "description": "Level 4 and Level 5 autonomous driving stacks driven by vision end-to-end foundation models.", "website": "https://techvista.ai/tech/av"},
        {"name": "AR / VR & Spatial Computing", "category": "Human-Machine Interface", "description": "High-fidelity pass-through headsets, spatial audio, and neural interfaces bridging physical and synthetic environments.", "website": "https://techvista.ai/tech/spatial"},
        {"name": "6G & Next-Gen Connectivity", "category": "Telecommunications", "description": "Terahertz-band telecommunications featuring integrated sensing, microsecond latency, and satellite mesh networking.", "website": "https://techvista.ai/tech/6g"},
    ]

    tech_objs = {}
    for t_data in technologies_data:
        t = Technology(**t_data)
        db.add(t)
        db.flush()
        tech_objs[t.name] = t

    db.commit()

    print("--- Seeding Historical Metrics (2015-2025) for Companies ---")
    # Base profiles for realistic time series generation
    company_profiles = {
        "MSFT": {"rev_base": 93.5, "growth": 14.5, "margin": 36.0, "mcap_base": 380.0, "mcap_growth": 23.0, "rd_base": 12.0, "patents_base": 2400, "emp_base": 118000, "tech_adopt": 88.0, "sentiment": 0.82},
        "NVDA": {"rev_base": 5.0, "growth": 38.0, "margin": 45.0, "mcap_base": 18.0, "mcap_growth": 52.0, "rd_base": 1.3, "patents_base": 700, "emp_base": 9200, "tech_adopt": 94.0, "sentiment": 0.91},
        "AAPL": {"rev_base": 233.7, "growth": 7.5, "margin": 25.0, "mcap_base": 590.0, "mcap_growth": 18.0, "rd_base": 8.0, "patents_base": 2100, "emp_base": 110000, "tech_adopt": 85.0, "sentiment": 0.74},
        "GOOGL": {"rev_base": 74.9, "growth": 18.0, "margin": 26.0, "mcap_base": 520.0, "mcap_growth": 19.5, "rd_base": 12.2, "patents_base": 2800, "emp_base": 61000, "tech_adopt": 91.0, "sentiment": 0.79},
        "AMZN": {"rev_base": 107.0, "growth": 22.0, "margin": 6.5, "mcap_base": 310.0, "mcap_growth": 21.0, "rd_base": 12.5, "patents_base": 1900, "emp_base": 230000, "tech_adopt": 89.0, "sentiment": 0.77},
        "META": {"rev_base": 17.9, "growth": 24.0, "margin": 32.0, "mcap_base": 300.0, "mcap_growth": 20.0, "rd_base": 4.8, "patents_base": 950, "emp_base": 12600, "tech_adopt": 86.0, "sentiment": 0.68},
        "AMD": {"rev_base": 3.9, "growth": 21.0, "margin": 14.0, "mcap_base": 2.5, "mcap_growth": 45.0, "rd_base": 0.9, "patents_base": 420, "emp_base": 8200, "tech_adopt": 82.0, "sentiment": 0.76},
        "TSLA": {"rev_base": 4.0, "growth": 42.0, "margin": 12.0, "mcap_base": 30.0, "mcap_growth": 35.0, "rd_base": 0.7, "patents_base": 280, "emp_base": 13000, "tech_adopt": 87.0, "sentiment": 0.71},
        "INTC": {"rev_base": 55.3, "growth": 0.5, "margin": 18.0, "mcap_base": 160.0, "mcap_growth": -2.0, "rd_base": 12.1, "patents_base": 3100, "emp_base": 107000, "tech_adopt": 65.0, "sentiment": 0.28},
        "ORCL": {"rev_base": 38.2, "growth": 6.0, "margin": 28.0, "mcap_base": 150.0, "mcap_growth": 14.0, "rd_base": 5.8, "patents_base": 1200, "emp_base": 132000, "tech_adopt": 78.0, "sentiment": 0.70},
    }

    all_company_metric_records = []
    years = list(range(2015, 2026))

    for ticker, comp in company_objs.items():
        prof = company_profiles[ticker]
        rev = prof["rev_base"]
        mcap = prof["mcap_base"]
        rd = prof["rd_base"]
        patents = prof["patents_base"]
        emp = prof["emp_base"]

        for idx, yr in enumerate(years):
            # Compound progression with realistic noise
            noise = (idx % 3 - 1) * 0.04
            annual_rev_growth = round(prof["growth"] * (1.0 + noise), 1)
            rev = round(rev * (1.0 + annual_rev_growth / 100.0), 2)
            margin = round(prof["margin"] + (idx * 0.4) + noise * 10, 1)
            profit = round(rev * (margin / 100.0), 2)

            annual_mcap_growth = round(prof["mcap_growth"] * (1.0 + noise * 1.5), 1)
            mcap = round(max(5.0, mcap * (1.0 + annual_mcap_growth / 100.0)), 2)

            rd = round(rd * (1.0 + (annual_rev_growth * 0.8) / 100.0), 2)
            investment = round(rd * 0.65, 2)
            patents = int(patents * (1.0 + 0.06 + noise * 0.03))
            emp = int(emp * (1.0 + 0.08 + noise * 0.02))
            emp_growth = round(8.0 + noise * 4.0, 1)
            mkt_share = round(min(55.0, 12.0 + idx * 1.2), 1)
            tech_adopt = round(min(98.0, prof["tech_adopt"] + idx * 0.8), 1)
            sentiment = round(np.clip(prof["sentiment"] + noise * 0.15, -0.6, 0.95), 2)
            innov_score = round(min(99.0, 60.0 + idx * 2.8 + noise * 8), 1)

            metric = CompanyMetric(
                company_id=comp.id,
                year=yr,
                revenue=rev,
                revenue_growth=annual_rev_growth,
                profit=profit,
                profit_margin=margin,
                market_cap=mcap,
                stock_growth=annual_mcap_growth,
                rd_spending=rd,
                investment=investment,
                patents=patents,
                employees=emp,
                employee_growth=emp_growth,
                market_share=mkt_share,
                technology_adoption=tech_adopt,
                sentiment_score=sentiment,
                innovation_score=innov_score
            )
            db.add(metric)
            all_company_metric_records.append({
                "company_id": comp.id,
                "ticker": ticker,
                "year": yr,
                "revenue": rev,
                "revenue_growth": annual_rev_growth,
                "profit": profit,
                "profit_margin": margin,
                "market_cap": mcap,
                "stock_growth": annual_mcap_growth,
                "rd_spending": rd,
                "investment": investment,
                "patents": patents,
                "employees": emp,
                "employee_growth": emp_growth,
                "market_share": mkt_share,
                "technology_adoption": tech_adopt,
                "sentiment_score": sentiment,
                "innovation_score": innov_score
            })

    db.commit()

    print("--- Seeding Historical Metrics (2015-2025) for Technologies ---")
    tech_profiles = {
        "Generative AI": {"inv_base": 3.2, "growth": 48.0, "patents": 850, "papers": 1200, "adopt": 12.0, "market": 8.0, "startups": 210, "jobs": 15},
        "Artificial Intelligence": {"inv_base": 18.0, "growth": 28.0, "patents": 12000, "papers": 18000, "adopt": 45.0, "market": 65.0, "startups": 1500, "jobs": 90},
        "Robotics & Embodied AI": {"inv_base": 8.5, "growth": 22.0, "patents": 4200, "papers": 3100, "adopt": 24.0, "market": 32.0, "startups": 430, "jobs": 35},
        "Quantum Computing": {"inv_base": 1.1, "growth": 34.0, "patents": 620, "papers": 2400, "adopt": 4.0, "market": 1.2, "startups": 110, "jobs": 8},
        "Edge Computing": {"inv_base": 4.5, "growth": 26.0, "patents": 3100, "papers": 2800, "adopt": 32.0, "market": 16.0, "startups": 320, "jobs": 42},
        "Cloud Computing": {"inv_base": 42.0, "growth": 19.0, "patents": 24000, "papers": 14000, "adopt": 78.0, "market": 180.0, "startups": 2200, "jobs": 190},
        "Cybersecurity & Zero Trust": {"inv_base": 12.0, "growth": 16.0, "patents": 7800, "papers": 4200, "adopt": 62.0, "market": 95.0, "startups": 890, "jobs": 115},
        "Autonomous Vehicles": {"inv_base": 6.8, "growth": 21.0, "patents": 5400, "papers": 3800, "adopt": 16.0, "market": 28.0, "startups": 280, "jobs": 28},
        "AR / VR & Spatial Computing": {"inv_base": 5.2, "growth": 18.0, "patents": 4800, "papers": 2900, "adopt": 18.0, "market": 14.0, "startups": 340, "jobs": 24},
        "6G & Next-Gen Connectivity": {"inv_base": 1.8, "growth": 31.0, "patents": 1200, "papers": 2100, "adopt": 2.0, "market": 3.0, "startups": 75, "jobs": 12},
    }

    all_tech_metric_records = []
    for tech_name, tech in tech_objs.items():
        prof = tech_profiles[tech_name]
        inv = prof["inv_base"]
        patents = prof["patents"]
        papers = prof["papers"]
        adopt = prof["adopt"]
        market = prof["market"]
        startups = prof["startups"]
        jobs = prof["jobs"]

        for idx, yr in enumerate(years):
            noise = (idx % 2 - 0.5) * 0.05
            annual_growth = round(prof["growth"] * (1.0 + noise), 1)
            inv = round(inv * (1.0 + annual_growth / 100.0), 2)
            patents = int(patents * (1.0 + 0.12 + noise * 0.04))
            papers = int(papers * (1.0 + 0.10 + noise * 0.03))
            adopt = round(min(92.0, adopt + (idx * 2.5) + noise * 2), 1)
            market = round(market * (1.0 + (annual_growth * 0.75) / 100.0), 2)
            startups = int(startups * (1.0 + 0.09 + noise * 0.03))
            jobs = int(jobs * (1.0 + 0.11 + noise * 0.03))
            interest = round(min(98.0, 45.0 + idx * 4.5 + noise * 10), 1)
            sentiment = round(np.clip(0.65 + noise * 0.2, -0.4, 0.95), 2)
            innov_score = round(min(99.0, 52.0 + idx * 3.8 + noise * 6), 1)

            t_metric = TechnologyMetric(
                technology_id=tech.id,
                year=yr,
                investment=inv,
                patent_count=patents,
                research_papers=papers,
                adoption_rate=adopt,
                market_size=market,
                market_growth=annual_growth,
                startup_count=startups,
                job_postings=jobs,
                industry_interest=interest,
                sentiment_score=sentiment,
                innovation_score=innov_score
            )
            db.add(t_metric)
            all_tech_metric_records.append({
                "technology_id": tech.id,
                "technology_name": tech_name,
                "year": yr,
                "investment": inv,
                "patent_count": patents,
                "research_papers": papers,
                "adoption_rate": adopt,
                "market_size": market,
                "market_growth": annual_growth,
                "startup_count": startups,
                "job_postings": jobs,
                "industry_interest": interest,
                "sentiment_score": sentiment,
                "innovation_score": innov_score
            })

    db.commit()

    print("--- Seeding Representative Tech News Stream with NLP Sentiment ---")
    news_items = [
        {"title": "NVIDIA Blackwell GPUs Surpass Hyperscaler Production Yield Expectations", "source": "Bloomberg Technology", "sentiment": "Bullish", "sentiment_score": 0.91, "ticker": "NVDA", "tech": "Generative AI"},
        {"title": "Microsoft Copilot Crosses 100M Enterprise Daily Active Users", "source": "Wall Street Journal", "sentiment": "Bullish", "sentiment_score": 0.85, "ticker": "MSFT", "tech": "Cloud Computing"},
        {"title": "Alphabet Unveils Frontier Multi-Modal Reasoning Engine Gemini 2.5", "source": "Reuters", "sentiment": "Bullish", "sentiment_score": 0.88, "ticker": "GOOGL", "tech": "Artificial Intelligence"},
        {"title": "Amazon AWS Secures Multi-Billion Custom Silicon AI Supercomputing Contract", "source": "Financial Times", "sentiment": "Bullish", "sentiment_score": 0.82, "ticker": "AMZN", "tech": "Cloud Computing"},
        {"title": "Meta Open-Sources High-Parameter Llama Foundation Model for Enterprise", "source": "Ars Technica", "sentiment": "Bullish", "sentiment_score": 0.79, "ticker": "META", "tech": "Generative AI"},
        {"title": "Quantum Computing Reaches 1,000 Logical Qubit Error Mitigation Milestone", "source": "MIT Tech Review", "sentiment": "Positive", "sentiment_score": 0.74, "ticker": None, "tech": "Quantum Computing"},
        {"title": "Humanoid Robotics Accelerate Auto Manufacturing Floor Deployments", "source": "TechCrunch", "sentiment": "Positive", "sentiment_score": 0.71, "ticker": "TSLA", "tech": "Robotics & Embodied AI"},
        {"title": "Global Edge Computing Spending Driven by Real-Time Telemetry and Vision Systems", "source": "Gartner Research", "sentiment": "Positive", "sentiment_score": 0.68, "ticker": None, "tech": "Edge Computing"},
        {"title": "Zero-Trust Cybersecurity Framework Mandates Expand Across Transatlantic Enterprises", "source": "Dark Reading", "sentiment": "Positive", "sentiment_score": 0.65, "ticker": None, "tech": "Cybersecurity & Zero Trust"},
        {"title": "Semiconductor Foundry Lead Times Face Tight Packaging Capacity Constraints", "source": "Nikkei Asia", "sentiment": "Cautious", "sentiment_score": -0.22, "ticker": "INTC", "tech": "Artificial Intelligence"},
    ]

    for n in news_items:
        c_id = company_objs[n["ticker"]].id if n.get("ticker") else None
        t_id = tech_objs[n["tech"]].id if n.get("tech") else None
        news_obj = News(
            company_id=c_id,
            technology_id=t_id,
            title=n["title"],
            source=n["source"],
            url=f"https://techvista.ai/news/{n['source'].lower().replace(' ', '-')}",
            published_at=datetime.utcnow() - timedelta(days=np.random.randint(1, 14)),
            sentiment=n["sentiment"],
            sentiment_score=n["sentiment_score"]
        )
        db.add(news_obj)

    db.commit()

    print("--- Training Initial ML Models (Zero Data Leakage Chronological Split) ---")
    df_comp = pd.DataFrame(all_company_metric_records)
    comp_train_result = MLPipeline.train_company_model(df_comp)

    comp_model_ver = ModelVersion(
        model_name=comp_train_result["model_name"],
        version=comp_train_result["version"],
        algorithm=comp_train_result["algorithm"],
        dataset_size=comp_train_result["dataset_size"],
        features=json.dumps(comp_train_result["features"]),
        metrics=json.dumps(comp_train_result["metrics"]),
        status="active"
    )
    db.add(comp_model_ver)

    df_tech = pd.DataFrame(all_tech_metric_records)
    tech_train_result = MLPipeline.train_technology_model(df_tech)

    tech_model_ver = ModelVersion(
        model_name=tech_train_result["model_name"],
        version=tech_train_result["version"],
        algorithm=tech_train_result["algorithm"],
        dataset_size=tech_train_result["dataset_size"],
        features=json.dumps(tech_train_result["features"]),
        metrics=json.dumps(tech_train_result["metrics"]),
        status="active"
    )
    db.add(tech_model_ver)
    db.commit()

    print("--- Pre-computing and Storing Multi-Year Predictions (2027, 2030, 2035, 2040) ---")
    # For Companies
    for ticker, comp in company_objs.items():
        comp_records = [r for r in all_company_metric_records if r["company_id"] == comp.id]
        comp_records.sort(key=lambda x: x["year"])
        hist_scores = []
        for r in comp_records:
            sc = ScoringEngine.calculate_company_score(r)
            hist_scores.append((r["year"], sc["leadership_score"]))

        latest_rec = comp_records[-1]
        feat_dict = {
            "revenue_growth": latest_rec["revenue_growth"],
            "profit_margin": latest_rec["profit_margin"],
            "rd_intensity": (latest_rec["rd_spending"] / max(latest_rec["revenue"], 0.1)) * 100.0,
            "investment_intensity": (latest_rec["investment"] / max(latest_rec["revenue"], 0.1)) * 100.0,
            "employee_growth": latest_rec["employee_growth"],
            "market_share": latest_rec["market_share"],
            "technology_adoption": latest_rec["technology_adoption"],
            "sentiment_score": latest_rec["sentiment_score"],
            "patent_intensity": latest_rec["patents"] / max(latest_rec["rd_spending"], 0.5)
        }

        forecast_data = generate_entity_forecast(
            entity_id=comp.id,
            entity_name=comp.name,
            entity_type="company",
            historical_scores=hist_scores,
            latest_features=feat_dict,
            baseline_features=comp_train_result["baseline_means"],
            feature_importances=comp_train_result["feature_importances"],
            model_version=comp_train_result["version"]
        )

        for fc in forecast_data["forecasts"]:
            pred = Prediction(
                entity_type="company",
                entity_id=comp.id,
                prediction_year=fc["year"],
                leadership_score=fc["leadership_score"],
                future_potential=fc["future_potential"],
                probability=fc["probability"],
                confidence=fc["confidence"],
                factor_contributions=json.dumps({
                    "positive": fc["positive_factors"],
                    "negative": fc["negative_factors"]
                }),
                explanation=fc["explanation"],
                model_version=comp_train_result["version"]
            )
            db.add(pred)

    # For Technologies
    for tech_name, tech in tech_objs.items():
        tech_records = [r for r in all_tech_metric_records if r["technology_id"] == tech.id]
        tech_records.sort(key=lambda x: x["year"])
        hist_scores = []
        for r in tech_records:
            sc = ScoringEngine.calculate_technology_score(r)
            hist_scores.append((r["year"], sc["leadership_score"]))

        latest_rec = tech_records[-1]
        feat_dict = {
            "investment": latest_rec["investment"],
            "patent_growth": 14.5,
            "research_growth": 12.0,
            "adoption_rate": latest_rec["adoption_rate"],
            "market_growth": latest_rec["market_growth"],
            "startup_count": latest_rec["startup_count"],
            "job_postings": latest_rec["job_postings"],
            "industry_interest": latest_rec["industry_interest"],
            "sentiment_score": latest_rec["sentiment_score"]
        }

        forecast_data = generate_entity_forecast(
            entity_id=tech.id,
            entity_name=tech.name,
            entity_type="technology",
            historical_scores=hist_scores,
            latest_features=feat_dict,
            baseline_features=tech_train_result["baseline_means"],
            feature_importances=tech_train_result["feature_importances"],
            model_version=tech_train_result["version"]
        )

        for fc in forecast_data["forecasts"]:
            pred = Prediction(
                entity_type="technology",
                entity_id=tech.id,
                prediction_year=fc["year"],
                leadership_score=fc["leadership_score"],
                future_potential=fc["future_potential"],
                probability=fc["probability"],
                confidence=fc["confidence"],
                factor_contributions=json.dumps({
                    "positive": fc["positive_factors"],
                    "negative": fc["negative_factors"]
                }),
                explanation=fc["explanation"],
                model_version=tech_train_result["version"]
            )
            db.add(pred)

    # Record Ingestion Log
    ingest_log = IngestionLog(
        source="TechVista Verified Master Seed Dataset (Demo Mode)",
        status="SUCCESS",
        records_processed=len(all_company_metric_records) + len(all_tech_metric_records),
        started_at=datetime.utcnow() - timedelta(seconds=12),
        completed_at=datetime.utcnow()
    )
    db.add(ingest_log)
    db.commit()

    # Save CSV files to root /data directory for user convenience
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
    os.makedirs(data_dir, exist_ok=True)
    pd.DataFrame(companies_data).to_csv(os.path.join(data_dir, "companies.csv"), index=False)
    pd.DataFrame(technologies_data).to_csv(os.path.join(data_dir, "technologies.csv"), index=False)
    pd.DataFrame(all_company_metric_records).to_csv(os.path.join(data_dir, "company_metrics.csv"), index=False)
    pd.DataFrame(all_tech_metric_records).to_csv(os.path.join(data_dir, "technology_metrics.csv"), index=False)

    print(f"Successfully seeded database and exported CSV datasets to {data_dir}!")
    db.close()

if __name__ == "__main__":
    seed_database()
