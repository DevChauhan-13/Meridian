import numpy as np
import pandas as pd

ANN_FACTOR = 252.0


def annualized_return(ret_series: pd.Series) -> float:
    total_periods = len(ret_series)
    if total_periods <= 1:
        return 0.0
    cum = (1.0 + ret_series).prod()
    if cum <= 0:
        return -1.0
    val = float(cum ** (ANN_FACTOR / total_periods) - 1.0)
    return 0.0 if np.isnan(val) else val


def annualized_vol(ret_series: pd.Series) -> float:
    if len(ret_series) <= 1:
        return 0.0
    val = float(ret_series.std(ddof=1) * np.sqrt(ANN_FACTOR))
    return 0.0 if np.isnan(val) else val


def sharpe_ratio(ret_series: pd.Series, rf: float = 0.0) -> float:
    vol = ret_series.std(ddof=1)
    if vol == 0 or np.isnan(vol) or len(ret_series) <= 1:
        return 0.0
    mean_ex = ret_series.mean() - rf / ANN_FACTOR
    val = float(mean_ex / vol * np.sqrt(ANN_FACTOR))
    return 0.0 if np.isnan(val) else val


def sortino_ratio(ret_series: pd.Series, rf: float = 0.0, target: float = 0.0) -> float:
    neg_ret = ret_series[ret_series < target]
    if len(neg_ret) == 0:
        return 0.0
    dd = np.sqrt((neg_ret**2).mean()) * np.sqrt(ANN_FACTOR)
    if dd == 0 or np.isnan(dd):
        return 0.0
    mean_ex = ret_series.mean() - rf / ANN_FACTOR
    val = float(mean_ex * np.sqrt(ANN_FACTOR) / dd)
    return 0.0 if np.isnan(val) else val


def max_drawdown(wealth_series: pd.Series) -> float:
    running_max = wealth_series.cummax()
    drawdown = (wealth_series - running_max) / running_max
    val = float(drawdown.min())
    return 0.0 if np.isnan(val) else val


def backtest_fixed_weights(
    weights: np.ndarray | list[float],
    asset_rets: pd.DataFrame,
    transaction_cost: float = 0.0,
    starting_capital: float = 1.0,
) -> dict:
    w = np.asarray(weights, dtype=float)
    if len(w) != asset_rets.shape[1]:
        raise ValueError(
            f"Weights length ({len(w)}) must match assets count ({asset_rets.shape[1]})"
        )

    # Normalize weights
    if np.sum(w) > 0:
        w = w / np.sum(w)

    raw_rets = asset_rets.values @ w
    port_rets = pd.Series(raw_rets, index=asset_rets.index)

    if transaction_cost > 0:
        # Approximate daily rebalance friction based on drift
        # Effective weight drift before rebalancing:
        # w_eff_i = w_i * (1 + r_i) / (1 + r_port)
        # turnover = sum(|w_i - w_eff_i|)
        gross_asset_returns = 1.0 + asset_rets.values
        gross_port_returns = 1.0 + raw_rets[:, None]
        drifted_w = (w[None, :] * gross_asset_returns) / np.clip(
            gross_port_returns, 1e-6, None
        )
        turnover = np.sum(np.abs(w[None, :] - drifted_w), axis=1)
        cost_impact = turnover * transaction_cost
        port_rets = port_rets - cost_impact

    wealth = (1.0 + port_rets).cumprod() * starting_capital
    running_max = wealth.cummax()
    drawdown = (wealth - running_max) / running_max

    # 63-day rolling Sharpe (quarterly trading days)
    rolling_vol = port_rets.rolling(window=63).std(ddof=1) * np.sqrt(ANN_FACTOR)
    rolling_mean = port_rets.rolling(window=63).mean() * ANN_FACTOR
    rolling_sharpe = rolling_mean / rolling_vol.replace(0, np.nan)
    rolling_sharpe = rolling_sharpe.bfill().fillna(0.0)

    cum_return = float((wealth.iloc[-1] / starting_capital) - 1.0) if len(wealth) > 0 else 0.0
    cagr = annualized_return(port_rets)
    vol = annualized_vol(port_rets)
    sharpe = sharpe_ratio(port_rets)
    sortino = sortino_ratio(port_rets)
    mdd = max_drawdown(wealth)

    return {
        "wealth": wealth,
        "drawdown": drawdown,
        "rolling_sharpe": rolling_sharpe,
        "returns": port_rets,
        "metrics": {
            "Cumulative Return": cum_return,
            "CAGR": cagr,
            "Volatility": vol,
            "Sharpe": sharpe,
            "Sortino": sortino,
            "Max Drawdown": mdd,
        },
    }


def stress_test_by_volatility(
    port_rets: pd.Series,
    asset_rets: pd.DataFrame,
    top_pct: float = 0.20,
) -> dict:
    rolling_vols = port_rets.rolling(20).std()
    threshold = rolling_vols.quantile(1.0 - top_pct)
    stress_mask = rolling_vols >= threshold

    stressed_rets = port_rets[stress_mask].dropna()
    normal_rets = port_rets[~stress_mask].dropna()

    def get_period_stats(s: pd.Series):
        if len(s) < 2:
            return {"mean_daily": 0.0, "ann_vol": 0.0, "sharpe": 0.0, "count": len(s)}
        return {
            "mean_daily": float(s.mean()),
            "ann_vol": annualized_vol(s),
            "sharpe": sharpe_ratio(s),
            "count": int(len(s)),
        }

    return {
        "stressed_period": get_period_stats(stressed_rets),
        "normal_period": get_period_stats(normal_rets),
        "volatility_threshold": float(threshold) if not np.isnan(threshold) else 0.0,
    }
