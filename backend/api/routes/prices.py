from fastapi import APIRouter, HTTPException
from starlette.concurrency import run_in_threadpool
import pandas as pd
from api.models import PricesRequest, PricesResponse
from data.loader import fetch_prices

router = APIRouter()


@router.post("", response_model=PricesResponse)
async def get_prices(req: PricesRequest):
    if len(req.tickers) == 0:
        raise HTTPException(status_code=400, detail="At least one ticker is required.")

    try:
        df = await run_in_threadpool(fetch_prices, req.tickers, req.start_date, req.end_date)
        if df.empty:
            raise HTTPException(status_code=404, detail="No price data found for given parameters.")

        dates = [pd.to_datetime(d).strftime("%Y-%m-%d") for d in df["Date"]]
        series = {}
        for ticker in req.tickers:
            norm_ticker = ticker.lower()
            if norm_ticker in df.columns:
                series[norm_ticker] = [float(x) for x in df[norm_ticker].tolist()]

        return PricesResponse(dates=dates, series=series)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
