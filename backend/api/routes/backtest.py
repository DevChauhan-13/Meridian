from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool
import pandas as pd
from api.models import BacktestRequest, BacktestResponse, StrategyBacktestResult
from data.loader import fetch_prices
from data.features import add_features
from engine.backtest import backtest_fixed_weights

router = APIRouter()


@router.post("", response_model=BacktestResponse)
async def backtest(req: BacktestRequest):
    if not req.weights:
        raise HTTPException(status_code=400, detail="Portfolio weights must be provided.")

    try:
        df = await run_in_threadpool(fetch_prices, req.tickers, req.start_date, req.end_date)
        if len(df) < 70:
            raise HTTPException(
                status_code=400,
                detail=f"Date range produced only {len(df)} trading days. At least 70 trading days are required."
            )

        df_feat = await run_in_threadpool(add_features, df)
        price_cols = [c.lower() for c in req.tickers if c.lower() in df.columns]

        asset_rets = df_feat[[f"{c}_ret" for c in price_cols]].copy()
        asset_rets.columns = price_cols
        dates = [pd.to_datetime(d).strftime("%Y-%m-%d") for d in df_feat["Date"]]

        results = {}
        for strat_name, w_dict in req.weights.items():
            w_vector = [float(w_dict.get(col, 0.0)) for col in price_cols]
            bt = await run_in_threadpool(
                backtest_fixed_weights,
                w_vector,
                asset_rets,
                req.transaction_cost,
                1.0,
            )

            results[strat_name] = StrategyBacktestResult(
                dates=dates,
                wealth=[round(float(x), 4) for x in bt["wealth"].tolist()],
                drawdown=[round(float(x), 4) for x in bt["drawdown"].tolist()],
                rolling_sharpe=[round(float(x), 4) for x in bt["rolling_sharpe"].tolist()],
                metrics={k: round(float(v), 4) for k, v in bt["metrics"].items()},
            )

        return BacktestResponse(results=results)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
