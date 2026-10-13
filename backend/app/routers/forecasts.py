from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models.entities import Company, CompanyMetric, Technology, TechnologyMetric, Prediction
from app.schemas.entities import ForecastResponse, ForecastItem
from app.services.scoring import ScoringEngine
from app.services.forecasting import DISCLAIMER_TEXT

router = APIRouter(prefix="/forecasts", tags=["Forecasts"])

@router.get("/company/{company_id}", response_model=ForecastResponse)
def get_company_forecast(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    metrics = db.query(CompanyMetric).filter(CompanyMetric.company_id == company_id).order_by(CompanyMetric.year.asc()).all()
    current_year = 2025
    current_score = 65.0
    if metrics:
        current_year = metrics[-1].year
        current_score = ScoringEngine.calculate_company_score(metrics[-1].__dict__)["leadership_score"]

    predictions = db.query(Prediction).filter(
        Prediction.entity_type == "company",
        Prediction.entity_id == company_id
    ).order_by(Prediction.prediction_year.asc()).all()

    forecast_items = []
    confidence = 0.82

    for p in predictions:
        # Calculate uncertainty margin
        delta = p.prediction_year - current_year
        margin = round(3.5 + 0.65 * delta, 1)
        forecast_items.append(ForecastItem(
            year=p.prediction_year,
            leadership_score=p.leadership_score,
            future_potential=p.future_potential,
            probability=p.probability,
            lower_bound=max(0.0, round(p.leadership_score - margin, 1)),
            upper_bound=min(100.0, round(p.leadership_score + margin, 1)),
            confidence=p.confidence
        ))

    if forecast_items:
        confidence = forecast_items[0].confidence

    return ForecastResponse(
        entity_id=company.id,
        entity_name=company.name,
        entity_type="company",
        current_year=current_year,
        current_score=current_score,
        confidence=confidence,
        forecasts=forecast_items,
        disclaimer=DISCLAIMER_TEXT
    )

@router.get("/technology/{technology_id}", response_model=ForecastResponse)
def get_technology_forecast(technology_id: int, db: Session = Depends(get_db)):
    tech = db.query(Technology).filter(Technology.id == technology_id).first()
    if not tech:
        raise HTTPException(status_code=404, detail="Technology not found")

    metrics = db.query(TechnologyMetric).filter(TechnologyMetric.technology_id == technology_id).order_by(TechnologyMetric.year.asc()).all()
    current_year = 2025
    current_score = 65.0
    if metrics:
        current_year = metrics[-1].year
        current_score = ScoringEngine.calculate_technology_score(metrics[-1].__dict__)["leadership_score"]

    predictions = db.query(Prediction).filter(
        Prediction.entity_type == "technology",
        Prediction.entity_id == technology_id
    ).order_by(Prediction.prediction_year.asc()).all()

    forecast_items = []
    confidence = 0.84

    for p in predictions:
        delta = p.prediction_year - current_year
        margin = round(3.5 + 0.65 * delta, 1)
        forecast_items.append(ForecastItem(
            year=p.prediction_year,
            leadership_score=p.leadership_score,
            future_potential=p.future_potential,
            probability=p.probability,
            lower_bound=max(0.0, round(p.leadership_score - margin, 1)),
            upper_bound=min(100.0, round(p.leadership_score + margin, 1)),
            confidence=p.confidence
        ))

    if forecast_items:
        confidence = forecast_items[0].confidence

    return ForecastResponse(
        entity_id=tech.id,
        entity_name=tech.name,
        entity_type="technology",
        current_year=current_year,
        current_score=current_score,
        confidence=confidence,
        forecasts=forecast_items,
        disclaimer=DISCLAIMER_TEXT
    )

@router.get("/leaderboard")
def get_forecast_leaderboard(
    country: Optional[str] = Query(None, description="Filter leaderboard by country"),
    state: Optional[str] = Query(None, description="Filter leaderboard by state"),
    db: Session = Depends(get_db)
):
    """Returns top predicted Company and Technology Rank #1 Leaders for 2027, 2030, 2035, and 2040."""
    target_years = [2027, 2030, 2035, 2040]
    leaderboard_by_year = {}

    for yr in target_years:
        # Top Companies for target year
        comp_query = db.query(Prediction, Company).join(
            Company, Prediction.entity_id == Company.id
        ).filter(
            Prediction.entity_type == "company",
            Prediction.prediction_year == yr
        )

        if country:
            comp_query = comp_query.filter(Company.country == country)
        if state:
            comp_query = comp_query.filter(Company.state == state)

        comp_preds = comp_query.order_by(
            Prediction.leadership_score.desc(),
            Prediction.future_potential.desc(),
            Prediction.probability.desc()
        ).limit(5).all()

        top_companies = []
        for p, c in comp_preds:
            top_companies.append({
                "id": c.id,
                "name": c.name,
                "ticker": c.ticker,
                "industry": c.industry,
                "country": c.country,
                "state": c.state,
                "logo_url": c.logo_url,
                "leadership_score": p.leadership_score,
                "future_potential": p.future_potential,
                "probability": p.probability,
                "confidence": p.confidence,
                "explanation": p.explanation
            })

        # Top Technologies for target year
        tech_preds = db.query(Prediction, Technology).join(
            Technology, Prediction.entity_id == Technology.id
        ).filter(
            Prediction.entity_type == "technology",
            Prediction.prediction_year == yr
        ).order_by(
            Prediction.leadership_score.desc(),
            Prediction.future_potential.desc(),
            Prediction.probability.desc()
        ).limit(5).all()

        top_techs = []
        for p, t in tech_preds:
            top_techs.append({
                "id": t.id,
                "name": t.name,
                "category": t.category,
                "leadership_score": p.leadership_score,
                "future_potential": p.future_potential,
                "probability": p.probability,
                "confidence": p.confidence,
                "explanation": p.explanation
            })

        leaderboard_by_year[str(yr)] = {
            "year": yr,
            "top_company": top_companies[0] if top_companies else None,
            "top_technology": top_techs[0] if top_techs else None,
            "company_rankings": top_companies,
            "technology_rankings": top_techs
        }

    return {
        "disclaimer": DISCLAIMER_TEXT,
        "horizons": leaderboard_by_year
    }

