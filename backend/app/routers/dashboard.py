from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.database import get_db
from app.models.entities import Company, CompanyMetric, Technology, TechnologyMetric, Prediction, DataSource
from app.schemas.entities import DashboardResponse, DashboardKpis, CompanyRankingItem, TechnologyRankingItem
from app.services.scoring import ScoringEngine

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard_data(db: Session = Depends(get_db)):
    companies = db.query(Company).all()
    technologies = db.query(Technology).all()

    # Calculate company scores
    comp_rankings = []
    total_comp_score = 0.0
    for c in companies:
        m = db.query(CompanyMetric).filter(CompanyMetric.company_id == c.id).order_by(CompanyMetric.year.desc()).first()
        score = 65.0
        mcap = 50.0
        growth = 12.0
        if m:
            calc = ScoringEngine.calculate_company_score(m.__dict__)
            score = calc["leadership_score"]
            mcap = m.market_cap
            growth = m.revenue_growth

        pred_2030 = db.query(Prediction).filter(
            Prediction.entity_type == "company",
            Prediction.entity_id == c.id,
            Prediction.prediction_year == 2030
        ).first()

        future_pot = pred_2030.future_potential if pred_2030 else round(score * 1.05, 1)
        prob = pred_2030.probability if pred_2030 else 0.75
        trend = "Bullish" if prob >= 0.80 else ("Neutral" if prob >= 0.55 else "Cautious")

        total_comp_score += score
        comp_rankings.append({
            "id": c.id,
            "name": c.name,
            "ticker": c.ticker,
            "industry": c.industry,
            "country": c.country,
            "leadership_score": score,
            "future_potential": future_pot,
            "probability": prob,
            "trend": trend,
            "market_cap": mcap,
            "revenue_growth": growth
        })

    comp_rankings.sort(key=lambda x: x["leadership_score"], reverse=True)
    for idx, item in enumerate(comp_rankings):
        item["rank"] = idx + 1

    # Calculate technology scores
    tech_rankings = []
    total_tech_score = 0.0
    for t in technologies:
        m = db.query(TechnologyMetric).filter(TechnologyMetric.technology_id == t.id).order_by(TechnologyMetric.year.desc()).first()
        score = 65.0
        size = 20.0
        adopt = 30.0
        if m:
            calc = ScoringEngine.calculate_technology_score(m.__dict__)
            score = calc["leadership_score"]
            size = m.market_size
            adopt = m.adoption_rate

        pred_2030 = db.query(Prediction).filter(
            Prediction.entity_type == "technology",
            Prediction.entity_id == t.id,
            Prediction.prediction_year == 2030
        ).first()

        future_pot = pred_2030.future_potential if pred_2030 else round(score * 1.08, 1)
        prob = pred_2030.probability if pred_2030 else 0.78
        trend = "Accelerating" if prob >= 0.80 else ("Stable" if prob >= 0.60 else "Emerging")

        total_tech_score += score
        tech_rankings.append({
            "id": t.id,
            "name": t.name,
            "category": t.category,
            "leadership_score": score,
            "future_potential": future_pot,
            "probability": prob,
            "trend": trend,
            "market_size": size,
            "adoption_rate": adopt
        })

    tech_rankings.sort(key=lambda x: x["leadership_score"], reverse=True)
    for idx, item in enumerate(tech_rankings):
        item["rank"] = idx + 1

    # High potential count (prob >= 0.80)
    high_pot_count = sum(1 for c in comp_rankings if c["probability"] >= 0.80) + sum(1 for t in tech_rankings if t["probability"] >= 0.80)

    avg_comp = round(total_comp_score / max(len(companies), 1), 1)
    avg_tech = round(total_tech_score / max(len(technologies), 1), 1)

    top_comp = comp_rankings[0] if comp_rankings else {"name": "N/A", "leadership_score": 0.0}
    top_tech = tech_rankings[0] if tech_rankings else {"name": "N/A", "leadership_score": 0.0}

    # Aggregate Market Growth & Investment Trends by year (2018-2025)
    years = list(range(2018, 2026))
    market_growth_trends = []
    investment_trends = []
    innovation_trends = []

    for yr in years:
        # Average revenue growth across companies for year
        comp_metrics_yr = db.query(CompanyMetric).filter(CompanyMetric.year == yr).all()
        tech_metrics_yr = db.query(TechnologyMetric).filter(TechnologyMetric.year == yr).all()

        avg_rev_growth = round(sum(m.revenue_growth for m in comp_metrics_yr) / max(len(comp_metrics_yr), 1), 1)
        avg_tech_growth = round(sum(m.market_growth for m in tech_metrics_yr) / max(len(tech_metrics_yr), 1), 1)
        total_rd = round(sum(m.rd_spending for m in comp_metrics_yr), 1)
        total_tech_inv = round(sum(m.investment for m in tech_metrics_yr), 1)
        avg_adoption = round(sum(m.adoption_rate for m in tech_metrics_yr) / max(len(tech_metrics_yr), 1), 1)
        total_patents = sum(m.patents for m in comp_metrics_yr)

        market_growth_trends.append({
            "year": yr,
            "company_growth": avg_rev_growth,
            "tech_market_growth": avg_tech_growth
        })

        investment_trends.append({
            "year": yr,
            "enterprise_rd": total_rd,
            "tech_venture_investment": total_tech_inv
        })

        innovation_trends.append({
            "year": yr,
            "adoption_rate": avg_adoption,
            "patents_count": total_patents
        })

    # Forecast comparison: top 3 companies and top 3 technologies 2025 vs 2030 vs 2040
    forecast_comp = []
    for c in comp_rankings[:3]:
        p30 = db.query(Prediction).filter(Prediction.entity_type == "company", Prediction.entity_id == c["id"], Prediction.prediction_year == 2030).first()
        p40 = db.query(Prediction).filter(Prediction.entity_type == "company", Prediction.entity_id == c["id"], Prediction.prediction_year == 2040).first()
        forecast_comp.append({
            "entity": c["ticker"],
            "type": "Company",
            "score_2025": c["leadership_score"],
            "score_2030": p30.leadership_score if p30 else round(c["leadership_score"] * 1.05, 1),
            "score_2040": p40.leadership_score if p40 else round(c["leadership_score"] * 1.08, 1),
        })

    for t in tech_rankings[:3]:
        p30 = db.query(Prediction).filter(Prediction.entity_type == "technology", Prediction.entity_id == t["id"], Prediction.prediction_year == 2030).first()
        p40 = db.query(Prediction).filter(Prediction.entity_type == "technology", Prediction.entity_id == t["id"], Prediction.prediction_year == 2040).first()
        forecast_comp.append({
            "entity": t["name"],
            "type": "Technology",
            "score_2025": t["leadership_score"],
            "score_2030": p30.leadership_score if p30 else round(t["leadership_score"] * 1.08, 1),
            "score_2040": p40.leadership_score if p40 else round(t["leadership_score"] * 1.12, 1),
        })

    kpis = DashboardKpis(
        companies_analyzed=len(companies),
        technologies_analyzed=len(technologies),
        top_company=top_comp["name"],
        top_company_score=top_comp["leadership_score"],
        top_technology=top_tech["name"],
        top_technology_score=top_tech["leadership_score"],
        average_company_score=avg_comp,
        average_tech_score=avg_tech,
        high_potential_count=high_pot_count,
        data_freshness="Verified Benchmark Dataset (Demo Mode Active)"
    )

    return DashboardResponse(
        kpis=kpis,
        top_companies=[CompanyRankingItem(**x) for x in comp_rankings[:5]],
        top_technologies=[TechnologyRankingItem(**x) for x in tech_rankings[:5]],
        market_growth_trends=market_growth_trends,
        investment_trends=investment_trends,
        innovation_trends=innovation_trends,
        forecast_comparison=forecast_comp
    )
