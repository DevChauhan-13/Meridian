from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field


class AssetItem(BaseModel):
    id: str
    ticker: str
    name: str
    asset_class: str


class AssetsResponse(BaseModel):
    assets: List[AssetItem]


class PricesRequest(BaseModel):
    tickers: List[str]
    start_date: str
    end_date: str


class PricesResponse(BaseModel):
    dates: List[str]
    series: Dict[str, List[float]]


class OptimizeRequest(BaseModel):
    tickers: List[str]
    start_date: str
    end_date: str
    strategies: List[str] = ["MinVar", "Markowitz", "RiskParity"]


class OptimizeResponse(BaseModel):
    weights: Dict[str, Dict[str, float]]
    mu: Dict[str, float]
    cov: Dict[str, Dict[str, float]]
    asset_names: List[str]


class BacktestRequest(BaseModel):
    tickers: List[str]
    start_date: str
    end_date: str
    weights: Dict[str, Dict[str, float]]
    transaction_cost: float = 0.0


class StrategyBacktestResult(BaseModel):
    dates: List[str]
    wealth: List[float]
    drawdown: List[float]
    rolling_sharpe: List[float]
    metrics: Dict[str, float]


class BacktestResponse(BaseModel):
    results: Dict[str, StrategyBacktestResult]


class RiskReportRequest(BaseModel):
    tickers: List[str]
    start_date: str
    end_date: str
    weights: Dict[str, Dict[str, float]]


class RiskContribItem(BaseModel):
    asset: str
    weight: float
    risk_contrib_pct: float


class StressTestPeriod(BaseModel):
    mean_daily: float
    ann_vol: float
    sharpe: float
    count: int


class StressTestResult(BaseModel):
    stressed_period: StressTestPeriod
    normal_period: StressTestPeriod
    volatility_threshold: float


class StrategyRiskReport(BaseModel):
    risk_contributions: List[RiskContribItem]
    stress_test: StressTestResult
    turnover: float


class RiskReportResponse(BaseModel):
    results: Dict[str, StrategyRiskReport]


class CompareRequest(BaseModel):
    universe_a: List[str]
    universe_b: List[str]
    start_date: str
    end_date: str
    strategies: List[str] = ["MinVar", "Markowitz", "RiskParity"]


class UniverseSummary(BaseModel):
    tickers: List[str]
    weights: Dict[str, Dict[str, float]]
    backtest: BacktestResponse


class CompareResponse(BaseModel):
    universe_a: UniverseSummary
    universe_b: UniverseSummary
    summary_comparison: List[Dict[str, Any]]
