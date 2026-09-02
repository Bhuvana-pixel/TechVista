from typing import Dict, Any, List
from app.utils.normalizer import min_max_scale, log_transform_scale, sentiment_to_100, clamp_100

class ScoringEngine:
    # Default Configurable Weights for Companies
    DEFAULT_COMPANY_WEIGHTS = {
        "financial_strength": 0.20,
        "market_position": 0.15,
        "investment": 0.15,
        "rd": 0.15,
        "innovation": 0.15,
        "workforce_growth": 0.10,
        "sentiment": 0.10,
    }

    # Default Configurable Weights for Technologies
    DEFAULT_TECH_WEIGHTS = {
        "investment": 0.20,
        "innovation": 0.20,
        "adoption": 0.20,
        "market_growth": 0.20,
        "industry_interest": 0.20,
    }

    @classmethod
    def calculate_company_score(
        cls,
        metric: Dict[str, Any],
        weights: Dict[str, float] = None,
        cohort_stats: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Calculates normalized 0-100 Company Leadership Score and factor components.
        metric expected keys:
        revenue, revenue_growth, profit_margin, market_cap, market_share,
        investment, rd_spending, patents, employee_growth, sentiment_score, technology_adoption
        """
        w = weights or cls.DEFAULT_COMPANY_WEIGHTS

        # Defaults if cohort_stats not provided
        stats = cohort_stats or {
            "rev_growth_min": -20.0, "rev_growth_max": 80.0,
            "margin_min": -20.0, "margin_max": 50.0,
            "mcap_min": 10.0, "mcap_max": 3500.0, # Billion USD
            "mkt_share_min": 0.0, "mkt_share_max": 80.0,
            "inv_min": 0.5, "inv_max": 50.0,
            "rd_min": 0.5, "rd_max": 45.0,
            "patents_min": 100, "patents_max": 10000,
            "emp_growth_min": -15.0, "emp_growth_max": 40.0
        }

        # 1. Financial Strength (20%): Blend of revenue growth & profit margin
        scaled_rev_growth = min_max_scale(metric.get("revenue_growth", 0.0), stats["rev_growth_min"], stats["rev_growth_max"])
        scaled_margin = min_max_scale(metric.get("profit_margin", 0.0), stats["margin_min"], stats["margin_max"])
        financial_strength = round(0.5 * scaled_rev_growth + 0.5 * scaled_margin, 2)

        # 2. Market Position (15%): Log scaled market cap & market share
        scaled_mcap = log_transform_scale(metric.get("market_cap", 50.0), stats["mcap_min"], stats["mcap_max"])
        scaled_share = min_max_scale(metric.get("market_share", 5.0), stats["mkt_share_min"], stats["mkt_share_max"])
        market_position = round(0.5 * scaled_mcap + 0.5 * scaled_share, 2)

        # 3. Investment (15%): Capital expenditure & venture deployment
        investment_score = round(min_max_scale(metric.get("investment", 1.0), stats["inv_min"], stats["inv_max"]), 2)

        # 4. R&D (15%): Absolute and relative R&D deployment
        rd_score = round(min_max_scale(metric.get("rd_spending", 1.0), stats["rd_min"], stats["rd_max"]), 2)

        # 5. Innovation (15%): Patents and tech adoption index
        scaled_patents = min_max_scale(metric.get("patents", 500), stats["patents_min"], stats["patents_max"])
        tech_adopt = clamp_100(metric.get("technology_adoption", 50.0))
        innovation_score = round(0.5 * scaled_patents + 0.5 * tech_adopt, 2)

        # 6. Workforce Growth (10%): Net talent influx
        workforce_score = round(min_max_scale(metric.get("employee_growth", 0.0), stats["emp_growth_min"], stats["emp_growth_max"]), 2)

        # 7. Sentiment (10%): News and investor sentiment mapped to 0-100
        sentiment_score = sentiment_to_100(metric.get("sentiment_score", 0.0))

        # Weighted calculation
        total_score = (
            financial_strength * w["financial_strength"] +
            market_position * w["market_position"] +
            investment_score * w["investment"] +
            rd_score * w["rd"] +
            innovation_score * w["innovation"] +
            workforce_score * w["workforce_growth"] +
            sentiment_score * w["sentiment"]
        )

        final_score = clamp_100(total_score)

        breakdown = {
            "financial_strength": financial_strength,
            "market_position": market_position,
            "investment": investment_score,
            "rd": rd_score,
            "innovation": innovation_score,
            "workforce_growth": workforce_score,
            "sentiment": sentiment_score
        }

        return {
            "leadership_score": final_score,
            "breakdown": breakdown,
            "weights": w
        }

    @classmethod
    def calculate_technology_score(
        cls,
        metric: Dict[str, Any],
        weights: Dict[str, float] = None,
        cohort_stats: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Calculates normalized 0-100 Technology Leadership Score.
        metric expected keys:
        investment, patent_count, research_papers, adoption_rate,
        market_size, market_growth, startup_count, job_postings,
        industry_interest, sentiment_score
        """
        w = weights or cls.DEFAULT_TECH_WEIGHTS

        stats = cohort_stats or {
            "inv_min": 1.0, "inv_max": 200.0, # Billion USD
            "patents_min": 500, "patents_max": 60000,
            "papers_min": 200, "papers_max": 30000,
            "adoption_min": 0.0, "adoption_max": 90.0,
            "growth_min": 5.0, "growth_max": 70.0, # % CAGR
            "startups_min": 50, "startups_max": 5000,
            "jobs_min": 5, "jobs_max": 300 # thousands
        }

        # 1. Investment (20%): Global funding & VC
        investment_score = round(min_max_scale(metric.get("investment", 10.0), stats["inv_min"], stats["inv_max"]), 2)

        # 2. Innovation (20%): Patents + Academic research papers
        scaled_patents = min_max_scale(metric.get("patent_count", 1000), stats["patents_min"], stats["patents_max"])
        scaled_papers = min_max_scale(metric.get("research_papers", 500), stats["papers_min"], stats["papers_max"])
        innovation_score = round(0.5 * scaled_patents + 0.5 * scaled_papers, 2)

        # 3. Adoption (20%): Enterprise adoption rate
        adoption_score = round(min_max_scale(metric.get("adoption_rate", 20.0), stats["adoption_min"], stats["adoption_max"]), 2)

        # 4. Market Growth (20%): Market CAGR %
        growth_score = round(min_max_scale(metric.get("market_growth", 15.0), stats["growth_min"], stats["growth_max"]), 2)

        # 5. Industry Interest (20%): Startups + Job postings + Sentiment
        scaled_startups = min_max_scale(metric.get("startup_count", 100), stats["startups_min"], stats["startups_max"])
        scaled_jobs = min_max_scale(metric.get("job_postings", 20), stats["jobs_min"], stats["jobs_max"])
        scaled_sentiment = sentiment_to_100(metric.get("sentiment_score", 0.0))
        interest_score = round(0.4 * scaled_startups + 0.4 * scaled_jobs + 0.2 * scaled_sentiment, 2)

        total_score = (
            investment_score * w["investment"] +
            innovation_score * w["innovation"] +
            adoption_score * w["adoption"] +
            growth_score * w["market_growth"] +
            interest_score * w["industry_interest"]
        )

        final_score = clamp_100(total_score)

        breakdown = {
            "investment": investment_score,
            "innovation": innovation_score,
            "adoption": adoption_score,
            "market_growth": growth_score,
            "industry_interest": interest_score
        }

        return {
            "leadership_score": final_score,
            "breakdown": breakdown,
            "weights": w
        }
