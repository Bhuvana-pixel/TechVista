import numpy as np
from typing import Dict, Any, List, Tuple

FEATURE_LABELS = {
    "revenue_growth": "Revenue Growth",
    "profit_margin": "Profit Margin",
    "rd_intensity": "R&D Intensity",
    "investment_intensity": "Capital Investment",
    "employee_growth": "Workforce Expansion",
    "market_share": "Market Share",
    "technology_adoption": "Technology Adoption",
    "sentiment_score": "Market Sentiment",
    "patent_intensity": "Patent Velocity",
    "investment": "Global Funding",
    "patent_growth": "Patent Growth",
    "research_growth": "Academic Research Growth",
    "adoption_rate": "Enterprise Adoption Rate",
    "market_growth": "TAM Market Growth",
    "startup_count": "Startup Ecosystem",
    "job_postings": "Job Market Demand",
    "industry_interest": "Industry Interest"
}

def generate_factor_attribution(
    feature_names: List[str],
    sample_values: List[float],
    baseline_values: List[float],
    model_weights_or_importances: List[float]
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], str]:
    """
    Computes feature contribution relative to population baseline.
    Returns:
    (positive_contributors, negative_contributors, human_readable_explanation)
    """
    positives = []
    negatives = []

    for name, val, base, imp in zip(feature_names, sample_values, baseline_values, model_weights_or_importances):
        # Contribution is delta from mean scaled by feature importance
        delta = (val - base) / (abs(base) + 1e-4)
        raw_contrib = float(delta * imp * 10.0) # scaled impact points
        clamped_contrib = round(np.clip(raw_contrib, -15.0, 15.0), 1)

        friendly_name = FEATURE_LABELS.get(name, name.replace("_", " ").title())

        if clamped_contrib > 0.3:
            positives.append({
                "feature": name,
                "label": friendly_name,
                "impact": clamped_contrib,
                "display": f"+{clamped_contrib}"
            })
        elif clamped_contrib < -0.3:
            negatives.append({
                "feature": name,
                "label": friendly_name,
                "impact": clamped_contrib,
                "display": f"{clamped_contrib}"
            })

    # Sort by absolute magnitude
    positives.sort(key=lambda x: x["impact"], reverse=True)
    negatives.sort(key=lambda x: x["impact"])

    # Synthesize human-readable explanation
    explanation_parts = []
    if positives:
        top_pos = [f"{p['label']} ({p['display']})" for p in positives[:3]]
        explanation_parts.append(f"Leader trajectory is propelled primarily by strong {', '.join(top_pos)}")

    if negatives:
        top_neg = [f"{n['label']} ({n['display']})" for n in negatives[:2]]
        if explanation_parts:
            explanation_parts.append(f", partially offset by drag in {', '.join(top_neg)}.")
        else:
            explanation_parts.append(f"Performance is currently constrained by headwinds in {', '.join(top_neg)}.")
    else:
        explanation_parts.append(", demonstrating balanced fundamentals across all leading indicators.")

    explanation = "".join(explanation_parts)

    return positives[:5], negatives[:5], explanation
