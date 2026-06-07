FOREX_SYMBOLS: dict[str, str] = {
    "EUR/USD": "EURUSD=X",
    "GBP/USD": "GBPUSD=X",
    "USD/JPY": "USDJPY=X",
    "EUR/GBP": "EURGBP=X",
}

INDEX_SYMBOLS: dict[str, str] = {
    "DAX":       "^GDAXI",
    "S&P 500":   "^GSPC",
    "NASDAQ":    "^IXIC",
    "Dow Jones": "^DJI",
}

ALL_SYMBOLS: dict[str, str] = {**FOREX_SYMBOLS, **INDEX_SYMBOLS}

# yfinance period for each interval (intraday data limited to last 60 days)
INTERVAL_PERIOD_MAP: dict[str, str] = {
    "5m":  "5d",
    "15m": "5d",
    "1h":  "30d",
    "4h":  "60d",  # synthetic: download 1h, resample to 4h
    "1d":  "6mo",
}

# Intervals natively supported by yfinance (4h is synthetic via resampling)
NATIVE_INTERVALS: set[str] = {"5m", "15m", "1h", "1d"}

RSI_OVERSOLD:  int = 30
RSI_OVERBOUGHT: int = 70

EMA_FAST: int = 9
EMA_SLOW: int = 21

MACD_FAST:   int = 12
MACD_SLOW:   int = 26
MACD_SIGNAL: int = 9

SIGNAL_BUY     = "BUY"
SIGNAL_SELL    = "SELL"
SIGNAL_NEUTRAL = "NEUTRAL"

REFRESH_OPTIONS: dict[str, int] = {
    "30 Sekunden": 30_000,
    "1 Minute":    60_000,
    "2 Minuten":   120_000,
    "5 Minuten":   300_000,
}
