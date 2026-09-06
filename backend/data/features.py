import numpy as np
import pandas as pd


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes simple returns, log returns, rolling 20-day volatility,
    and rolling 60-day pairwise correlations.
    Drops burn-in rows with NaN.
    """
    df = df.copy()
    price_cols = [c for c in df.columns if c != "Date"]

    # 1) Simple returns
    for col in price_cols:
        df[f"{col}_ret"] = df[col].pct_change()

    # 2) Log returns
    for col in price_cols:
        df[f"{col}_logret"] = np.log(df[col] / df[col].shift(1))

    # 3) Rolling 20-day volatility (annualized or standard sample std)
    for col in price_cols:
        df[f"{col}_vol20"] = df[f"{col}_ret"].rolling(window=20).std()

    # 4) Rolling 60-day pairwise correlation
    for i, c1 in enumerate(price_cols):
        for j, c2 in enumerate(price_cols):
            if c1 < c2:
                df[f"corr_{c1}_{c2}"] = (
                    df[f"{c1}_ret"].rolling(60).corr(df[f"{c2}_ret"])
                )

    # 5) Drop initial NaN rows
    df = df.dropna().reset_index(drop=True)
    return df
