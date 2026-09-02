export interface CompanyMetric {
  id: number;
  year: number;
  revenue: number;
  revenue_growth: number;
  profit: number;
  profit_margin: number;
  market_cap: number;
  stock_growth: number;
  rd_spending: number;
  investment: number;
  patents: number;
  employees: number;
  employee_growth: number;
  market_share: number;
  technology_adoption: number;
  sentiment_score: number;
  innovation_score: number;
}

export interface Company {
  id: number;
  name: string;
  ticker: string;
  industry: string;
  sector?: string;
  country: string;
  website?: string;
  description?: string;
  logo_url?: string;
  leadership_score?: number;
  future_potential?: number;
  probability?: number;
  rank?: number;
}

export interface FactorItem {
  feature: string;
  label: string;
  impact: number;
  display: string;
}

export interface FactorAttribution {
  positive_factors: FactorItem[];
  negative_factors: FactorItem[];
  text_explanation: string;
}

export interface CompanyDetail extends Company {
  metrics: CompanyMetric[];
  latest_score_breakdown?: Record<string, number>;
  explanation?: string;
  positive_factors: FactorItem[];
  negative_factors: FactorItem[];
  forecast_trajectory: Array<{
    year: number;
    leadership_score: number;
    future_potential?: number;
    probability?: number;
    confidence?: number;
    is_forecast: boolean;
  }>;
}

export interface TechnologyMetric {
  id: number;
  year: number;
  investment: number;
  patent_count: number;
  research_papers: number;
  adoption_rate: number;
  market_size: number;
  market_growth: number;
  startup_count: number;
  job_postings: number;
  industry_interest: number;
  sentiment_score: number;
  innovation_score: number;
}

export interface Technology {
  id: number;
  name: string;
  category: string;
  description?: string;
  website?: string;
  leadership_score?: number;
  future_potential?: number;
  probability?: number;
  rank?: number;
}

export interface TechnologyDetail extends Technology {
  metrics: TechnologyMetric[];
  latest_score_breakdown?: Record<string, number>;
  explanation?: string;
  positive_factors: FactorItem[];
  negative_factors: FactorItem[];
  forecast_trajectory: Array<{
    year: number;
    leadership_score: number;
    future_potential?: number;
    probability?: number;
    confidence?: number;
    is_forecast: boolean;
  }>;
}

export interface RankingItem {
  rank: number;
  id: number;
  name: string;
  ticker?: string;
  category?: string;
  industry?: string;
  country?: string;
  leadership_score: number;
  future_potential: number;
  probability: number;
  trend: string;
  market_cap?: number;
  revenue_growth?: number;
  market_size?: number;
  adoption_rate?: number;
}

export interface ForecastItem {
  year: number;
  leadership_score: number;
  future_potential: number;
  probability: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
}

export type HorizonPrediction = ForecastItem;

export interface ForecastResponse {
  entity_id: number;
  entity_name: string;
  entity_type: string;
  current_year: number;
  current_score: number;
  confidence: number;
  forecasts: ForecastItem[];
  disclaimer: string;
}

export interface DashboardData {
  kpis: {
    companies_analyzed: number;
    technologies_analyzed: number;
    top_company: string;
    top_company_score: number;
    top_technology: string;
    top_technology_score: number;
    average_company_score: number;
    average_tech_score: number;
    high_potential_count: number;
    data_freshness: string;
  };
  top_companies: RankingItem[];
  top_technologies: RankingItem[];
  market_growth_trends: Array<{
    year: number;
    company_growth: number;
    tech_market_growth: number;
  }>;
  investment_trends: Array<{
    year: number;
    enterprise_rd: number;
    tech_venture_investment: number;
  }>;
  innovation_trends: Array<{
    year: number;
    adoption_rate: number;
    patents_count: number;
  }>;
  forecast_comparison: Array<{
    entity: string;
    type: string;
    score_2025: number;
    score_2030: number;
    score_2040: number;
  }>;
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  url?: string;
  published_at: string;
  sentiment: string;
  sentiment_score: number;
  company_name?: string;
  technology_name?: string;
}

export interface DataSourceItem {
  id: number;
  name: string;
  source_type: string;
  source_url?: string;
  last_updated: string;
  status: string;
}

export interface ModelVersionItem {
  id: number;
  model_name: string;
  version: string;
  algorithm: string;
  dataset_size: number;
  metrics: Record<string, any>;
  features: string[];
  status: string;
  created_at: string;
}

export interface SystemStatus {
  backend_status: string;
  database_status: string;
  active_model_companies: string;
  active_model_technologies: string;
  total_companies: number;
  total_technologies: number;
  total_metrics_records: number;
  memory_usage_mb: number;
}
