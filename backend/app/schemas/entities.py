from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# ================= AUTH SCHEMAS =================
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str
    password: str = Field(..., min_length=6)
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# ================= COMPANY SCHEMAS =================
class CompanyMetricOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    year: int
    revenue: float
    revenue_growth: float
    profit: float
    profit_margin: float
    market_cap: float
    stock_growth: float
    rd_spending: float
    investment: float
    patents: int
    employees: int
    employee_growth: float
    market_share: float
    technology_adoption: float
    sentiment_score: float
    innovation_score: float

class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    ticker: str
    industry: str
    sector: Optional[str] = None
    country: str
    state: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    leadership_score: Optional[float] = None
    future_potential: Optional[float] = None
    probability: Optional[float] = None
    rank: Optional[int] = None

class CompanyDetailOut(CompanyOut):
    metrics: List[CompanyMetricOut] = []
    latest_score_breakdown: Optional[Dict[str, float]] = None
    explanation: Optional[str] = None
    positive_factors: List[Dict[str, Any]] = []
    negative_factors: List[Dict[str, Any]] = []
    forecast_trajectory: List[Dict[str, Any]] = []


# ================= TECHNOLOGY SCHEMAS =================
class TechnologyMetricOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    year: int
    investment: float
    patent_count: int
    research_papers: int
    adoption_rate: float
    market_size: float
    market_growth: float
    startup_count: int
    job_postings: int
    industry_interest: float
    sentiment_score: float
    innovation_score: float

class TechnologyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    description: Optional[str] = None
    website: Optional[str] = None
    leadership_score: Optional[float] = None
    future_potential: Optional[float] = None
    probability: Optional[float] = None
    rank: Optional[int] = None

class TechnologyDetailOut(TechnologyOut):
    metrics: List[TechnologyMetricOut] = []
    latest_score_breakdown: Optional[Dict[str, float]] = None
    explanation: Optional[str] = None
    positive_factors: List[Dict[str, Any]] = []
    negative_factors: List[Dict[str, Any]] = []
    forecast_trajectory: List[Dict[str, Any]] = []


# ================= PREDICTION & FORECAST SCHEMAS =================
class PredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entity_type: str
    entity_id: int
    prediction_year: int
    leadership_score: float
    future_potential: float
    probability: float
    confidence: float
    factor_contributions: Optional[Dict[str, Any]] = None
    explanation: Optional[str] = None
    model_version: str
    created_at: datetime

class ForecastItem(BaseModel):
    year: int
    leadership_score: float
    future_potential: float
    probability: float
    lower_bound: float
    upper_bound: float
    confidence: float

class ForecastResponse(BaseModel):
    entity_id: int
    entity_name: str
    entity_type: str
    current_year: int
    current_score: float
    confidence: float
    forecasts: List[ForecastItem]
    disclaimer: str = (
        "Forecasts represent model-based estimates derived from historical and current indicators. "
        "They are not guaranteed predictions of future market performance."
    )


# ================= RANKING SCHEMAS =================
class CompanyRankingItem(BaseModel):
    rank: int
    id: int
    name: str
    ticker: str
    industry: str
    country: str
    state: Optional[str] = None
    leadership_score: float
    future_potential: float
    probability: float
    trend: str # "Bullish", "Neutral", "Bearish"
    market_cap: float
    revenue_growth: float

class TechnologyRankingItem(BaseModel):
    rank: int
    id: int
    name: str
    category: str
    leadership_score: float
    future_potential: float
    probability: float
    trend: str
    market_size: float
    adoption_rate: float


# ================= DASHBOARD & COMPARISON SCHEMAS =================
class DashboardKpis(BaseModel):
    companies_analyzed: int
    technologies_analyzed: int
    top_company: str
    top_company_score: float
    top_technology: str
    top_technology_score: float
    average_company_score: float
    average_tech_score: float
    high_potential_count: int
    data_freshness: str

class DashboardResponse(BaseModel):
    kpis: DashboardKpis
    top_companies: List[CompanyRankingItem]
    top_technologies: List[TechnologyRankingItem]
    market_growth_trends: List[Dict[str, Any]]
    investment_trends: List[Dict[str, Any]]
    innovation_trends: List[Dict[str, Any]]
    forecast_comparison: List[Dict[str, Any]]


# ================= NEWS SCHEMAS =================
class NewsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    source: str
    url: Optional[str] = None
    published_at: datetime
    sentiment: str
    sentiment_score: float
    company_name: Optional[str] = None
    technology_name: Optional[str] = None


# ================= DATA SOURCE & ADMIN SCHEMAS =================
class DataSourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    source_type: str
    source_url: Optional[str] = None
    last_updated: datetime
    status: str

class ModelVersionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    model_name: str
    version: str
    algorithm: str
    dataset_size: int
    metrics: Dict[str, Any]
    features: List[str]
    status: str
    created_at: datetime

class IngestionLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source: str
    status: str
    records_processed: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class SystemStatusOut(BaseModel):
    backend_status: str
    database_status: str
    active_model_companies: str
    active_model_technologies: str
    total_companies: int
    total_technologies: int
    total_metrics_records: int
    memory_usage_mb: float
