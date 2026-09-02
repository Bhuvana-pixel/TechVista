import pytest
import pandas as pd
import numpy as np
from app.ml.pipeline import MLPipeline
from app.ml.explainability import generate_factor_attribution

def test_ml_company_training_pipeline_and_metrics():
    # Build sample time-series dataframe spanning 2015-2025
    records = []
    years = list(range(2015, 2026))
    for c_id in range(1, 6):
        for yr in years:
            records.append({
                "company_id": c_id,
                "year": yr,
                "revenue": 50.0 + (yr - 2015) * 8.0,
                "revenue_growth": 15.0 + np.random.normal(0, 3),
                "profit": 12.0 + (yr - 2015) * 2.0,
                "profit_margin": 24.0 + np.random.normal(0, 2),
                "market_cap": 200.0 + (yr - 2015) * 40.0,
                "rd_spending": 6.0 + (yr - 2015) * 1.5,
                "investment": 4.0 + (yr - 2015) * 1.0,
                "patents": 800 + (yr - 2015) * 80,
                "employees": 20000 + (yr - 2015) * 1500,
                "employee_growth": 8.0,
                "market_share": 15.0,
                "technology_adoption": 60.0 + (yr - 2015) * 3.0,
                "sentiment_score": 0.65
            })

    df = pd.DataFrame(records)
    result = MLPipeline.train_company_model(df)

    assert "model_name" in result
    assert "algorithm" in result
    assert "version" in result
    assert "metrics" in result
    assert "val_r2" in result["metrics"]
    assert "test_r2" in result["metrics"]
    assert "val_mae" in result["metrics"]
    assert len(result["feature_importances"]) == len(result["features"])

def test_factor_attribution_explainable_ai():
    feature_names = ["rd_intensity", "revenue_growth", "employee_growth", "sentiment_score"]
    sample_values = [25.0, 35.0, -2.0, 0.85]
    baseline_values = [12.0, 15.0, 8.0, 0.50]
    importances = [0.35, 0.30, 0.15, 0.20]

    positives, negatives, explanation = generate_factor_attribution(
        feature_names=feature_names,
        sample_values=sample_values,
        baseline_values=baseline_values,
        model_weights_or_importances=importances
    )

    assert len(positives) > 0
    assert len(negatives) > 0
    assert len(explanation) > 10
    # Positives should have impact > 0
    for p in positives:
        assert p["impact"] > 0
    # Negatives should have impact < 0
    for n in negatives:
        assert n["impact"] < 0
