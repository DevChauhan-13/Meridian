export interface AssetItem {
  id: string;
  ticker: string;
  name: string;
  asset_class: 'equities' | 'commodities' | 'crypto';
}

export interface AssetsResponse {
  assets: AssetItem[];
}

export interface PricesRequest {
  tickers: string[];
  start_date: string;
  end_date: string;
}

export interface PricesResponse {
  dates: string[];
  series: Record<string, number[]>;
}

export interface OptimizeRequest {
  tickers: string[];
  start_date: string;
  end_date: string;
  strategies?: string[];
}

export interface OptimizeResponse {
  weights: Record<string, Record<string, number>>;
  mu: Record<string, number>;
  cov: Record<string, Record<string, number>>;
  asset_names: string[];
}

export interface BacktestRequest {
  tickers: string[];
  start_date: string;
  end_date: string;
  weights: Record<string, Record<string, number>>;
  transaction_cost?: number;
}

export interface StrategyBacktestResult {
  dates: string[];
  wealth: number[];
  drawdown: number[];
  rolling_sharpe: number[];
  metrics: {
    'Cumulative Return': number;
    CAGR: number;
    Volatility: number;
    Sharpe: number;
    Sortino: number;
    'Max Drawdown': number;
  };
}

export interface BacktestResponse {
  results: Record<string, StrategyBacktestResult>;
}

export interface RiskReportRequest {
  tickers: string[];
  start_date: string;
  end_date: string;
  weights: Record<string, Record<string, number>>;
}

export interface RiskContribItem {
  asset: string;
  weight: number;
  risk_contrib_pct: number;
}

export interface StressTestPeriod {
  mean_daily: number;
  ann_vol: number;
  sharpe: number;
  count: number;
}

export interface StressTestResult {
  stressed_period: StressTestPeriod;
  normal_period: StressTestPeriod;
  volatility_threshold: number;
}

export interface StrategyRiskReport {
  risk_contributions: RiskContribItem[];
  stress_test: StressTestResult;
  turnover: number;
}

export interface RiskReportResponse {
  results: Record<string, StrategyRiskReport>;
}

export interface CompareRequest {
  universe_a: string[];
  universe_b: string[];
  start_date: string;
  end_date: string;
  strategies?: string[];
}

export interface UniverseSummary {
  tickers: string[];
  weights: Record<string, Record<string, number>>;
  backtest: BacktestResponse;
}

export interface CompareResponse {
  universe_a: UniverseSummary;
  universe_b: UniverseSummary;
  summary_comparison: Array<{
    strategy: string;
    metric: string;
    universe_a: number;
    universe_b: number;
    delta: number;
  }>;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errorDetail = errJson.detail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const apiClient = {
  getAssets: async (): Promise<AssetsResponse> => {
    const res = await fetch(`${API_BASE}/assets`);
    return handleResponse<AssetsResponse>(res);
  },

  getPrices: async (req: PricesRequest): Promise<PricesResponse> => {
    const res = await fetch(`${API_BASE}/prices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return handleResponse<PricesResponse>(res);
  },

  optimize: async (req: OptimizeRequest): Promise<OptimizeResponse> => {
    const res = await fetch(`${API_BASE}/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return handleResponse<OptimizeResponse>(res);
  },

  backtest: async (req: BacktestRequest): Promise<BacktestResponse> => {
    const res = await fetch(`${API_BASE}/backtest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return handleResponse<BacktestResponse>(res);
  },

  riskReport: async (req: RiskReportRequest): Promise<RiskReportResponse> => {
    const res = await fetch(`${API_BASE}/risk-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return handleResponse<RiskReportResponse>(res);
  },

  compare: async (req: CompareRequest): Promise<CompareResponse> => {
    const res = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return handleResponse<CompareResponse>(res);
  },
};
