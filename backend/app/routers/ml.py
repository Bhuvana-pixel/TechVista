import json
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.entities import Company, CompanyMetric, Technology, TechnologyMetric, ModelVersion, Prediction
from app.ml.pipeline import MLPipeline
from app.services.scoring import ScoringEngine
from app.services.forecasting import generate_entity_forecast

router = APIRouter(prefix="/ml", tags=["Machine Learning Training"])

def retrain_company_pipeline(db: Session):
    """Executes company ML model retraining and updates stored predictions."""
    metrics = db.query(CompanyMetric).all()
    if len(metrics) < 10:
        return {"error": "Insufficient data to retrain model."}

    data = [m.__dict__ for m in metrics]
    df = pd.DataFrame(data)
    res = MLPipeline.train_company_model(df)

    # Save model version
    mv = ModelVersion(
        model_name=res["model_name"],
        version=res["version"],
        algorithm=res["algorithm"],
        dataset_size=res["dataset_size"],
        features=json.dumps(res["features"]),
        metrics=json.dumps(res["metrics"]),
        status="active"
    )
    db.add(mv)
    db.commit()

    # Refresh predictions in database
    companies = db.query(Company).all()
    for comp in companies:
        comp_metrics = [m for m in metrics if m.company_id == comp.id]
        if not comp_metrics:
            continue
        comp_metrics.sort(key=lambda x: x.year)

        hist_scores = []
        for m in comp_metrics:
            s = ScoringEngine.calculate_company_score(m.__dict__)["leadership_score"]
            hist_scores.append((m.year, s))

        latest_rec = comp_metrics[-1]
        feat_dict = {
            "revenue_growth": latest_rec.revenue_growth,
            "profit_margin": latest_rec.profit_margin,
            "rd_intensity": (latest_rec.rd_spending / max(latest_rec.revenue, 0.1)) * 100.0,
            "investment_intensity": (latest_rec.investment / max(latest_rec.revenue, 0.1)) * 100.0,
            "employee_growth": latest_rec.employee_growth,
            "market_share": latest_rec.market_share,
            "technology_adoption": latest_rec.technology_adoption,
            "sentiment_score": latest_rec.sentiment_score,
            "patent_intensity": latest_rec.patents / max(latest_rec.rd_spending, 0.5)
        }

        fc_data = generate_entity_forecast(
            entity_id=comp.id,
            entity_name=comp.name,
            entity_type="company",
            historical_scores=hist_scores,
            latest_features=feat_dict,
            baseline_features=res["baseline_means"],
            feature_importances=res["feature_importances"],
            model_version=res["version"]
        )

        for fc in fc_data["forecasts"]:
            # Update or insert prediction
            existing_pred = db.query(Prediction).filter(
                Prediction.entity_type == "company",
                Prediction.entity_id == comp.id,
                Prediction.prediction_year == fc["year"]
            ).first()

            if existing_pred:
                existing_pred.leadership_score = fc["leadership_score"]
                existing_pred.future_potential = fc["future_potential"]
                existing_pred.probability = fc["probability"]
                existing_pred.confidence = fc["confidence"]
                existing_pred.factor_contributions = json.dumps({
                    "positive": fc["positive_factors"],
                    "negative": fc["negative_factors"]
                })
                existing_pred.explanation = fc["explanation"]
                existing_pred.model_version = res["version"]
            else:
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
                    model_version=res["version"]
                )
                db.add(pred)

    db.commit()
    return res

@router.post("/train/company")
def trigger_company_training(db: Session = Depends(get_db)):
    """Triggers synchronous retraining of company model and regenerates stored forecasts."""
    try:
        result = retrain_company_pipeline(db)
        return {
            "status": "SUCCESS",
            "message": "Company leadership model retrained and forecasts updated.",
            "training_details": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training pipeline error: {str(e)}")

@router.post("/train/technology")
def trigger_technology_training(db: Session = Depends(get_db)):
    """Triggers retraining of technology model and regenerates stored forecasts."""
    try:
        metrics = db.query(TechnologyMetric).all()
        if len(metrics) < 10:
            raise HTTPException(status_code=400, detail="Insufficient technology metrics to retrain.")

        data = [m.__dict__ for m in metrics]
        df = pd.DataFrame(data)
        res = MLPipeline.train_technology_model(df)

        mv = ModelVersion(
            model_name=res["model_name"],
            version=res["version"],
            algorithm=res["algorithm"],
            dataset_size=res["dataset_size"],
            features=json.dumps(res["features"]),
            metrics=json.dumps(res["metrics"]),
            status="active"
        )
        db.add(mv)
        db.commit()

        # Update predictions
        technologies = db.query(Technology).all()
        for tech in technologies:
            tech_metrics = [m for m in metrics if m.technology_id == tech.id]
            if not tech_metrics:
                continue
            tech_metrics.sort(key=lambda x: x.year)

            hist_scores = []
            for m in tech_metrics:
                s = ScoringEngine.calculate_technology_score(m.__dict__)["leadership_score"]
                hist_scores.append((m.year, s))

            latest_rec = tech_metrics[-1]
            feat_dict = {
                "investment": latest_rec.investment,
                "patent_growth": 14.5,
                "research_growth": 12.0,
                "adoption_rate": latest_rec.adoption_rate,
                "market_growth": latest_rec.market_growth,
                "startup_count": latest_rec.startup_count,
                "job_postings": latest_rec.job_postings,
                "industry_interest": latest_rec.industry_interest,
                "sentiment_score": latest_rec.sentiment_score
            }

            fc_data = generate_entity_forecast(
                entity_id=tech.id,
                entity_name=tech.name,
                entity_type="technology",
                historical_scores=hist_scores,
                latest_features=feat_dict,
                baseline_features=res["baseline_means"],
                feature_importances=res["feature_importances"],
                model_version=res["version"]
            )

            for fc in fc_data["forecasts"]:
                existing_pred = db.query(Prediction).filter(
                    Prediction.entity_type == "technology",
                    Prediction.entity_id == tech.id,
                    Prediction.prediction_year == fc["year"]
                ).first()

                if existing_pred:
                    existing_pred.leadership_score = fc["leadership_score"]
                    existing_pred.future_potential = fc["future_potential"]
                    existing_pred.probability = fc["probability"]
                    existing_pred.confidence = fc["confidence"]
                    existing_pred.factor_contributions = json.dumps({
                        "positive": fc["positive_factors"],
                        "negative": fc["negative_factors"]
                    })
                    existing_pred.explanation = fc["explanation"]
                    existing_pred.model_version = res["version"]
                else:
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
                        model_version=res["version"]
                    )
                    db.add(pred)

        db.commit()

        return {
            "status": "SUCCESS",
            "message": "Technology leadership model retrained and forecasts updated.",
            "training_details": res
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Technology training pipeline error: {str(e)}")
