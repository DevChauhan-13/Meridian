import os
import sqlite3
from datetime import datetime, timezone, timedelta
import pandas as pd

DB_PATH = os.path.join(os.path.dirname(__file__), "prices.db")
TTL_HOURS = 24


def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS prices (
            ticker TEXT NOT NULL,
            date TEXT NOT NULL,
            close REAL NOT NULL,
            fetched_at TEXT NOT NULL,
            PRIMARY KEY (ticker, date)
        )
        """
    )
    conn.commit()
    return conn


def is_stale(fetched_at_str: str) -> bool:
    try:
        fetched_at = datetime.fromisoformat(fetched_at_str)
        now = datetime.now(timezone.utc)
        if fetched_at.tzinfo is None:
            fetched_at = fetched_at.replace(tzinfo=timezone.utc)
        return (now - fetched_at) > timedelta(hours=TTL_HOURS)
    except Exception:
        return True


def get_cached_prices(ticker: str, start: str, end: str) -> pd.DataFrame | None:
    conn = get_connection()
    try:
        query = """
            SELECT date, close, fetched_at 
            FROM prices 
            WHERE ticker = ? AND date >= ? AND date <= ?
            ORDER BY date ASC
        """
        cursor = conn.cursor()
        cursor.execute(query, (ticker, start, end))
        rows = cursor.fetchall()
        if not rows:
            return None

        # Check staleness on latest row
        latest_fetch = rows[-1][2]
        if is_stale(latest_fetch):
            return None

        df = pd.DataFrame(rows, columns=["Date", ticker, "fetched_at"])
        df["Date"] = pd.to_datetime(df["Date"])
        df = df.drop(columns=["fetched_at"])
        return df
    finally:
        conn.close()


def write_prices(ticker: str, df: pd.DataFrame) -> None:
    if df.empty or "Date" not in df.columns or ticker not in df.columns:
        return
    conn = get_connection()
    try:
        now_str = datetime.now(timezone.utc).isoformat()
        records = [
            (
                ticker,
                pd.to_datetime(row["Date"]).strftime("%Y-%m-%d"),
                float(row[ticker]),
                now_str,
            )
            for _, row in df.iterrows()
            if pd.notna(row[ticker])
        ]
        conn.executemany(
            """
            INSERT INTO prices (ticker, date, close, fetched_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(ticker, date) DO UPDATE SET
                close = excluded.close,
                fetched_at = excluded.fetched_at
            """,
            records,
        )
        conn.commit()
    finally:
        conn.close()
