import datetime
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st
from streamlit_autorefresh import st_autorefresh

from config import (
    ALL_SYMBOLS, FOREX_SYMBOLS, INDEX_SYMBOLS,
    REFRESH_OPTIONS, EMA_FAST, EMA_SLOW,
    MACD_FAST, MACD_SLOW, MACD_SIGNAL,
    SIGNAL_BUY, SIGNAL_SELL, SIGNAL_NEUTRAL,
)
from data_feed import fetch_ohlcv
from indicators import add_indicators
from signals import combined_signal, build_signal_table

BADGE_CSS: dict[str, str] = {
    SIGNAL_BUY:     "background:#1b5e20;color:white;padding:8px 24px;border-radius:8px;font-size:1.5em;font-weight:bold;display:inline-block;",
    SIGNAL_SELL:    "background:#b71c1c;color:white;padding:8px 24px;border-radius:8px;font-size:1.5em;font-weight:bold;display:inline-block;",
    SIGNAL_NEUTRAL: "background:#424242;color:white;padding:8px 24px;border-radius:8px;font-size:1.5em;font-weight:bold;display:inline-block;",
}

SIGNAL_COLORS: dict[str, str] = {
    SIGNAL_BUY:     "#1b5e20",
    SIGNAL_SELL:    "#b71c1c",
    SIGNAL_NEUTRAL: "#424242",
}


def render_sidebar() -> tuple[str, str, str, int]:
    st.sidebar.title("Day Trader")
    st.sidebar.markdown("---")

    market = st.sidebar.radio("Markt", ["Alle", "Forex", "Indizes"])
    if market == "Forex":
        symbol_map = FOREX_SYMBOLS
    elif market == "Indizes":
        symbol_map = INDEX_SYMBOLS
    else:
        symbol_map = ALL_SYMBOLS

    symbol_label = st.sidebar.selectbox("Symbol", list(symbol_map.keys()))
    ticker = symbol_map[symbol_label]

    interval = st.sidebar.selectbox("Zeitrahmen", ["5m", "15m", "1h", "4h", "1d"], index=2)

    refresh_label = st.sidebar.selectbox("Auto-Refresh", list(REFRESH_OPTIONS.keys()), index=1)
    refresh_ms = REFRESH_OPTIONS[refresh_label]

    st.sidebar.markdown("---")
    st.sidebar.caption(f"Letzte Aktualisierung: {datetime.datetime.now(datetime.timezone.utc).strftime('%H:%M:%S UTC')}")

    return ticker, symbol_label, interval, refresh_label, refresh_ms


def build_candlestick_chart(df: pd.DataFrame, symbol_label: str) -> go.Figure:
    fig = make_subplots(
        rows=3, cols=1,
        shared_xaxes=True,
        row_heights=[0.60, 0.20, 0.20],
        vertical_spacing=0.04,
        subplot_titles=(symbol_label, f"RSI (14)", f"MACD ({MACD_FAST}, {MACD_SLOW}, {MACD_SIGNAL})"),
    )

    # Row 1: Candlestick
    fig.add_trace(go.Candlestick(
        x=df.index,
        open=df["Open"], high=df["High"],
        low=df["Low"], close=df["Close"],
        name="Kurs",
        increasing_line_color="#26a69a",
        decreasing_line_color="#ef5350",
        showlegend=False,
    ), row=1, col=1)

    if "ema_fast" in df.columns:
        fig.add_trace(go.Scatter(
            x=df.index, y=df["ema_fast"],
            name=f"EMA {EMA_FAST}",
            line=dict(color="#ff9800", width=1.5),
        ), row=1, col=1)
        fig.add_trace(go.Scatter(
            x=df.index, y=df["ema_slow"],
            name=f"EMA {EMA_SLOW}",
            line=dict(color="#2196f3", width=1.5),
        ), row=1, col=1)

    # Row 2: RSI
    if "rsi" in df.columns:
        fig.add_trace(go.Scatter(
            x=df.index, y=df["rsi"],
            name="RSI",
            line=dict(color="#9c27b0", width=1.5),
            showlegend=False,
        ), row=2, col=1)
        fig.add_hline(y=70, line_dash="dot", line_color="red",   row=2, col=1)
        fig.add_hline(y=30, line_dash="dot", line_color="green", row=2, col=1)
        fig.update_yaxes(range=[0, 100], row=2, col=1)

    # Row 3: MACD
    if "macd_hist" in df.columns:
        colors = ["#26a69a" if v >= 0 else "#ef5350" for v in df["macd_hist"].fillna(0)]
        fig.add_trace(go.Bar(
            x=df.index, y=df["macd_hist"],
            name="Histogramm",
            marker_color=colors,
            showlegend=False,
        ), row=3, col=1)
        fig.add_trace(go.Scatter(
            x=df.index, y=df["macd_line"],
            name="MACD",
            line=dict(color="#2196f3", width=1.2),
            showlegend=False,
        ), row=3, col=1)
        fig.add_trace(go.Scatter(
            x=df.index, y=df["macd_signal"],
            name="Signal",
            line=dict(color="#ff9800", width=1.2),
            showlegend=False,
        ), row=3, col=1)

    fig.update_layout(
        xaxis_rangeslider_visible=False,
        template="plotly_dark",
        height=750,
        margin=dict(l=10, r=10, t=40, b=10),
        legend=dict(orientation="h", y=1.02, x=0),
    )
    # Remove weekend gaps for indices using category axis for daily timeframe
    fig.update_xaxes(type="category" if False else "-", row=1, col=1)

    return fig


