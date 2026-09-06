from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool
import numpy as np
from api.models import (
    RiskReportRequest,
    RiskReportResponse,
    StrategyRiskReport,
    RiskContribItem,
    StressTestResult,
    StressTestPeriod,
)
from data.loader import fetch_prices
from data.features import add_features
from engine.risk import risk_contrib, estimate_turnover
from engine.backtest import stress_test_by_volatility

router = APIRouter()


@router.post("", response_model=RiskReportResponse)
async def get_risk_report(req: RiskReportRequest):
    if not req.weights:
        raise HTTPException(status_code=400, detail="Portfolio weights must be provided.")

    try:
        df = await run_in_threadpool(fetch_prices, req.tickers, req.start_date, req.end_date)
        if len(df) < 70:
            raise HTTPException(
                status_code=400,
                detail="At least 70 trading days are required for risk calculation."
            )

        df_feat = await run_in_threadpool(add_features, df)
        price_cols = [c.lower() for c in req.tickers if c.lower() in df.columns]

        asset_rets = df_feat[[f"{c}_ret" for c in price_cols]].copy()
        asset_rets.columns = price_cols
        cov_matrix = (df_feat[[f"{c}_logret" for c in price_cols]].cov() * 252.0).values

        results = {}
        for strat_name, w_dict in req.weights.items():
            w_vector = np.array([float(w_dict.get(col, 0.0)) for col in price_cols])
            if np.sum(w_vector) > 0:
                w_vector = w_vector / np.sum(w_vector)

            # Risk contribution
            rc = risk_contrib(w_vector, cov_matrix)
            rc_items = [
                RiskContribItem(
                    asset=price_cols[i],
                    weight=round(float(w_vector[i]), 4),
                    risk_contrib_pct=round(float(rc[i]), 4),
                )
                for i in range(len(price_cols))
            ]

            # Stress test
            port_rets = asset_rets.dot(w_vector)
            stress_raw = stress_test_by_volatility(port_rets, asset_rets)
            stress_result = StressTestResult(
                stressed_period=StressTestPeriod(
                    mean_daily=round(stress_raw["stressed_period"]["mean_daily"], 5),
                    ann_vol=round(stress_raw["stressed_period"]["ann_vol"], 4),
                    sharpe=round(stress_raw["stressed_period"]["sharpe"], 4),
                    count=stress_raw["stressed_period"]["count"],
                ),
                normal_period=StressTestPeriod(
                    mean_daily=round(stress_raw["normal_period"]["mean_daily"], 5),
                    ann_vol=round(stress_raw["normal_period"]["ann_vol"], 4),
                    sharpe=round(stress_raw["normal_period"]["sharpe"], 4),
                    count=stress_raw["normal_period"]["count"],
                ),
                volatility_threshold=round(stress_raw["volatility_threshold"], 5),
            )

            # Turnover
            turnover_val = estimate_turnover(w_vector, asset_rets)

            results[strat_name] = StrategyRiskReport(
                risk_contributions=rc_items,
                stress_test=stress_result,
                turnover=round(turnover_val, 4),
            )

        return RiskReportResponse(results=results)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
