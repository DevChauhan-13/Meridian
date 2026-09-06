import numpy as np
import pandas as pd
from scipy.optimize import minimize


def clean_weights(w: np.ndarray) -> np.ndarray:
    w = np.clip(w, 0, 1)
    s = np.sum(w)
    if s > 0:
        return w / s
    return np.ones(len(w)) / len(w)


def optimize_portfolio(
    df_feat: pd.DataFrame,
    strategies: list[str] = None,
) -> tuple[list[str], dict[str, np.ndarray], pd.DataFrame, pd.Series]:
    """
    Runs MinVar, Markowitz (Max Sharpe), and Risk Parity optimizations.
    Returns:
        price_cols: list of asset column names
        weights: dict of {strategy_name: np.ndarray of weights}
        cov_matrix: annualized covariance DataFrame
        mu: annualized expected returns Series
    """
    if strategies is None:
        strategies = ["MinVar", "Markowitz", "RiskParity"]

    # Select original price columns
    price_cols = [
        c
        for c in df_feat.columns
        if (
            "_ret" not in c
            and "_logret" not in c
            and "_vol" not in c
            and "corr_" not in c
            and c != "Date"
        )
    ]

    log_returns = df_feat[[f"{c}_logret" for c in price_cols]]
    mu = log_returns.mean() * 252.0
    mu.index = price_cols

    cov_matrix = log_returns.cov() * 252.0
    cov_matrix.columns = price_cols
    cov_matrix.index = price_cols
    cov = cov_matrix.values

    n = len(price_cols)
    w0 = np.ones(n) / n
    bounds = [(0.0, 1.0)] * n
    constraint = {"type": "eq", "fun": lambda w: np.sum(w) - 1.0}

    results = {}

    if "MinVar" in strategies:
        def port_var(w):
            return w @ cov @ w

        res_minvar = minimize(
            port_var, w0, method="SLSQP", bounds=bounds, constraints=constraint
        )
        results["MinVar"] = clean_weights(res_minvar.x if res_minvar.success else w0)

    if "Markowitz" in strategies:
        mu_vals = mu.values

        def neg_sharpe(w):
            ret = w @ mu_vals
            vol = np.sqrt(max(w @ cov @ w, 1e-10))
            return -(ret / vol)

        res_markowitz = minimize(
            neg_sharpe, w0, method="SLSQP", bounds=bounds, constraints=constraint
        )
        results["Markowitz"] = clean_weights(
            res_markowitz.x if res_markowitz.success else w0
        )

    if "RiskParity" in strategies:
        def rp_loss(w):
            port_vol = np.sqrt(max(w @ cov @ w, 1e-10))
            mrc = cov @ w
            rc = (w * mrc) / port_vol
            target_rc = port_vol / n
            return np.sum((rc - target_rc) ** 2)

        res_rp = minimize(
            rp_loss, w0, method="SLSQP", bounds=bounds, constraints=constraint
        )
        results["RiskParity"] = clean_weights(res_rp.x if res_rp.success else w0)

    return price_cols, results, cov_matrix, mu
