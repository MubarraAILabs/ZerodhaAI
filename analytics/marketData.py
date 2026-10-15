import os
import time
import pandas as pd
import yfinance as yf

# Directory to cache market data locally
CACHE_DIR = os.path.join(os.path.dirname(__file__), "../data/market")
CACHE_FILE = os.path.join(CACHE_DIR, "market_cache.csv")
CACHE_EXPIRY_SECONDS = 900  # 15 minutes cache

def normalize_symbol(symbol: str, default_exchange: str = "NS") -> str:
    """
    Normalizes a stock ticker symbol by trimming whitespace, converting to uppercase,
    and ensuring Indian equity tickers have .NS or .BO suffix (e.g., RELIANCE -> RELIANCE.NS).
    Benchmark symbols starting with '^' (e.g., ^NSEI, ^BSESN, ^NSEBANK) are left intact.
    """
    if not symbol or not isinstance(symbol, str):
        return ""
    clean = symbol.strip().upper()
    if clean.startswith("^"):
        return clean
    if clean.endswith(".NS") or clean.endswith(".BO"):
        return clean
    return f"{clean}.{default_exchange.upper()}"

def normalize_tickers(symbols: list[str], default_exchange: str = "NS") -> list[str]:
    """Applies normalize_symbol across a list of raw ticker strings."""
    return [normalize_symbol(s, default_exchange=default_exchange) for s in symbols if s]

def _read_cache() -> pd.DataFrame | None:
    """Read the local cache safely; return None if it cannot be read."""
    if not os.path.exists(CACHE_FILE):
        return None
    try:
        cached = pd.read_csv(CACHE_FILE, index_col=0, parse_dates=True)
        if cached.empty:
            return None
        cached = cached.sort_index()
        # CSV column labels should be ticker strings, even for a single ticker.
        cached.columns = [str(column) for column in cached.columns]
        return cached
    except (OSError, ValueError, pd.errors.ParserError) as exc:
        print(f"[MarketData Warning] Could not read cache: {exc}")
        return None


def _has_requested_tickers(data: pd.DataFrame, tickers: list[str]) -> bool:
    """Check cache/download has at least one valid price for every ticker."""
    if data is None or data.empty:
        return False
    columns = {normalize_symbol(str(column)): column for column in data.columns}
    for ticker in tickers:
        column = columns.get(normalize_symbol(ticker))
        if column is None:
            return False
        prices = pd.to_numeric(data[column], errors="coerce")
        if not (prices.notna() & (prices > 0)).any():
            return False
    return True


def fetch_market_data(
    tickers: list[str],
    benchmark: str = "^NSEI",
    period: str = "6mo",
    force_refresh: bool = False,
) -> pd.DataFrame:
    """Fetch closing prices, using a complete local cache when Yahoo Finance fails.

    A cache is used only when it contains valid prices for every requested ticker
    and the benchmark. Freshness of the cache file is not the same as freshness
    of the underlying market observations; callers should inspect the index date.
    """
    normalized_tickers = normalize_tickers(tickers)
    normalized_benchmark = normalize_symbol(benchmark)
    all_tickers = list(dict.fromkeys(normalized_tickers + [normalized_benchmark]))

    cached_df = _read_cache()
    if not force_refresh and cached_df is not None:
        file_age = time.time() - os.path.getmtime(CACHE_FILE)
        if file_age < CACHE_EXPIRY_SECONDS and _has_requested_tickers(cached_df, all_tickers):
            print("[MarketData] Returning complete cached market data...")
            return cached_df

    print(
        "[MarketData] Fetching fresh price data from Yahoo Finance "
        f"(force_refresh={force_refresh}) for: {all_tickers}"
    )
    try:
        downloaded = yf.download(
            all_tickers,
            period=period,
            progress=False,
            auto_adjust=False,
            group_by="column",
            threads=True,
        )
        if downloaded is None or downloaded.empty:
            raise ValueError("Yahoo Finance returned no price data.")

        # yfinance versions differ: Close may be a DataFrame or Series, and
        # columns may be flat or MultiIndex. Normalize both to ticker columns.
        if isinstance(downloaded.columns, pd.MultiIndex):
            close_level = None
            for level in range(downloaded.columns.nlevels):
                if "Close" in downloaded.columns.get_level_values(level):
                    close_level = level
                    break
            if close_level is None:
                raise ValueError("Yahoo Finance response has no Close prices.")
            close = downloaded.xs("Close", axis=1, level=close_level, drop_level=True)
        else:
            if "Close" not in downloaded.columns:
                raise ValueError("Yahoo Finance response has no Close prices.")
            close = downloaded["Close"]

        if isinstance(close, pd.Series):
            # A single ticker can be returned as a Series in some versions.
            close = close.to_frame(name=all_tickers[0])
        close.columns = [str(column) for column in close.columns]
        close = close.sort_index()

        if not _has_requested_tickers(close, all_tickers):
            raise ValueError(
                "Yahoo Finance response is missing valid prices for one or more "
                "requested tickers; keeping the existing cache."
            )

        os.makedirs(CACHE_DIR, exist_ok=True)
        close.to_csv(CACHE_FILE)
        return close

    except Exception as exc:
        print(f"[MarketData Error] Failed to fetch complete market data: {exc}")
        # Only fall back to a cache that contains all requested tickers. Never
        # return an incomplete cache and silently omit holdings/benchmark data.
        if cached_df is not None and _has_requested_tickers(cached_df, all_tickers):
            print("[MarketData] Using last cached data (may be stale).")
            return cached_df
        raise RuntimeError(
            "Unable to fetch complete market data and no complete cache is available."
        ) from exc

def fetch_ticker_news(ticker: str) -> list[dict]:
    """
    Fetches recent news headlines for a stock ticker, 
    supporting both legacy and current nested yfinance news formats.
    """
    try:
        stock = yf.Ticker(normalize_symbol(ticker))
        news_items = stock.news
        cleaned_news = []

        if not news_items:
            return []

        for item in news_items[:3]:  # Top 3 headlines
            # Handle new nested 'content' structure
            content = item.get("content", {}) if isinstance(item, dict) else {}
            
            title = content.get("title") or item.get("title")
            
            # Extract publisher / provider
            provider = content.get("provider", {})
            publisher = provider.get("displayName") if isinstance(provider, dict) else item.get("publisher")
            
            # Extract link
            canonical_url = content.get("canonicalUrl", {})
            link = canonical_url.get("url") if isinstance(canonical_url, dict) else item.get("link")

            if title:
                cleaned_news.append({
                    "title": title,
                    "publisher": publisher or "Financial News",
                    "link": link or ""
                })

        return cleaned_news
    except Exception as e:
        print(f"[News Fetch Error] {e}")
        return []

if __name__ == "__main__":
    # Test normalization
    print("Testing Normalization:")
    print("RELIANCE ->", normalize_symbol("RELIANCE"))
    print("TCS.NS ->", normalize_symbol("TCS.NS"))
    print("^BSESN ->", normalize_symbol("^BSESN"))
    
    # Test script with holdings from PORT-1001 and ^BSESN benchmark
    sample_tickers = ["TCS", "INFY", "RELIANCE.NS"]
    prices = fetch_market_data(sample_tickers, benchmark="^BSESN", force_refresh=True)
    print("\n--- Market Closing Prices Sample ---")
    print(prices.tail())
    
    print("\n--- Recent News Sample (TCS.NS) ---")
    print(fetch_ticker_news("TCS.NS"))