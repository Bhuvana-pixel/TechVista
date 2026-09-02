import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

COMPANY_FEATURE_COLUMNS = [
    "revenue_growth",
    "profit_margin",
    "rd_intensity",
    "investment_intensity",
    "employee_growth",
    "market_share",
    "technology_adoption",
    "sentiment_score",
    "patent_intensity"
]

TECH_FEATURE_COLUMNS = [
    "investment",
    "patent_growth",
    "research_growth",
    "adoption_rate",
    "market_growth",
    "startup_count",
    "job_postings",
    "industry_interest",
    "sentiment_score"
]

def engineer_company_features(df_metrics: pd.DataFrame) -> pd.DataFrame:
    """Computes engineered features for company metrics dataframe."""
    df = df_metrics.copy()
    df = df.sort_values(by=["company_id", "year"])

    # Intensities and ratios
    df["rd_intensity"] = df.apply(
        lambda r: (r["rd_spending"] / max(r["revenue"], 0.1)) * 100.0, axis=1
    )
    df["investment_intensity"] = df.apply(
        lambda r: (r["investment"] / max(r["revenue"], 0.1)) * 100.0, axis=1
    )
    df["patent_intensity"] = df.apply(
        lambda r: (r["patents"] / max(r["rd_spending"], 0.5)), axis=1
    )

    # Fill NaNs safely
    df = df.fillna(0.0)
    return df

def engineer_technology_features(df_metrics: pd.DataFrame) -> pd.DataFrame:
    """Computes engineered features for technology metrics dataframe."""
    df = df_metrics.copy()
    df = df.sort_values(by=["technology_id", "year"])

    # Lag growth features
    df["patent_growth"] = df.groupby("technology_id")["patent_count"].pct_change() * 100.0
    df["research_growth"] = df.groupby("technology_id")["research_papers"].pct_change() * 100.0

    df["patent_growth"] = df["patent_growth"].fillna(12.0) # default initial growth
    df["research_growth"] = df["research_growth"].fillna(10.0)

    df = df.fillna(0.0)
    return df
