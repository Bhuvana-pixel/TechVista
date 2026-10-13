from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.entities import Company, CompanyMetric, Technology, TechnologyMetric, Prediction
from app.schemas.entities import CompanyRankingItem, TechnologyRankingItem
from app.services.scoring import ScoringEngine

router = APIRouter(prefix="/rankings", tags=["Rankings"])

@router.get("/companies", response_model=List[CompanyRankingItem])
def get_company_rankings(
    search: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    min_score: Optional[float] = Query(None),
    max_score: Optional[float] = Query(None),
    min_growth: Optional[float] = Query(None),
    sort_by: str = Query("rank", pattern="^(rank|score|future_potential|probability|market_cap|revenue_growth)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    companies = db.query(Company).all()
    items = []

    for c in companies:
        m = db.query(CompanyMetric).filter(CompanyMetric.company_id == c.id).order_by(CompanyMetric.year.desc()).first()
        score = 65.0
        mcap = 50.0
        rev_growth = 12.0
        if m:
            calc = ScoringEngine.calculate_company_score(m.__dict__)
            score = calc["leadership_score"]
            mcap = m.market_cap
            rev_growth = m.revenue_growth

        pred_2030 = db.query(Prediction).filter(
            Prediction.entity_type == "company",
            Prediction.entity_id == c.id,
            Prediction.prediction_year == 2030
        ).first()

        future_pot = pred_2030.future_potential if pred_2030 else round(score * 1.05, 1)
        prob = pred_2030.probability if pred_2030 else 0.75
        trend = "Bullish" if prob >= 0.80 else ("Neutral" if prob >= 0.55 else "Cautious")

        items.append({
            "id": c.id,
            "name": c.name,
            "ticker": c.ticker,
            "industry": c.industry,
            "country": c.country,
            "state": c.state,
            "leadership_score": score,
            "future_potential": future_pot,
            "probability": prob,
            "trend": trend,
            "market_cap": mcap,
            "revenue_growth": rev_growth
        })

    # Base multi-tier composite sort (Score -> Future Potential -> Probability -> Scale -> Name)
    items.sort(key=lambda x: (
        -x["leadership_score"],
        -x.get("future_potential", 0.0),
        -x.get("probability", 0.0),
        -x.get("market_cap", 0.0),
        x["name"]
    ))
    for idx, it in enumerate(items):
        it["rank"] = idx + 1

    # Apply filters
    filtered = []
    for it in items:
        if search:
            s = search.lower()
            if s not in it["name"].lower() and s not in it["ticker"].lower():
                continue
        if industry and it["industry"] != industry:
            continue
        if country and it["country"] != country:
            continue
        if state and it.get("state") != state:
            continue
        if min_score is not None and it["leadership_score"] < min_score:
            continue
        if max_score is not None and it["leadership_score"] > max_score:
            continue
        if min_growth is not None and it["revenue_growth"] < min_growth:
            continue
        filtered.append(it)

    # Secondary sort if requested
    reverse = (sort_order == "desc")
    if sort_by == "score":
        filtered.sort(key=lambda x: x["leadership_score"], reverse=reverse)
    elif sort_by == "future_potential":
        filtered.sort(key=lambda x: x["future_potential"], reverse=reverse)
    elif sort_by == "probability":
        filtered.sort(key=lambda x: x["probability"], reverse=reverse)
    elif sort_by == "market_cap":
        filtered.sort(key=lambda x: x["market_cap"], reverse=reverse)
    elif sort_by == "revenue_growth":
        filtered.sort(key=lambda x: x["revenue_growth"], reverse=reverse)
    elif sort_by == "rank":
        filtered.sort(key=lambda x: x["rank"], reverse=reverse)

    return [CompanyRankingItem(**it) for it in filtered]

@router.get("/technologies", response_model=List[TechnologyRankingItem])
def get_technology_rankings(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    min_score: Optional[float] = Query(None),
    max_score: Optional[float] = Query(None),
    sort_by: str = Query("rank", pattern="^(rank|score|future_potential|probability|market_size|adoption_rate)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    techs = db.query(Technology).all()
    items = []

    for t in techs:
        m = db.query(TechnologyMetric).filter(TechnologyMetric.technology_id == t.id).order_by(TechnologyMetric.year.desc()).first()
        score = 65.0
        mkt_size = 20.0
        adopt_rate = 25.0
        if m:
            calc = ScoringEngine.calculate_technology_score(m.__dict__)
            score = calc["leadership_score"]
            mkt_size = m.market_size
            adopt_rate = m.adoption_rate

        pred_2030 = db.query(Prediction).filter(
            Prediction.entity_type == "technology",
            Prediction.entity_id == t.id,
            Prediction.prediction_year == 2030
        ).first()

        future_pot = pred_2030.future_potential if pred_2030 else round(score * 1.08, 1)
        prob = pred_2030.probability if pred_2030 else 0.78
        trend = "Accelerating" if prob >= 0.80 else ("Stable" if prob >= 0.60 else "Emerging")

        items.append({
            "id": t.id,
            "name": t.name,
            "category": t.category,
            "leadership_score": score,
            "future_potential": future_pot,
            "probability": prob,
            "trend": trend,
            "market_size": mkt_size,
            "adoption_rate": adopt_rate
        })

    items.sort(key=lambda x: (
        -x["leadership_score"],
        -x.get("future_potential", 0.0),
        -x.get("probability", 0.0),
        -x.get("market_size", 0.0),
        x["name"]
    ))
    for idx, it in enumerate(items):
        it["rank"] = idx + 1

    filtered = []
    for it in items:
        if search and search.lower() not in it["name"].lower():
            continue
        if category and it["category"] != category:
            continue
        if min_score is not None and it["leadership_score"] < min_score:
            continue
        if max_score is not None and it["leadership_score"] > max_score:
            continue
        filtered.append(it)

    reverse = (sort_order == "desc")
    if sort_by == "score":
        filtered.sort(key=lambda x: x["leadership_score"], reverse=reverse)
    elif sort_by == "future_potential":
        filtered.sort(key=lambda x: x["future_potential"], reverse=reverse)
    elif sort_by == "probability":
        filtered.sort(key=lambda x: x["probability"], reverse=reverse)
    elif sort_by == "market_size":
        filtered.sort(key=lambda x: x["market_size"], reverse=reverse)
    elif sort_by == "adoption_rate":
        filtered.sort(key=lambda x: x["adoption_rate"], reverse=reverse)
    elif sort_by == "rank":
        filtered.sort(key=lambda x: x["rank"], reverse=reverse)

    return [TechnologyRankingItem(**it) for it in filtered]
