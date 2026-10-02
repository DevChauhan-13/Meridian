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

# Include routes with and without /api prefix for Vercel service rewrite compatibility
for prefix, router, tag in [
    ("/assets", assets.router, "Assets"),
    ("/prices", prices.router, "Prices"),
    ("/optimize", optimize.router, "Optimization"),
    ("/backtest", backtest.router, "Backtest"),
    ("/risk-report", risk_report.router, "Risk"),
    ("/compare", compare.router, "Comparison"),
]:
    app.include_router(router, prefix=prefix, tags=[tag])
    app.include_router(router, prefix=f"/api{prefix}", tags=[tag])


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "portfolio-backend"}

