# MERIDIAN — Multi-Asset Portfolio Optimization Platform

Institutional-grade cross-asset portfolio optimization and risk engine built on modern portfolio theory (Markowitz), minimum variance risk minimization, and equal risk parity algorithms.

---

## 🏛️ Architecture Overview

```
rp/
├── backend/                  # FastAPI Quantitative Backend
│   ├── data/
│   │   ├── loader.py         # yfinance live fetch + SQLite cache + CSV fallback
│   │   └── features.py       # Returns, log returns, rolling vol & correlations
│   ├── engine/
│   │   ├── optimize.py       # SLSQP: MinVar, Markowitz (Max Sharpe), Risk Parity
│   │   ├── backtest.py       # Fixed-weights daily rebalancing simulation & metrics
│   │   └── risk.py           # Marginal risk contributions & turnover estimation
│   ├── api/
│   │   ├── routes/           # /assets, /prices, /optimize, /backtest, /risk-report, /compare
│   │   └── models.py         # Pydantic schemas
│   ├── db/
│   │   └── cache.py          # SQLite TTL price cache
│   ├── Datasets/             # Fallback historical data (12 assets)
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
│
├── frontend/                 # React + TypeScript + Vanilla CSS (DESIGN.md)
│   ├── src/
│   │   ├── components/       # GradientMesh, NavBar, KpiCard, Charts, Heatmap, Footer
│   │   ├── pages/            # BuilderPage, DashboardPage, AnalyzePage, ComparePage
│   │   ├── styles/           # index.css (complete DESIGN.md tokens & ss01/tnum)
│   │   ├── api/client.ts     # Typed API client
│   │   └── App.tsx
│   ├── vite.config.ts        # Vite dev server with /api proxy
│   └── package.json
│
├── docker-compose.yml        # Multi-service container orchestration
└── DESIGN.md                 # Design system guidelines
```

---

## 🚀 Quick Start

### 1. Run with Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs (Swagger): `http://localhost:8000/docs`

### 2. Run Locally

#### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

#### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

---

## 📊 Features & Models

1. **Portfolio Optimization**:
   - **Minimum Variance**: Minimizes portfolio volatility $w^T \Sigma w$.
   - **Markowitz Mean-Variance**: Maximizes Sharpe ratio $\frac{w^T \mu}{\sqrt{w^T \Sigma w}}$.
   - **Equal Risk Parity**: Solves for weights where every asset contributes equally to total portfolio risk.
2. **Backtesting & Metrics**:
   - Daily rebalancing with customizable transaction cost / slippage.
   - Cumulative Wealth Trajectory, Peak-to-Trough Drawdowns, and 63-day Rolling Sharpe.
   - Sharpe, Sortino, CAGR, Annualized Volatility, and Max Drawdown.
3. **Interactive Correlation Matrix**:
   - Custom CSS-grid heatmap dynamically mapping Pearson return correlations from ruby (-1.0) to electric indigo (+1.0).
4. **"Analyze My Portfolio" Mode**:
   - User-defined custom weights with automatic normalization and live stress testing.
5. **Universe Comparison**:
   - Side-by-side comparative backtesting (e.g. 10-Asset Traditional vs 12-Asset with Crypto).