def render_signal_badge(signals: dict, df: pd.DataFrame) -> None:
    label = signals["combined"]
    st.markdown(
        f'<span style="{BADGE_CSS[label]}">{label}</span>',
        unsafe_allow_html=True,
    )
    st.markdown("")

    col1, col2, col3 = st.columns(3)
    col1.metric("RSI", signals["rsi"])
    col2.metric("MACD", signals["macd"])
    col3.metric("EMA Cross", signals["ema"])

    if "rsi" in df.columns and not df["rsi"].isna().all():
        rsi_val = df["rsi"].iloc[-1]
        if not pd.isna(rsi_val):
            st.progress(int(rsi_val) / 100, text=f"RSI: {rsi_val:.1f}")


def _color_signal_row(row: pd.Series) -> list[str]:
    sig = row.get("Signal", "–")
    color = SIGNAL_COLORS.get(sig, "")
    bg = f"background-color: {color}22;" if color else ""
    return [bg] * len(row)


def render_signal_table(table_df: pd.DataFrame) -> None:
    st.subheader("Signal-Übersicht (alle Symbole)")
    styled = table_df.style.apply(_color_signal_row, axis=1)
    st.dataframe(styled, use_container_width=True, hide_index=True)


def main() -> None:
    st.set_page_config(
        layout="wide",
        page_title="Day Trader Dashboard",
        page_icon="📈",
    )

    ticker, symbol_label, interval, refresh_label, refresh_ms = render_sidebar()

    # Auto-refresh trigger (browser-side timer)
    st_autorefresh(interval=refresh_ms, limit=None, debounce=True, key="main_autorefresh")

    st.title(f"📈 {symbol_label}")

    # Load and enrich data
    df = fetch_ohlcv(ticker, interval, ttl_hint=refresh_ms // 1000)

    if df.empty:
        st.warning(f"Keine Daten für {symbol_label} verfügbar. Markt möglicherweise geschlossen.")
        return

    df = add_indicators(df)
    sigs = combined_signal(df)

    # Top section: chart left, signal right
    chart_col, signal_col = st.columns([3, 1])

    with chart_col:
        fig = build_candlestick_chart(df, symbol_label)
        st.plotly_chart(fig, use_container_width=True)

    with signal_col:
        st.subheader("Signal")
        render_signal_badge(sigs, df)

        st.markdown("---")
        price = df["Close"].iloc[-1]
        st.metric("Aktueller Kurs", f"{price:.4f}" if price < 100 else f"{price:,.2f}")

        high = df["High"].max()
        low  = df["Low"].min()
        st.metric("Hoch (Periode)", f"{high:.4f}" if high < 100 else f"{high:,.2f}")
        st.metric("Tief (Periode)", f"{low:.4f}" if low < 100 else f"{low:,.2f}")

    st.markdown("---")

    # Signal overview table for all symbols
    table_df = build_signal_table(interval)
    render_signal_table(table_df)


if __name__ == "__main__":
    main()
