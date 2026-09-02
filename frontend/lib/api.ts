import {
  Company,
  CompanyDetail,
  Technology,
  TechnologyDetail,
  RankingItem,
  ForecastResponse,
  DashboardData,
  NewsItem,
  DataSourceItem,
  ModelVersionItem,
  SystemStatus,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

class ApiService {
  private static token: string | null = null;

  public static setToken(t: string | null) {
    this.token = t;
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem("techvista_token", t);
      else localStorage.removeItem("techvista_token");
    }
  }

  public static getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("techvista_token");
    }
    return this.token;
  }

  public static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint.startsWith("/api") ? "" : "/api"}${endpoint}`;
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Default to JSON body if not FormData
    if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errDetail = `HTTP Error ${response.status}`;
        try {
          const errJson = await response.json();
          errDetail = errJson.detail || errDetail;
        } catch {}
        throw new Error(errDetail);
      }

      return await response.json();
    } catch (error: any) {
      console.warn(`[API] Fetch failed for ${url}:`, error.message);
      throw error;
    }
  }

  // Health
  public static async checkHealth(): Promise<{ status: string; uptime: string }> {
    return this.request("/health");
  }

  // Dashboard
  public static async getDashboard(): Promise<DashboardData> {
    return this.request("/dashboard");
  }

  // Companies
  public static async getCompanies(query?: string): Promise<Company[]> {
    return this.request(`/companies${query ? `?${query}` : ""}`);
  }

  public static async getCompanyDetail(id: number): Promise<CompanyDetail> {
    return this.request(`/companies/${id}`);
  }

  // Technologies
  public static async getTechnologies(query?: string): Promise<Technology[]> {
    return this.request(`/technologies${query ? `?${query}` : ""}`);
  }

  public static async getTechnologyDetail(id: number): Promise<TechnologyDetail> {
    return this.request(`/technologies/${id}`);
  }

  // Rankings
  public static async getCompanyRankings(params?: string): Promise<RankingItem[]> {
    return this.request(`/rankings/companies${params ? `?${params}` : ""}`);
  }

  public static async getTechnologyRankings(params?: string): Promise<RankingItem[]> {
    return this.request(`/rankings/technologies${params ? `?${params}` : ""}`);
  }

  // Forecasts
  public static async getCompanyForecast(id: number): Promise<ForecastResponse> {
    return this.request(`/forecasts/company/${id}`);
  }

  public static async getTechnologyForecast(id: number): Promise<ForecastResponse> {
    return this.request(`/forecasts/technology/${id}`);
  }

  // Comparison
  public static async compareCompanies(ids: number[]): Promise<any> {
    return this.request(`/compare/companies?ids=${ids.join(",")}`);
  }

  public static async compareTechnologies(ids: number[]): Promise<any> {
    return this.request(`/compare/technologies?ids=${ids.join(",")}`);
  }

  // News
  public static async getNews(params?: string): Promise<NewsItem[]> {
    return this.request(`/news${params ? `?${params}` : ""}`);
  }

  // Data Sources
  public static async getDataSources(): Promise<DataSourceItem[]> {
    return this.request("/data-sources");
  }

  // Admin
  public static async getSystemStatus(): Promise<SystemStatus> {
    return this.request("/admin/status");
  }

  public static async getModelVersions(): Promise<ModelVersionItem[]> {
    return this.request("/admin/models");
  }

  public static async getIngestionLogs(): Promise<any[]> {
    return this.request("/admin/logs");
  }

  public static async uploadCsv(formData: FormData): Promise<any> {
    return this.request("/admin/data/upload", {
      method: "POST",
      body: formData,
    });
  }

  public static async trainCompanyModel(): Promise<any> {
    return this.request("/ml/train/company", { method: "POST" });
  }

  public static async trainTechnologyModel(): Promise<any> {
    return this.request("/ml/train/technology", { method: "POST" });
  }

  // Auth
  public static async login(credentials: { email: string; password: string }): Promise<any> {
    const res: any = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }

  public static async register(userData: any): Promise<any> {
    const res: any = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
    }
    return res;
  }
}

export default ApiService;
