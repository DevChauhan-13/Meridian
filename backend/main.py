import os
import sys

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import assets, prices, optimize, backtest, risk_report, compare

app = FastAPI(
    title="Multi-Asset Portfolio Optimizer API",
    version="1.0.0",
    description="Quantitative multi-asset portfolio optimization and risk engine (MinVar, Markowitz, Risk Parity)",
)

# Allow local dev and production frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router, prefix="/assets", tags=["Assets"])
app.include_router(prices.router, prefix="/prices", tags=["Prices"])
app.include_router(optimize.router, prefix="/optimize", tags=["Optimization"])
app.include_router(backtest.router, prefix="/backtest", tags=["Backtest"])
app.include_router(risk_report.router, prefix="/risk-report", tags=["Risk"])
app.include_router(compare.router, prefix="/compare", tags=["Comparison"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "portfolio-backend"}
