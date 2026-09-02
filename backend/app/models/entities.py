from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # "admin" or "user"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    ticker = Column(String(20), unique=True, index=True, nullable=False)
    industry = Column(String(100), index=True, nullable=False)
    sector = Column(String(100), nullable=True)
    country = Column(String(50), default="United States", index=True)
    website = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    metrics = relationship("CompanyMetric", back_populates="company", cascade="all, delete-orphan")
    news = relationship("News", back_populates="company", cascade="all, delete-orphan")


class CompanyMetric(Base):
    __tablename__ = "company_metrics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    year = Column(Integer, index=True, nullable=False)

    revenue = Column(Float, default=0.0)          # in billions USD
    revenue_growth = Column(Float, default=0.0)   # percentage (e.g. 15.2)
    profit = Column(Float, default=0.0)           # in billions USD
    profit_margin = Column(Float, default=0.0)    # percentage
    market_cap = Column(Float, default=0.0)       # in billions USD
    stock_growth = Column(Float, default=0.0)     # percentage
    rd_spending = Column(Float, default=0.0)      # in billions USD
    investment = Column(Float, default=0.0)       # in billions USD
    patents = Column(Integer, default=0)          # annual patents granted
    employees = Column(Integer, default=0)
    employee_growth = Column(Float, default=0.0)  # percentage
    market_share = Column(Float, default=0.0)     # percentage
    technology_adoption = Column(Float, default=50.0) # 0-100 index
    sentiment_score = Column(Float, default=0.0)  # -1.0 to +1.0
    innovation_score = Column(Float, default=50.0) # 0-100 calculated score

    company = relationship("Company", back_populates="metrics")

    __table_args__ = (
        Index("idx_company_year", "company_id", "year", unique=True),
    )


class Technology(Base):
    __tablename__ = "technologies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    metrics = relationship("TechnologyMetric", back_populates="technology", cascade="all, delete-orphan")
    news = relationship("News", back_populates="technology", cascade="all, delete-orphan")


class TechnologyMetric(Base):
    __tablename__ = "technology_metrics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    technology_id = Column(Integer, ForeignKey("technologies.id", ondelete="CASCADE"), nullable=False, index=True)
    year = Column(Integer, index=True, nullable=False)

    investment = Column(Float, default=0.0)          # Global VC / R&D investment in billions USD
    patent_count = Column(Integer, default=0)        # Global active patents
    research_papers = Column(Integer, default=0)     # Annual peer-reviewed publications
    adoption_rate = Column(Float, default=0.0)       # 0-100 enterprise adoption %
    market_size = Column(Float, default=0.0)         # in billions USD
    market_growth = Column(Float, default=0.0)       # CAGR %
    startup_count = Column(Integer, default=0)       # Active startups tracked
    job_postings = Column(Integer, default=0)        # Thousands of postings
    industry_interest = Column(Float, default=50.0)  # 0-100 index
    sentiment_score = Column(Float, default=0.0)    # -1.0 to +1.0
    innovation_score = Column(Float, default=50.0)   # 0-100 calculated score

    technology = relationship("Technology", back_populates="metrics")

    __table_args__ = (
        Index("idx_tech_year", "technology_id", "year", unique=True),
    )


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    entity_type = Column(String(20), index=True, nullable=False)  # "company" or "technology"
    entity_id = Column(Integer, index=True, nullable=False)
    prediction_year = Column(Integer, index=True, nullable=False) # 2027, 2030, 2035, 2040

    leadership_score = Column(Float, nullable=False)  # 0-100
    future_potential = Column(Float, nullable=False)  # 0-100
    probability = Column(Float, nullable=False)       # 0.0 to 1.0 (leadership probability)
    confidence = Column(Float, default=0.82)          # 0.0 to 1.0 confidence score
    factor_contributions = Column(Text, nullable=True) # JSON string of positive/negative SHAP/feature attributions
    explanation = Column(Text, nullable=True)         # Human-readable synthesized explanation
    model_version = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_pred_entity", "entity_type", "entity_id", "prediction_year"),
    )


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(20), nullable=False)
    algorithm = Column(String(50), nullable=False)
    dataset_size = Column(Integer, default=0)
    features = Column(Text, nullable=True)            # JSON string of feature names
    metrics = Column(Text, nullable=True)             # JSON string of R2, MAE, RMSE, etc.
    status = Column(String(20), default="active")     # "active", "archived", "candidate"
    created_at = Column(DateTime, default=datetime.utcnow)


class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    technology_id = Column(Integer, ForeignKey("technologies.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    source = Column(String(100), nullable=False)
    url = Column(String(500), nullable=True)
    published_at = Column(DateTime, default=datetime.utcnow, index=True)
    sentiment = Column(String(20), default="Neutral") # "Bullish", "Positive", "Neutral", "Cautious", "Bearish"
    sentiment_score = Column(Float, default=0.0)      # -1.0 to 1.0

    company = relationship("Company", back_populates="news")
    technology = relationship("Technology", back_populates="news")


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    source_type = Column(String(50), nullable=False)  # "Financial", "Patents", "News", "Market", "Adoption"
    source_url = Column(String(255), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="Active")     # "Active", "Cached", "Demo Mode"


class IngestionLog(Base):
    __tablename__ = "ingestion_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False)       # "SUCCESS", "FAILED", "RUNNING"
    records_processed = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
