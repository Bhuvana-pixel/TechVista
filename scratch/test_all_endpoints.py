import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

endpoints = [
    "/api/health",
    "/api/dashboard/overview",
    "/api/dashboard/top-performers",
    "/api/dashboard/market-trends",
    "/api/companies",
    "/api/companies/locations",
    "/api/companies/1",
    "/api/technologies",
    "/api/technologies/1",
    "/api/rankings/companies",
    "/api/rankings/technologies",
    "/api/forecasts/companies",
    "/api/forecasts/technologies",
    "/api/forecasts/accuracy",
    "/api/compare/companies?company_ids=1,2",
    "/api/compare/technologies?tech_ids=1,2",
    "/api/geographic/companies",
    "/api/geographic/distribution",
    "/api/geographic/regional-breakdown",
    "/api/news",
    "/api/data-sources",
    "/api/ml/status",
]

errors = []
for ep in endpoints:
    try:
        res = client.get(ep)
        print(f"{ep} -> {res.status_code}")
        if res.status_code != 200:
            errors.append((ep, res.status_code, res.text))
    except Exception as e:
        print(f"EXCEPTION on {ep}: {e}")
        errors.append((ep, "EXCEPTION", str(e)))

if errors:
    print("\n--- ERRORS FOUND ---")
    for err in errors:
        print(err)
else:
    print("\nAll endpoints returned 200 OK!")
