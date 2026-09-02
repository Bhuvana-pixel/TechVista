import numpy as np
from typing import List, Dict, Any, Tuple
from app.utils.normalizer import clamp_100
from app.ml.explainability import generate_factor_attribution

FORECAST_TARGET_YEARS = [2027, 2030, 2035, 2040]

DISCLAIMER_TEXT = (
    "Forecasts represent model-based estimates derived from historical and current indicators. "
    "They are not guaranteed predictions of future market performance."
)

def compute_leadership_probability(score: float, cohort_mean: float = 60.0, std_dev: float = 18.0) -> float:
    """Logistic sigmoid transformation converting score to leadership probability."""
    z = (score - cohort_mean) / max(std_dev, 1.0)
    prob = 1.0 / (1.0 + np.exp(-1.5 * z))
    return round(float(np.clip(prob, 0.05, 0.98)), 3)

def generate_entity_forecast(
    entity_id: int,
    entity_name: str,
    entity_type: str,
    historical_scores: List[Tuple[int, float]], # [(2018, 55.2), (2025, 78.4)]
    latest_features: Dict[str, float],
    baseline_features: Dict[str, float] = None,
    feature_importances: List[float] = None,
    model_version: str = "v1.0"
) -> Dict[str, Any]:
    """
    Computes damped trend forecasts for 2027, 2030, 2035, and 2040 with uncertainty intervals.
    """
    if not historical_scores:
        current_year = 2025
        current_score = 65.0
    else:
        historical_scores.sort(key=lambda x: x[0])
        current_year, current_score = historical_scores[-1]

    # Calculate historical trajectory momentum
    if len(historical_scores) >= 3:
        years = np.array([x[0] for x in historical_scores])
        scores = np.array([x[1] for x in historical_scores])
        # Simple linear slope
        slope, _ = np.polyfit(years, scores, 1)
    else:
        slope = 1.2

    # Feature contribution explainability
    feat_names = list(latest_features.keys())
    feat_vals = [latest_features[k] for k in feat_names]
    base_vals = [baseline_features.get(k, 10.0) if baseline_features else 10.0 for k in feat_names]
    importances = feature_importances or [1.0 / max(len(feat_names), 1)] * len(feat_names)

    pos_factors, neg_factors, explanation = generate_factor_attribution(
        feature_names=feat_names,
        sample_values=feat_vals,
        baseline_values=base_vals,
        model_weights_or_importances=importances
    )

    forecast_items = []

    for target_year in FORECAST_TARGET_YEARS:
        delta_years = target_year - current_year

        # Damping factor: long-term forecasts decay towards mean to prevent runaway growth
        damping = np.exp(-0.04 * delta_years)
        projected_delta = slope * delta_years * damping

        # Market saturation asymptote adjustment
        projected_score = clamp_100(current_score + projected_delta)

        # Future potential: incorporates growth momentum + ceiling headroom
        headroom = 100.0 - projected_score
        potential = clamp_100(projected_score + (headroom * 0.35 * damping))

        # Probability of remaining an industry leader
        probability = compute_leadership_probability(projected_score)

        # Confidence decays with time horizon: 2027 (~88%) down to 2040 (~62%)
        confidence = round(max(0.55, 0.90 - (0.022 * delta_years)), 2)

        # Uncertainty envelope expands over time
        uncertainty_margin = round(3.5 + (0.65 * delta_years), 1)
        lower_bound = clamp_100(projected_score - uncertainty_margin)
        upper_bound = clamp_100(projected_score + uncertainty_margin)

        forecast_items.append({
            "year": target_year,
            "leadership_score": projected_score,
            "future_potential": potential,
            "probability": probability,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "confidence": confidence,
            "positive_factors": pos_factors,
            "negative_factors": neg_factors,
            "explanation": explanation
        })

    return {
        "entity_id": entity_id,
        "entity_name": entity_name,
        "entity_type": entity_type,
        "current_year": current_year,
        "current_score": current_score,
        "confidence": forecast_items[0]["confidence"] if forecast_items else 0.82,
        "forecasts": forecast_items,
        "explanation": explanation,
        "positive_factors": pos_factors,
        "negative_factors": neg_factors,
        "model_version": model_version,
        "disclaimer": DISCLAIMER_TEXT
    }
