import pandas as pd
import yfinance as yf

from config import INTERVAL_PERIOD_MAP

# Simple in-memory TTL cache to avoid Streamlit dependency at module level
_cache: dict = {}


def fetch_ohlcv(ticker: str, interval: str, ttl_hint: int = 30) -> pd.DataFrame:
    """
    Download OHLCV data for ticker at the given interval.
    ttl_hint is a dummy parameter used by app.py to signal desired cache freshness.
    For synthetic '4h', downloads 1h and resamples.
    Returns DataFrame with DatetimeIndex (UTC) and columns [Open, High, Low, Close, Volume].
    Returns empty DataFrame on any network error.
    """
    import time
    cache_key = (ticker, interval, ttl_hint)
    if cache_key in _cache:
        cached_df, cached_at = _cache[cache_key]
        if time.time() - cached_at < ttl_hint:
            return cached_df

    df = _download_ohlcv(ticker, interval)
    _cache[cache_key] = (df, time.time())
    return df


def _download_ohlcv(ticker: str, interval: str) -> pd.DataFrame:
    empty = pd.DataFrame(columns=["Open", "High", "Low", "Close", "Volume"])
    fetch_interval = "1h" if interval == "4h" else interval
    period = INTERVAL_PERIOD_MAP[interval]

    try:
        ticker_obj = yf.Ticker(ticker)
        df = ticker_obj.history(period=period, interval=fetch_interval)

        if df.empty:
            fallback_periods = {"5d": "30d", "30d": "60d", "60d": "1y", "6mo": "1y"}
            fallback = fallback_periods.get(period)
            if fallback:
                df = ticker_obj.history(period=fallback, interval=fetch_interval)

        if df.empty:
            return empty

        df = df[["Open", "High", "Low", "Close", "Volume"]].copy()
        df = df.dropna(subset=["Close"])

        if df.index.tzinfo is None:
            df.index = df.index.tz_localize("UTC")
        else:
            df.index = df.index.tz_convert("UTC")

        if interval == "4h":
            df = _resample_to_4h(df)

        return df
    except Exception:
        return empty


def _resample_to_4h(df: pd.DataFrame) -> pd.DataFrame:
    resampled = df.resample("4h", origin="epoch").agg({
        "Open":   "first",
        "High":   "max",
        "Low":    "min",
        "Close":  "last",
        "Volume": "sum",
    })
    return resampled.dropna(subset=["Close"])


def get_latest_price(ticker: str) -> float | None:
    try:
        df = yf.Ticker(ticker).history(period="1d", interval="1m")
        if df.empty:
            return None
        return float(df["Close"].iloc[-1])
    except Exception:
        return None
