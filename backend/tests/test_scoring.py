import pytest
from app.services.scoring import ScoringEngine
from app.utils.normalizer import min_max_scale, log_transform_scale, clamp_100, sentiment_to_100

def test_normalizer_clamp_and_scaling():
    assert clamp_100(150.5) == 100.0
    assert clamp_100(-20.0) == 0.0
    assert clamp_100(75.4) == 75.4

    scaled = min_max_scale(50, 0, 100, 0, 100)
    assert scaled == 50.0

    sentiment = sentiment_to_100(0.0) # neutral
    assert sentiment == 50.0
    sentiment_pos = sentiment_to_100(1.0) # max positive
    assert sentiment_pos == 100.0
    sentiment_neg = sentiment_to_100(-1.0) # max negative
    assert sentiment_neg == 0.0

def test_company_scoring_engine_bounds_and_breakdown():
    sample_metric = {
        "revenue": 120.0,
        "revenue_growth": 25.0,
        "profit": 35.0,
        "profit_margin": 29.0,
        "market_cap": 850.0,
        "market_share": 32.0,
        "investment": 14.0,
        "rd_spending": 18.0,
        "patents": 3200,
        "employee_growth": 12.0,
        "technology_adoption": 85.0,
        "sentiment_score": 0.75
    }

    result = ScoringEngine.calculate_company_score(sample_metric)

    assert "leadership_score" in result
    assert "breakdown" in result
    score = result["leadership_score"]
    assert 0.0 <= score <= 100.0

    breakdown = result["breakdown"]
    expected_keys = [
        "financial_strength", "market_position", "investment",
        "rd", "innovation", "workforce_growth", "sentiment"
    ]
    for key in expected_keys:
        assert key in breakdown
        assert 0.0 <= breakdown[key] <= 100.0

def test_technology_scoring_engine_bounds_and_breakdown():
    sample_metric = {
        "investment": 45.0,
        "patent_count": 8500,
        "research_papers": 6200,
        "adoption_rate": 65.0,
        "market_size": 120.0,
        "market_growth": 35.0,
        "startup_count": 850,
        "job_postings": 95,
        "industry_interest": 88.0,
        "sentiment_score": 0.82
    }

    result = ScoringEngine.calculate_technology_score(sample_metric)
    assert "leadership_score" in result
    assert "breakdown" in result
    score = result["leadership_score"]
    assert 0.0 <= score <= 100.0

    breakdown = result["breakdown"]
    expected_keys = [
        "investment", "innovation", "adoption", "market_growth", "industry_interest"
    ]
    for key in expected_keys:
        assert key in breakdown
        assert 0.0 <= breakdown[key] <= 100.0
