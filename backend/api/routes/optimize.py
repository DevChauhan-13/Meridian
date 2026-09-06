from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool
from api.models import OptimizeRequest, OptimizeResponse
from data.loader import fetch_prices
from data.features import add_features
from engine.optimize import optimize_portfolio

router = APIRouter()


@router.post("", response_model=OptimizeResponse)
async def optimize(req: OptimizeRequest):
    if len(req.tickers) < 2:
        raise HTTPException(
            status_code=400, detail="At least 2 assets are required to optimize a portfolio."
        )

    try:
        df = await run_in_threadpool(fetch_prices, req.tickers, req.start_date, req.end_date)
        if len(df) < 70:
            raise HTTPException(
                status_code=400,
                detail=f"Date range produced only {len(df)} trading days. At least 70 trading days are required for rolling features."
            )

        df_feat = await run_in_threadpool(add_features, df)
        if len(df_feat) < 10:
            raise HTTPException(
                status_code=400,
                detail="Insufficient data remaining after computing rolling features."
            )

        price_cols, weights_dict, cov_matrix, mu = await run_in_threadpool(
            optimize_portfolio, df_feat, req.strategies
        )

        formatted_weights = {}
        for strat, w in weights_dict.items():
            formatted_weights[strat] = {
                col: round(float(w[i]), 5) for i, col in enumerate(price_cols)
            }

        formatted_mu = {col: round(float(mu[col]), 5) for col in price_cols}
        formatted_cov = {
            row_col: {
                col: round(float(cov_matrix.loc[row_col, col]), 6)
                for col in price_cols
            }
            for row_col in price_cols
        }

        return OptimizeResponse(
            weights=formatted_weights,
            mu=formatted_mu,
            cov=formatted_cov,
            asset_names=price_cols,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
