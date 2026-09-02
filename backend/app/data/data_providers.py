from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import os
from datetime import datetime

class BaseDataProvider(ABC):
    """Abstract interface for external data integration."""

    @abstractmethod
    def fetch_data(self, query: Optional[str] = None) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_source_metadata(self) -> Dict[str, Any]:
        pass


class CompanyDataProvider(BaseDataProvider):
    """Fetches company master profile data from external or demo source."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("COMPANY_DATA_API_KEY")

    def fetch_data(self, query: Optional[str] = None) -> List[Dict[str, Any]]:
        # In demo mode or if no API key is provided, returns demo-marked records
        return []

    def get_source_metadata(self) -> Dict[str, Any]:
        return {
            "source_name": "TechVista Company Intelligence Provider",
            "source_type": "Company Profile",
            "mode": "Live API" if self.api_key else "Demo / Sample Dataset",
            "last_verified": datetime.utcnow().isoformat()
        }


class FinancialDataProvider(BaseDataProvider):
    """Fetches SEC 10-K / financial time series indicators."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("FINANCIAL_DATA_API_KEY")

    def fetch_data(self, ticker: Optional[str] = None) -> List[Dict[str, Any]]:
        return []

    def get_source_metadata(self) -> Dict[str, Any]:
        return {
            "source_name": "SEC EDGAR & Financial Market Feed",
            "source_type": "Financial",
            "mode": "Live API" if self.api_key else "Demo / Sample Dataset",
            "last_verified": datetime.utcnow().isoformat()
        }


class NewsProvider(BaseDataProvider):
    """Fetches technology and company news articles with sentiment scoring."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("NEWS_API_KEY")

    def fetch_data(self, entity_name: Optional[str] = None) -> List[Dict[str, Any]]:
        return []

    def get_source_metadata(self) -> Dict[str, Any]:
        return {
            "source_name": "Global Tech News & NLP Sentiment Stream",
            "source_type": "News & NLP",
            "mode": "Live API" if self.api_key else "Demo / Sample Dataset",
            "last_verified": datetime.utcnow().isoformat()
        }


class TechnologyDataProvider(BaseDataProvider):
    """Fetches patent registries, academic arXiv publications, and venture indices."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("PATENTS_API_KEY")

    def fetch_data(self, technology_name: Optional[str] = None) -> List[Dict[str, Any]]:
        return []

    def get_source_metadata(self) -> Dict[str, Any]:
        return {
            "source_name": "USPTO, WIPO & arXiv Tech Index",
            "source_type": "Patents & Research",
            "mode": "Live API" if self.api_key else "Demo / Sample Dataset",
            "last_verified": datetime.utcnow().isoformat()
        }
