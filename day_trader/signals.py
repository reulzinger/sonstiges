import pandas as pd

from config import (
    RSI_OVERSOLD, RSI_OVERBOUGHT,
    SIGNAL_BUY, SIGNAL_SELL, SIGNAL_NEUTRAL,
    ALL_SYMBOLS,
)
from data_feed import fetch_ohlcv
from indicators import add_indicators

SignalValue = str  # "BUY" | "SELL" | "NEUTRAL"


def rsi_signal(df: pd.DataFrame) -> SignalValue:
    if "rsi" not in df.columns or df["rsi"].isna().all():
        return SIGNAL_NEUTRAL
    val = df["rsi"].iloc[-1]
    if pd.isna(val):
        return SIGNAL_NEUTRAL
    if val < RSI_OVERSOLD:
        return SIGNAL_BUY
    if val > RSI_OVERBOUGHT:
        return SIGNAL_SELL
    return SIGNAL_NEUTRAL


def macd_signal(df: pd.DataFrame) -> SignalValue:
    if "macd_line" not in df.columns or len(df) < 2:
        return SIGNAL_NEUTRAL
    prev_macd   = df["macd_line"].iloc[-2]
    prev_sig    = df["macd_signal"].iloc[-2]
    last_macd   = df["macd_line"].iloc[-1]
    last_sig    = df["macd_signal"].iloc[-1]
    if any(pd.isna(v) for v in [prev_macd, prev_sig, last_macd, last_sig]):
        return SIGNAL_NEUTRAL
    # Bullish crossover: MACD crossed above signal
    if prev_macd <= prev_sig and last_macd > last_sig:
        return SIGNAL_BUY
    # Bearish crossover: MACD crossed below signal
    if prev_macd >= prev_sig and last_macd < last_sig:
        return SIGNAL_SELL
    return SIGNAL_NEUTRAL


def ema_crossover_signal(df: pd.DataFrame) -> SignalValue:
    if "ema_fast" not in df.columns or len(df) < 2:
        return SIGNAL_NEUTRAL
    prev_fast = df["ema_fast"].iloc[-2]
    prev_slow = df["ema_slow"].iloc[-2]
    last_fast = df["ema_fast"].iloc[-1]
    last_slow = df["ema_slow"].iloc[-1]
    if any(pd.isna(v) for v in [prev_fast, prev_slow, last_fast, last_slow]):
        return SIGNAL_NEUTRAL
    if prev_fast <= prev_slow and last_fast > last_slow:
        return SIGNAL_BUY
    if prev_fast >= prev_slow and last_fast < last_slow:
        return SIGNAL_SELL
    return SIGNAL_NEUTRAL


def _score(signal: SignalValue) -> int:
    return {SIGNAL_BUY: 1, SIGNAL_SELL: -1, SIGNAL_NEUTRAL: 0}[signal]


def combined_signal(df: pd.DataFrame) -> dict[str, SignalValue]:
    rsi  = rsi_signal(df)
    macd = macd_signal(df)
    ema  = ema_crossover_signal(df)
    score = _score(rsi) + _score(macd) + _score(ema)
    if score >= 1:
        verdict = SIGNAL_BUY
    elif score <= -1:
        verdict = SIGNAL_SELL
    else:
        verdict = SIGNAL_NEUTRAL
    return {"rsi": rsi, "macd": macd, "ema": ema, "combined": verdict}


def build_signal_table(interval: str) -> pd.DataFrame:
    rows = []
    for label, ticker in ALL_SYMBOLS.items():
        try:
            df = fetch_ohlcv(ticker, interval)
            df = add_indicators(df)
            sigs = combined_signal(df)
            price = df["Close"].iloc[-1] if not df.empty else None
            rsi_val = df["rsi"].iloc[-1] if "rsi" in df.columns and not df["rsi"].isna().all() else None
            rows.append({
                "Symbol":    label,
                "Kurs":      round(price, 4) if price is not None else "–",
                "RSI":       round(rsi_val, 1) if rsi_val is not None and not pd.isna(rsi_val) else "–",
                "MACD":      sigs["macd"],
                "EMA":       sigs["ema"],
                "Signal":    sigs["combined"],
            })
        except Exception:
            rows.append({
                "Symbol": label,
                "Kurs":   "–",
                "RSI":    "–",
                "MACD":   "–",
                "EMA":    "–",
                "Signal": "–",
            })
    return pd.DataFrame(rows)
