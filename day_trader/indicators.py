import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import MACD, EMAIndicator

from config import RSI_OVERSOLD, RSI_OVERBOUGHT, EMA_FAST, EMA_SLOW
from config import MACD_FAST, MACD_SLOW, MACD_SIGNAL


def add_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute RSI, MACD, and dual-EMA and return an enriched copy of df.
    Returns df unchanged if fewer than 30 rows are present.

    Added columns: rsi, macd_line, macd_signal, macd_hist, ema_fast, ema_slow
    """
    if len(df) < 30:
        return df

    df = df.copy()
    close = df["Close"]

    df["rsi"] = _compute_rsi(close)
    df["macd_line"], df["macd_signal"], df["macd_hist"] = _compute_macd(close)
    df["ema_fast"], df["ema_slow"] = _compute_emas(close)

    return df


def _compute_rsi(close: pd.Series) -> pd.Series:
    return RSIIndicator(close=close, window=14).rsi()


def _compute_macd(close: pd.Series) -> tuple[pd.Series, pd.Series, pd.Series]:
    obj = MACD(
        close=close,
        window_slow=MACD_SLOW,
        window_fast=MACD_FAST,
        window_sign=MACD_SIGNAL,
    )
    return obj.macd(), obj.macd_signal(), obj.macd_diff()


def _compute_emas(close: pd.Series) -> tuple[pd.Series, pd.Series]:
    fast = EMAIndicator(close=close, window=EMA_FAST).ema_indicator()
    slow = EMAIndicator(close=close, window=EMA_SLOW).ema_indicator()
    return fast, slow
