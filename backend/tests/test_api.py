import pytest
from app.models.entities import Company, CompanyMetric, Technology, TechnologyMetric, Prediction
import json

def test_api_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "environment" in data

def test_api_dashboard_and_companies(client, db_session):
    # Insert test company and metrics
    comp = Company(
        name="Test Robotics Corp",
        ticker="TRC",
        industry="Robotics",
        country="United States",
        description="Pioneering automated robotics systems."
    )
    db_session.add(comp)
    db_session.commit()
    db_session.refresh(comp)

    metric = CompanyMetric(
        company_id=comp.id,
        year=2025,
        revenue=10.0,
        revenue_growth=22.0,
        profit=2.5,
        profit_margin=25.0,
        market_cap=80.0,
        rd_spending=2.2,
        investment=1.5,
        patents=450,
        technology_adoption=82.0,
        sentiment_score=0.70
    )
    db_session.add(metric)

    pred = Prediction(
        entity_type="company",
        entity_id=comp.id,
        prediction_year=2030,
        leadership_score=78.5,
        future_potential=85.0,
        probability=0.82,
        confidence=0.85,
        model_version="v1.0"
    )
    db_session.add(pred)
    db_session.commit()

    # Test GET /api/companies
    res_companies = client.get("/api/companies")
    assert res_companies.status_code == 200
    comp_list = res_companies.json()
    assert len(comp_list) >= 1
    assert comp_list[0]["ticker"] == "TRC"

    # Test GET /api/companies/{id}
    res_detail = client.get(f"/api/companies/{comp.id}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["name"] == "Test Robotics Corp"
    assert "metrics" in detail
    assert "latest_score_breakdown" in detail

    # Test GET /api/rankings/companies
    res_rankings = client.get("/api/rankings/companies")
    assert res_rankings.status_code == 200
    rankings = res_rankings.json()
    assert len(rankings) >= 1
    assert rankings[0]["rank"] == 1

    # Test GET /api/forecasts/company/{id}
    res_forecast = client.get(f"/api/forecasts/company/{comp.id}")
    assert res_forecast.status_code == 200
    forecast = res_forecast.json()
    assert "forecasts" in forecast
    assert "disclaimer" in forecast

    # Test GET /api/compare/companies
    res_compare = client.get(f"/api/compare/companies?ids={comp.id}")
    assert res_compare.status_code == 200
    comp_data = res_compare.json()
    assert "entities" in comp_data
    assert "radar_data" in comp_data
