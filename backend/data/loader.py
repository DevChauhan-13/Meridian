import os
import logging
from datetime import datetime
import numpy as np
import pandas as pd
import yfinance as yf

from db.cache import get_cached_prices, write_prices

logger = logging.getLogger(__name__)

DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "Datasets")

ASSETS_METADATA = {
    # Equities
    "amazon": {
        "ticker": "AMZN",
        "name": "Amazon.com Inc.",
        "class": "equities",
        "csv": "Amazon.com Stock Price History.csv",
    },
    "apple": {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "class": "equities",
        "csv": "Apple Stock Price History.csv",
    },
    "meta": {
        "ticker": "META",
        "name": "Meta Platforms Inc.",
        "class": "equities",
        "csv": "Meta Platforms Stock Price History.csv",
    },
    "microsoft": {
        "ticker": "MSFT",
        "name": "Microsoft Corporation",
        "class": "equities",
        "csv": "Microsoft Stock Price History.csv",
    },
    "nvidia": {
        "ticker": "NVDA",
        "name": "NVIDIA Corporation",
        "class": "equities",
        "csv": "NVIDIA Stock Price History.csv",
    },
    "tesla": {
        "ticker": "TSLA",
        "name": "Tesla Inc.",
        "class": "equities",
        "csv": "Tesla Stock Price History.csv",
    },
    "nasdaq": {
        "ticker": "^NDX",
        "name": "Nasdaq 100",
        "class": "equities",
        "csv": "Nasdaq 100 Historical Data.csv",
    },
    # Commodities
    "gold": {
        "ticker": "GC=F",
        "name": "Gold Futures",
        "class": "commodities",
        "csv": "Gold Futures Historical Data.csv",
    },
    "silver": {
        "ticker": "SI=F",
        "name": "Silver Futures",
        "class": "commodities",
        "csv": "Silver Futures Historical Data.csv",
    },
    "crude": {
        "ticker": "CL=F",
        "name": "Crude Oil WTI",
        "class": "commodities",
        "csv": "Crude Oil WTI Futures Historical Data.csv",
    },
    # Crypto
    "btc": {
        "ticker": "BTC-USD",
        "name": "Bitcoin (USD)",
        "class": "crypto",
        "csv": "BTC_USD Bitfinex Historical Data.csv",
    },
    "eth": {
        "ticker": "ETH-USD",
        "name": "Ethereum (USD)",
        "class": "crypto",
        "csv": "ETH_USD Binance Historical Data.csv",
    },
}


def convert_volume(vol_str):
    if isinstance(vol_str, (int, float)):
        return vol_str
    if pd.isna(vol_str):
        return np.nan
    vol_str = str(vol_str).strip().lower()
    if vol_str.endswith("m"):
        return float(vol_str[:-1]) * 1_000_000
    elif vol_str.endswith("k"):
        return float(vol_str[:-1]) * 1_000
    elif vol_str.endswith("b"):
        return float(vol_str[:-1]) * 1_000_000_000
    else:
        try:
            return float(vol_str)
        except Exception:
            return np.nan


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df.dropna(subset=["Date"]).sort_values("Date").reset_index(drop=True)

    numeric_cols = [c for c in ["Price", "Open", "High", "Low"] if c in df.columns]
    for col in numeric_cols:
        df[col] = (
            df[col]
            .astype(str)
            .str.replace(",", "", regex=False)
            .str.replace("$", "", regex=False)
        )
        df[col] = pd.to_numeric(df[col], errors="coerce")

    if "Change %" in df.columns:
        df["pct_change"] = (
            df["Change %"]
            .astype(str)
            .str.replace("%", "", regex=False)
            .str.replace(",", "", regex=False)
        )
        df["pct_change"] = pd.to_numeric(df["pct_change"], errors="coerce") / 100
        df = df.drop(columns=["Change %"])

    if "Vol." in df.columns:
        df["volume"] = df["Vol."].apply(convert_volume)
        df = df.drop(columns=["Vol."])

    df = df.ffill().bfill()
    return df


def load_from_csv(asset_id: str, start: str, end: str) -> pd.DataFrame | None:
    meta = ASSETS_METADATA.get(asset_id.lower())
    if not meta or "csv" not in meta:
        return None
    csv_path = os.path.join(DATASETS_DIR, meta["csv"])
    if not os.path.exists(csv_path):
        return None
    try:
        raw_df = pd.read_csv(csv_path)
        cleaned = clean_dataset(raw_df)
        target_col = "Price" if "Price" in cleaned.columns else "Close"
        sub = cleaned[["Date", target_col]].rename(columns={target_col: asset_id})
        start_dt = pd.to_datetime(start)
        end_dt = pd.to_datetime(end)
        sub = sub[(sub["Date"] >= start_dt) & (sub["Date"] <= end_dt)]
        if not sub.empty:
            return sub
    except Exception as e:
        logger.warning(f"Error reading CSV for {asset_id}: {e}")
    return None


def fetch_single_asset(asset_id: str, start: str, end: str) -> pd.DataFrame:
    norm_id = asset_id.lower()
    meta = ASSETS_METADATA.get(norm_id)
    if not meta:
        raise ValueError(f"Unknown asset identifier: {asset_id}")

    # 1. Try Cache
    cached = get_cached_prices(norm_id, start, end)
    if cached is not None and len(cached) > 10:
        return cached

    # 2. Try yfinance
    yf_symbol = meta["ticker"]
    df_yf = None
    try:
        data = yf.download(
            yf_symbol, start=start, end=end, progress=False, auto_adjust=True
        )
        if data is not None and not data.empty:
            if isinstance(data.columns, pd.MultiIndex):
                # Flatten multiindex if present
                data.columns = [c[0] for c in data.columns]
            price_col = "Close" if "Close" in data.columns else data.columns[0]
            df_yf = data[[price_col]].reset_index()
            df_yf.rename(columns={"Date": "Date", price_col: norm_id}, inplace=True)
            df_yf["Date"] = pd.to_datetime(df_yf["Date"]).dt.tz_localize(None)
            df_yf = df_yf.dropna().sort_values("Date").reset_index(drop=True)
    except Exception as e:
        logger.warning(f"yfinance failed for {norm_id} ({yf_symbol}): {e}")

    if df_yf is not None and len(df_yf) >= 10:
        write_prices(norm_id, df_yf)
        return df_yf

    # 3. Fallback to CSV
    csv_df = load_from_csv(norm_id, start, end)
    if csv_df is not None and not csv_df.empty:
        write_prices(norm_id, csv_df)
        return csv_df

    if df_yf is not None and not df_yf.empty:
        write_prices(norm_id, df_yf)
        return df_yf

    raise RuntimeError(f"Could not retrieve historical data for asset: {asset_id}")


def fetch_prices(assets: list[str], start: str, end: str) -> pd.DataFrame:
    merged_df = pd.DataFrame()
    for asset in assets:
        df_single = fetch_single_asset(asset, start, end)
        temp = df_single[["Date", asset.lower()]].copy()
        if merged_df.empty:
            merged_df = temp
        else:
            merged_df = pd.merge(merged_df, temp, on="Date", how="outer")

    merged_df = merged_df.sort_values("Date").reset_index(drop=True)
    # Forward fill gaps up to 5 days
    merged_df = merged_df.ffill(limit=5)
    # Drop rows that still have NaN
    merged_df = merged_df.dropna().reset_index(drop=True)
    return merged_df
