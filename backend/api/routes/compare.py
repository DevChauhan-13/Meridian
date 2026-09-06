from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool
import pandas as pd
from api.models import (
    CompareRequest,
    CompareResponse,
    UniverseSummary,
    BacktestResponse,
    StrategyBacktestResult,
)
from data.loader import fetch_prices
from data.features import add_features
from engine.optimize import optimize_portfolio
from engine.backtest import backtest_fixed_weights

router = APIRouter()


async def process_universe(
    tickers: list[str], start_date: str, end_date: str, strategies: list[str]
) -> tuple[dict, BacktestResponse]:
    df = await run_in_threadpool(fetch_prices, tickers, start_date, end_date)
    if len(df) < 70:
        raise HTTPException(
            status_code=400,
            detail=f"Universe has insufficient data ({len(df)} days) for analysis.",
        )
    df_feat = await run_in_threadpool(add_features, df)
    price_cols, weights_dict, cov_matrix, mu = await run_in_threadpool(
        optimize_portfolio, df_feat, strategies
    )

    formatted_weights = {}
    for strat, w in weights_dict.items():
        formatted_weights[strat] = {
            col: round(float(w[i]), 4) for i, col in enumerate(price_cols)
        }

    asset_rets = df_feat[[f"{c}_ret" for c in price_cols]].copy()
    asset_rets.columns = price_cols
    dates = [pd.to_datetime(d).strftime("%Y-%m-%d") for d in df_feat["Date"]]

    bt_results = {}
    for strat_name, w_vector in weights_dict.items():
        bt = await run_in_threadpool(
            backtest_fixed_weights, w_vector, asset_rets, 0.0, 1.0
        )
        bt_results[strat_name] = StrategyBacktestResult(
            dates=dates,
            wealth=[round(float(x), 4) for x in bt["wealth"].tolist()],
            drawdown=[round(float(x), 4) for x in bt["drawdown"].tolist()],
            rolling_sharpe=[round(float(x), 4) for x in bt["rolling_sharpe"].tolist()],
            metrics={k: round(float(v), 4) for k, v in bt["metrics"].items()},
        )

    return formatted_weights, BacktestResponse(results=bt_results)


@router.post("", response_model=CompareResponse)
async def compare_universes(req: CompareRequest):
    if len(req.universe_a) < 2 or len(req.universe_b) < 2:
        raise HTTPException(
            status_code=400,
            detail="Both universes must contain at least 2 assets for comparison.",
        )

    try:
        weights_a, bt_a = await process_universe(
            req.universe_a, req.start_date, req.end_date, req.strategies
        )
        weights_b, bt_b = await process_universe(
            req.universe_b, req.start_date, req.end_date, req.strategies
        )

        comparison_rows = []
        metrics_list = [
            "Cumulative Return",
            "CAGR",
            "Sharpe",
            "Sortino",
            "Max Drawdown",
            "Volatility",
        ]

        for strat in req.strategies:
            if strat in bt_a.results and strat in bt_b.results:
                m_a = bt_a.results[strat].metrics
                m_b = bt_b.results[strat].metrics
                for m in metrics_list:
                    val_a = m_a.get(m, 0.0)
                    val_b = m_b.get(m, 0.0)
                    delta = round(val_b - val_a, 4)
                    comparison_rows.append(
                        {
                            "strategy": strat,
                            "metric": m,
                            "universe_a": val_a,
                            "universe_b": val_b,
                            "delta": delta,
                        }
                    )

        return CompareResponse(
            universe_a=UniverseSummary(
                tickers=req.universe_a, weights=weights_a, backtest=bt_a
            ),
            universe_b=UniverseSummary(
                tickers=req.universe_b, weights=weights_b, backtest=bt_b
            ),
            summary_comparison=comparison_rows,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
