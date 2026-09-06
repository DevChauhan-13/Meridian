import numpy as np
import pandas as pd


def risk_contrib(weights: np.ndarray | list[float], cov: np.ndarray) -> np.ndarray:
    """
    Computes per-asset risk contribution to total portfolio volatility.
    Returns array of fractional risk contributions summing to 1.0.
    """
    w = np.asarray(weights, dtype=float)
    cov_mat = np.asarray(cov, dtype=float)

    if np.sum(w) > 0:
        w = w / np.sum(w)

    port_var = float(w @ cov_mat @ w)
    port_vol = np.sqrt(max(port_var, 1e-10))

    mrc = cov_mat @ w
    rc = (w * mrc) / port_vol

    total_rc = np.sum(rc)
    if total_rc > 0:
        return rc / total_rc
    return np.ones(len(w)) / len(w)


def estimate_turnover(
    weights: np.ndarray | list[float],
    asset_rets: pd.DataFrame,
) -> float:
    """
    Estimates average daily turnover required to maintain target fixed weights.
    Returns average turnover percentage per trading day.
    """
    w = np.asarray(weights, dtype=float)
    if np.sum(w) > 0:
        w = w / np.sum(w)

    gross_assets = 1.0 + asset_rets.values
    port_rets = asset_rets.values @ w
    gross_port = 1.0 + port_rets[:, None]

    drifted_w = (w[None, :] * gross_assets) / np.clip(gross_port, 1e-6, None)
    # Sum of absolute rebalancing adjustments / 2
    daily_turnover = np.sum(np.abs(w[None, :] - drifted_w), axis=1) / 2.0
    return float(np.mean(daily_turnover))
