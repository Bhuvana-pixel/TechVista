from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models.entities import Company, CompanyMetric, Technology, TechnologyMetric, Prediction
from app.services.scoring import ScoringEngine

router = APIRouter(prefix="/geographic", tags=["Geographic Insights"])

def calculate_ranks_with_ties(items: List[Dict[str, Any]], score_key: str = "score") -> List[Dict[str, Any]]:
    """Assign ranks with tie handling. Items with identical scores get identical ranks."""
    if not items:
        return []

    # Sort descending by score
    items.sort(key=lambda x: (x.get(score_key, 0.0), x.get("name", "")), reverse=True)

    current_rank = 1
    for idx, item in enumerate(items):
        if idx > 0:
            prev_item = items[idx - 1]
            if item.get(score_key, 0.0) == prev_item.get(score_key, 0.0):
                item["rank"] = prev_item["rank"]
                item["is_tied"] = True
                prev_item["is_tied"] = True
            else:
                item["rank"] = idx + 1
                item["is_tied"] = False
        else:
            item["rank"] = 1
            item["is_tied"] = False

    return items

@router.get("/companies")
def get_geographic_companies(
    country: Optional[str] = Query(None, description="Filter by country (e.g. India, United States)"),
    state: Optional[str] = Query(None, description="Filter by state (e.g. Tamil Nadu, California)"),
    top_n: int = Query(5, ge=1, le=50, description="Top N leaders to return (3, 5, 10)"),
    year: int = Query(2025, description="Horizon year (2025 baseline, 2027, 2030, 2035, 2040)"),
    db: Session = Depends(get_db)
):
    query = db.query(Company)
    if country and country.lower() != "all":
        query = query.filter(Company.country.ilike(country.strip()))
    if state and state.lower() != "all":
        query = query.filter(Company.state.ilike(state.strip()))

    companies = query.all()
    if not companies:
        return {
            "country": country or "All",
            "state": state or "All",
            "year": year,
            "top_n": top_n,
            "data_available": False,
            "message": "Data unavailable for the selected location criteria.",
            "companies": []
        }

    company_items = []
    for c in companies:
        score = 65.0
        future_pot = 68.0
        prob = 0.75

        latest_metric = db.query(CompanyMetric).filter(
            CompanyMetric.company_id == c.id
        ).order_by(CompanyMetric.year.desc()).first()

        if latest_metric:
            calc = ScoringEngine.calculate_company_score(latest_metric.__dict__)
            score = calc["leadership_score"]

        # Fetch prediction for target year
        target_pred_yr = year if year in [2027, 2030, 2035, 2040] else 2030
        pred = db.query(Prediction).filter(
            Prediction.entity_type == "company",
            Prediction.entity_id == c.id,
            Prediction.prediction_year == target_pred_yr
        ).first()

        if pred:
            future_pot = pred.future_potential
            prob = pred.probability
            if year in [2027, 2030, 2035, 2040]:
                target_score = pred.leadership_score
            else:
                target_score = score
        else:
            future_pot = round(score * 1.05, 1)
            target_score = score

        company_items.append({
            "id": c.id,
            "name": c.name,
            "ticker": c.ticker,
            "industry": c.industry,
            "country": c.country,
            "state": c.state or "Data unavailable",
            "score": round(target_score, 1),
            "baseline_score": round(score, 1),
            "future_potential": round(future_pot, 1),
            "probability": prob,
            "logo_url": c.logo_url
        })

    # Sort & calculate ranks with ties
    ranked_companies = calculate_ranks_with_ties(company_items, score_key="score")
    sliced = ranked_companies[:top_n]

    return {
        "country": country or "All",
        "state": state or "All",
        "year": year,
        "top_n": top_n,
        "data_available": True,
        "companies": sliced
    }

