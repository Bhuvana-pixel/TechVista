from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models.entities import Company, CompanyMetric, Technology, TechnologyMetric, Prediction
from app.services.scoring import ScoringEngine

router = APIRouter(prefix="/compare", tags=["Comparison"])

@router.get("/companies")
def compare_companies(
    ids: str = Query(..., description="Comma-separated company IDs (up to 4, e.g. 1,2,3)"),
    db: Session = Depends(get_db)
):
    try:
        id_list = [int(x.strip()) for x in ids.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="IDs must be comma-separated integers.")

    if len(id_list) == 0:
        raise HTTPException(status_code=400, detail="Provide at least 1 company ID.")
    if len(id_list) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 companies can be compared simultaneously.")

    results = []
    for c_id in id_list:
        comp = db.query(Company).filter(Company.id == c_id).first()
        if not comp:
            continue

        latest_m = db.query(CompanyMetric).filter(CompanyMetric.company_id == c_id).order_by(CompanyMetric.year.desc()).first()
        calc = ScoringEngine.calculate_company_score(latest_m.__dict__) if latest_m else {"leadership_score": 60.0, "breakdown": {}}

        pred_2030 = db.query(Prediction).filter(
            Prediction.entity_type == "company",
            Prediction.entity_id == c_id,
            Prediction.prediction_year == 2030
        ).first()

        results.append({
            "id": comp.id,
            "name": comp.name,
            "ticker": comp.ticker,
            "industry": comp.industry,
            "country": comp.country,
            "logo_url": comp.logo_url,
            "leadership_score": calc["leadership_score"],
            "future_potential": pred_2030.future_potential if pred_2030 else round(calc["leadership_score"] * 1.05, 1),
            "probability": pred_2030.probability if pred_2030 else 0.75,
            "breakdown": calc["breakdown"],
            "raw_metrics": {
                "revenue": latest_m.revenue if latest_m else 0,
                "revenue_growth": latest_m.revenue_growth if latest_m else 0,
                "profit_margin": latest_m.profit_margin if latest_m else 0,
                "market_cap": latest_m.market_cap if latest_m else 0,
                "rd_spending": latest_m.rd_spending if latest_m else 0,
                "investment": latest_m.investment if latest_m else 0,
                "patents": latest_m.patents if latest_m else 0,
                "employees": latest_m.employees if latest_m else 0,
                "technology_adoption": latest_m.technology_adoption if latest_m else 0,
                "sentiment_score": latest_m.sentiment_score if latest_m else 0,
            }
        })

    # Prepare normalized radar indicators for multi-entity comparison
    radar_indicators = [
        "Financial Strength",
        "Market Position",
        "Investment",
        "R&D Intensity",
        "Innovation",
        "Workforce Growth",
        "Market Sentiment"
    ]

    radar_data = []
    for ind in radar_indicators:
        row = {"indicator": ind}
        for r in results:
            b = r["breakdown"]
            key_map = {
                "Financial Strength": "financial_strength",
                "Market Position": "market_position",
                "Investment": "investment",
                "R&D Intensity": "rd",
                "Innovation": "innovation",
                "Workforce Growth": "workforce_growth",
                "Market Sentiment": "sentiment"
            }
            row[r["ticker"]] = b.get(key_map[ind], 50.0)
        radar_data.append(row)

    return {
        "entities": results,
        "radar_data": radar_data
    }

@router.get("/technologies")
def compare_technologies(
    ids: str = Query(..., description="Comma-separated technology IDs (up to 4)"),
    db: Session = Depends(get_db)
):
    try:
        id_list = [int(x.strip()) for x in ids.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="IDs must be comma-separated integers.")

    if len(id_list) == 0:
        raise HTTPException(status_code=400, detail="Provide at least 1 technology ID.")
    if len(id_list) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 technologies can be compared.")

    results = []
    for t_id in id_list:
        tech = db.query(Technology).filter(Technology.id == t_id).first()
        if not tech:
            continue

        latest_m = db.query(TechnologyMetric).filter(TechnologyMetric.technology_id == t_id).order_by(TechnologyMetric.year.desc()).first()
        calc = ScoringEngine.calculate_technology_score(latest_m.__dict__) if latest_m else {"leadership_score": 60.0, "breakdown": {}}

        pred_2030 = db.query(Prediction).filter(
            Prediction.entity_type == "technology",
            Prediction.entity_id == t_id,
            Prediction.prediction_year == 2030
        ).first()

        results.append({
            "id": tech.id,
            "name": tech.name,
            "category": tech.category,
            "leadership_score": calc["leadership_score"],
            "future_potential": pred_2030.future_potential if pred_2030 else round(calc["leadership_score"] * 1.08, 1),
            "probability": pred_2030.probability if pred_2030 else 0.78,
            "breakdown": calc["breakdown"],
            "raw_metrics": {
                "investment": latest_m.investment if latest_m else 0,
                "patent_count": latest_m.patent_count if latest_m else 0,
                "research_papers": latest_m.research_papers if latest_m else 0,
                "adoption_rate": latest_m.adoption_rate if latest_m else 0,
                "market_size": latest_m.market_size if latest_m else 0,
                "market_growth": latest_m.market_growth if latest_m else 0,
                "startup_count": latest_m.startup_count if latest_m else 0,
                "job_postings": latest_m.job_postings if latest_m else 0,
                "industry_interest": latest_m.industry_interest if latest_m else 0,
            }
        })

    radar_indicators = [
        "Investment",
        "Innovation",
        "Adoption Rate",
        "Market Growth",
        "Industry Interest"
    ]

    radar_data = []
    for ind in radar_indicators:
        row = {"indicator": ind}
        for r in results:
            b = r["breakdown"]
            key_map = {
                "Investment": "investment",
                "Innovation": "innovation",
                "Adoption Rate": "adoption",
                "Market Growth": "market_growth",
                "Industry Interest": "industry_interest"
            }
            row[r["name"]] = b.get(key_map[ind], 50.0)
        radar_data.append(row)

    return {
        "entities": results,
        "radar_data": radar_data
    }
