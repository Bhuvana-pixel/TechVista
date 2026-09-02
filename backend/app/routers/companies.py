from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app.models.entities import Company, CompanyMetric, Prediction
from app.schemas.entities import CompanyOut, CompanyDetailOut
from app.services.scoring import ScoringEngine

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("", response_model=List[CompanyOut])
def get_companies(
    search: Optional[str] = Query(None, description="Search by name or ticker"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    country: Optional[str] = Query(None, description="Filter by country"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Company)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((Company.name.ilike(s)) | (Company.ticker.ilike(s)))
    if industry:
        query = query.filter(Company.industry == industry)
    if country:
        query = query.filter(Company.country == country)

    companies = query.all()

    # Calculate latest scores and ranks
    comp_summaries = []
    for c in companies:
        latest_metric = db.query(CompanyMetric).filter(CompanyMetric.company_id == c.id).order_by(CompanyMetric.year.desc()).first()
        score = 65.0
        if latest_metric:
            calc = ScoringEngine.calculate_company_score(latest_metric.__dict__)
            score = calc["leadership_score"]

        # Get latest 2030 stored prediction for future potential & probability
        pred_2030 = db.query(Prediction).filter(
            Prediction.entity_type == "company",
            Prediction.entity_id == c.id,
            Prediction.prediction_year == 2030
        ).first()

        future_pot = pred_2030.future_potential if pred_2030 else round(score * 1.05, 1)
        prob = pred_2030.probability if pred_2030 else 0.75

        comp_summaries.append({
            "company": c,
            "score": score,
            "future_potential": future_pot,
            "probability": prob
        })

    # Sort descending by leadership score to assign rank
    comp_summaries.sort(key=lambda x: x["score"], reverse=True)
    for idx, item in enumerate(comp_summaries):
        item["rank"] = idx + 1

    paginated = comp_summaries[skip : skip + limit]

    result = []
    for item in paginated:
        c = item["company"]
        result.append(CompanyOut(
            id=c.id,
            name=c.name,
            ticker=c.ticker,
            industry=c.industry,
            sector=c.sector,
            country=c.country,
            website=c.website,
            description=c.description,
            logo_url=c.logo_url,
            leadership_score=item["score"],
            future_potential=item["future_potential"],
            probability=item["probability"],
            rank=item["rank"]
        ))
    return result

@router.get("/{company_id}", response_model=CompanyDetailOut)
def get_company_detail(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    metrics = db.query(CompanyMetric).filter(CompanyMetric.company_id == company_id).order_by(CompanyMetric.year.asc()).all()

    latest_score = 65.0
    latest_breakdown = None
    if metrics:
        latest_metric = metrics[-1]
        calc = ScoringEngine.calculate_company_score(latest_metric.__dict__)
        latest_score = calc["leadership_score"]
        latest_breakdown = calc["breakdown"]

    # Retrieve stored predictions
    predictions = db.query(Prediction).filter(
        Prediction.entity_type == "company",
        Prediction.entity_id == company_id
    ).order_by(Prediction.prediction_year.asc()).all()

    pos_factors = []
    neg_factors = []
    explanation = "Company maintains robust fundamentals and strong technology adoption."
    pred_2030 = None
    trajectory = []

    # Include historical points in trajectory
    for m in metrics:
        s = ScoringEngine.calculate_company_score(m.__dict__)["leadership_score"]
        trajectory.append({
            "year": m.year,
            "leadership_score": s,
            "is_forecast": False
        })

    for p in predictions:
        trajectory.append({
            "year": p.prediction_year,
            "leadership_score": p.leadership_score,
            "future_potential": p.future_potential,
            "probability": p.probability,
            "confidence": p.confidence,
            "is_forecast": True
        })
        if p.prediction_year == 2030:
            pred_2030 = p
            explanation = p.explanation or explanation
            if p.factor_contributions:
                try:
                    f_json = json.loads(p.factor_contributions)
                    pos_factors = f_json.get("positive", [])
                    neg_factors = f_json.get("negative", [])
                except Exception:
                    pass

    # Determine rank among all companies
    all_companies = db.query(Company).all()
    scores = []
    for c in all_companies:
        m = db.query(CompanyMetric).filter(CompanyMetric.company_id == c.id).order_by(CompanyMetric.year.desc()).first()
        if m:
            scores.append((c.id, ScoringEngine.calculate_company_score(m.__dict__)["leadership_score"]))
    scores.sort(key=lambda x: x[1], reverse=True)
    rank = 1
    for idx, (cid, s) in enumerate(scores):
        if cid == company_id:
            rank = idx + 1
            break

    return CompanyDetailOut(
        id=company.id,
        name=company.name,
        ticker=company.ticker,
        industry=company.industry,
        sector=company.sector,
        country=company.country,
        website=company.website,
        description=company.description,
        logo_url=company.logo_url,
        leadership_score=latest_score,
        future_potential=pred_2030.future_potential if pred_2030 else round(latest_score * 1.05, 1),
        probability=pred_2030.probability if pred_2030 else 0.80,
        rank=rank,
        metrics=metrics,
        latest_score_breakdown=latest_breakdown,
        explanation=explanation,
        positive_factors=pos_factors,
        negative_factors=neg_factors,
        forecast_trajectory=trajectory
    )