@router.get("/technologies")
def get_geographic_technologies(
    country: Optional[str] = Query(None, description="Filter by country"),
    state: Optional[str] = Query(None, description="Filter by state"),
    top_n: int = Query(5, ge=1, le=50, description="Top N technologies to return"),
    year: int = Query(2025, description="Horizon year"),
    db: Session = Depends(get_db)
):
    techs = db.query(Technology).all()
    if not techs:
        return {
            "country": country or "All",
            "state": state or "All",
            "year": year,
            "top_n": top_n,
            "data_available": False,
            "message": "Data unavailable for technologies.",
            "technologies": []
        }

    # Fetch companies in this location to weight regional technology adoption
    regional_comp_query = db.query(Company)
    if country and country.lower() != "all":
        regional_comp_query = regional_comp_query.filter(Company.country.ilike(country.strip()))
    if state and state.lower() != "all":
        regional_comp_query = regional_comp_query.filter(Company.state.ilike(state.strip()))

    regional_comps = regional_comp_query.all()
    
    # If state specified but no companies exist in that state, indicate data unavailable
    if state and state.lower() != "all" and not regional_comps:
        return {
            "country": country or "All",
            "state": state,
            "year": year,
            "top_n": top_n,
            "data_available": False,
            "message": f"Data unavailable for state '{state}'. No tracked enterprise metrics recorded.",
            "technologies": []
        }

    # Calculate average regional tech adoption modifier from local enterprise adoption
    regional_adoption_bonus = 0.0
    if regional_comps:
        comp_ids = [c.id for c in regional_comps]
        latest_comp_metrics = db.query(CompanyMetric).filter(
            CompanyMetric.company_id.in_(comp_ids)
        ).all()
        if latest_comp_metrics:
            avg_adoption = sum(m.technology_adoption for m in latest_comp_metrics) / len(latest_comp_metrics)
            regional_adoption_bonus = (avg_adoption - 50.0) * 0.15

    tech_items = []
    for t in techs:
        latest_m = db.query(TechnologyMetric).filter(
            TechnologyMetric.technology_id == t.id
        ).order_by(TechnologyMetric.year.desc()).first()

        score = 65.0
        adopt_rate = 45.0
        mkt_size = 25.0
        if latest_m:
            calc = ScoringEngine.calculate_technology_score(latest_m.__dict__)
            score = calc["leadership_score"]
            adopt_rate = latest_m.adoption_rate
            mkt_size = latest_m.market_size

        target_pred_yr = year if year in [2027, 2030, 2035, 2040] else 2030
        pred = db.query(Prediction).filter(
            Prediction.entity_type == "technology",
            Prediction.entity_id == t.id,
            Prediction.prediction_year == target_pred_yr
        ).first()

        if pred:
            future_pot = pred.future_potential
            target_score = pred.leadership_score if year in [2027, 2030, 2035, 2040] else score
        else:
            future_pot = round(score * 1.08, 1)
            target_score = score

        # Adjust score slightly with empirical regional adoption bonus if specific country/state selected
        regional_score = min(100.0, max(0.0, target_score + (regional_adoption_bonus if (country or state) else 0.0)))

        tech_items.append({
            "id": t.id,
            "name": t.name,
            "category": t.category,
            "score": round(regional_score, 1),
            "baseline_score": round(score, 1),
            "future_potential": round(future_pot, 1),
            "adoption_rate": round(adopt_rate, 1),
            "market_size": round(mkt_size, 1),
            "regional_indicator": f"Enterprise Adoption: {round(adopt_rate, 1)}%"
        })

    ranked_techs = calculate_ranks_with_ties(tech_items, score_key="score")
    sliced = ranked_techs[:top_n]

    return {
        "country": country or "All",
        "state": state or "All",
        "year": year,
        "top_n": top_n,
        "data_available": True,
        "technologies": sliced
    }

@router.get("/overview")
def get_geographic_overview(
    top_n: int = Query(3, ge=1, le=10, description="Top N per country"),
    year: int = Query(2030, description="Horizon year for overview"),
    db: Session = Depends(get_db)
):
    """Returns country-by-country breakdown with top companies and top emerging technologies."""
    countries_query = db.query(Company.country).distinct().all()
    country_names = sorted([c[0] for c in countries_query if c[0]])

    country_cards = []
    for c_name in country_names:
        # Top Companies for this country
        comps_payload = get_geographic_companies(
            country=c_name, state=None, top_n=top_n, year=year, db=db
        )
        # Top Technologies for this country
        techs_payload = get_geographic_technologies(
            country=c_name, state=None, top_n=top_n, year=year, db=db
        )

        country_cards.append({
            "country": c_name,
            "companies_count": len(db.query(Company).filter(Company.country == c_name).all()),
            "top_companies": comps_payload.get("companies", []),
            "top_technologies": techs_payload.get("technologies", [])
        })

    return {
        "year": year,
        "top_n": top_n,
        "total_countries": len(country_cards),
        "countries": country_cards
    }
