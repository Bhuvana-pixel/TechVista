from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.database import get_db
from app.models.entities import Technology, TechnologyMetric, Prediction
from app.schemas.entities import TechnologyOut, TechnologyDetailOut
from app.services.scoring import ScoringEngine

router = APIRouter(prefix="/technologies", tags=["Technologies"])

@router.get("", response_model=List[TechnologyOut])
def get_technologies(
    search: Optional[str] = Query(None, description="Search by technology name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    query = db.query(Technology)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(Technology.name.ilike(s))
    if category:
        query = query.filter(Technology.category == category)

    technologies = query.all()

    tech_summaries = []
    for t in technologies:
        latest_metric = db.query(TechnologyMetric).filter(TechnologyMetric.technology_id == t.id).order_by(TechnologyMetric.year.desc()).first()
        score = 65.0
        if latest_metric:
            calc = ScoringEngine.calculate_technology_score(latest_metric.__dict__)
            score = calc["leadership_score"]

        pred_2030 = db.query(Prediction).filter(
            Prediction.entity_type == "technology",
            Prediction.entity_id == t.id,
            Prediction.prediction_year == 2030
        ).first()

        future_pot = pred_2030.future_potential if pred_2030 else round(score * 1.08, 1)
        prob = pred_2030.probability if pred_2030 else 0.78

        tech_summaries.append({
            "tech": t,
            "score": score,
            "future_potential": future_pot,
            "probability": prob
        })

    tech_summaries.sort(key=lambda x: x["score"], reverse=True)
    for idx, item in enumerate(tech_summaries):
        item["rank"] = idx + 1

    paginated = tech_summaries[skip : skip + limit]

    result = []
    for item in paginated:
        t = item["tech"]
        result.append(TechnologyOut(
            id=t.id,
            name=t.name,
            category=t.category,
            description=t.description,
            website=t.website,
            leadership_score=item["score"],
            future_potential=item["future_potential"],
            probability=item["probability"],
            rank=item["rank"]
        ))
    return result

@router.get("/{technology_id}", response_model=TechnologyDetailOut)
def get_technology_detail(technology_id: int, db: Session = Depends(get_db)):
    technology = db.query(Technology).filter(Technology.id == technology_id).first()
    if not technology:
        raise HTTPException(status_code=404, detail="Technology not found")

    metrics = db.query(TechnologyMetric).filter(TechnologyMetric.technology_id == technology_id).order_by(TechnologyMetric.year.asc()).all()

    latest_score = 65.0
    latest_breakdown = None
    if metrics:
        latest_metric = metrics[-1]
        calc = ScoringEngine.calculate_technology_score(latest_metric.__dict__)
        latest_score = calc["leadership_score"]
        latest_breakdown = calc["breakdown"]

    predictions = db.query(Prediction).filter(
        Prediction.entity_type == "technology",
        Prediction.entity_id == technology_id
    ).order_by(Prediction.prediction_year.asc()).all()

    pos_factors = []
    neg_factors = []
    explanation = "Technology demonstrates accelerating adoption and strong patent density."
    pred_2030 = None
    trajectory = []

    for m in metrics:
        s = ScoringEngine.calculate_technology_score(m.__dict__)["leadership_score"]
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

    # Determine rank
    all_techs = db.query(Technology).all()
    scores = []
    for t in all_techs:
        m = db.query(TechnologyMetric).filter(TechnologyMetric.technology_id == t.id).order_by(TechnologyMetric.year.desc()).first()
        if m:
            scores.append((t.id, ScoringEngine.calculate_technology_score(m.__dict__)["leadership_score"]))
    scores.sort(key=lambda x: x[1], reverse=True)
    rank = 1
    for idx, (tid, s) in enumerate(scores):
        if tid == technology_id:
            rank = idx + 1
            break

    return TechnologyDetailOut(
        id=technology.id,
        name=technology.name,
        category=technology.category,
        description=technology.description,
        website=technology.website,
        leadership_score=latest_score,
        future_potential=pred_2030.future_potential if pred_2030 else round(latest_score * 1.08, 1),
        probability=pred_2030.probability if pred_2030 else 0.82,
        rank=rank,
        metrics=metrics,
        latest_score_breakdown=latest_breakdown,
        explanation=explanation,
        positive_factors=pos_factors,
        negative_factors=neg_factors,
        forecast_trajectory=trajectory
    )
