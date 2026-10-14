"""
Portfolio analytics for the Zerodha demo application.

Price policy:
- Current holding prices come from the latest valid observations in the
  DataFrame returned by fetch_market_data (fresh Yahoo Finance data or cache).
- Stored holding current_price values are not silently used as valuation fallbacks.
- If any holding has no valid market price, valuation fails explicitly.
- Risk metrics are calculated from the available price history; unavailable
  metrics are returned as None rather than fabricated defaults.
"""

import datetime
import json
import os
from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor

try:
    from analytics.marketData import (
        fetch_market_data,
        fetch_ticker_news,
        normalize_symbol,
    )
except ModuleNotFoundError:
    from marketData import (
        fetch_market_data,
        fetch_ticker_news,
        normalize_symbol,
    )


PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))


def _normalise_symbol(symbol: Any) -> str:
    """Normalize symbols consistently, while tolerating non-string values."""
    return normalize_symbol(str(symbol).strip())


def _safe_float(value: Any) -> Optional[float]:
    """Convert a value to a finite float, otherwise return None."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if np.isfinite(number) else None


class PortfolioAnalytics:
    def __init__(
        self,
        portfolio_id: str,
        benchmark: str = "^NSEI",
        force_refresh: bool = False,
    ):
        self.portfolio_id = portfolio_id
        self.benchmark = benchmark
        self.force_refresh = force_refresh
        self.portfolio_data = self._fetch_from_neon()

        holdings = self.portfolio_data.get("holdings", [])
        if isinstance(holdings, dict):
            # Some database JSON adapters may return a keyed object.
            holdings = list(holdings.values())

        self.df = pd.DataFrame(holdings)
        self._validate_holdings()

    def _validate_holdings(self) -> None:
        """Validate the minimum fields needed to value the portfolio."""
        if self.df.empty:
            raise ValueError(
                f"Portfolio {self.portfolio_id!r} contains no holdings."
            )

        required = {"symbol", "shares", "avg_buy_price"}
        missing = required.difference(self.df.columns)
        if missing:
            raise ValueError(
                "Portfolio holdings are missing required field(s): "
                + ", ".join(sorted(missing))
            )

        self.df["symbol"] = self.df["symbol"].astype(str).str.strip()
        if (self.df["symbol"] == "").any():
            raise ValueError("A holding has an empty symbol.")

        for field in ("shares", "avg_buy_price"):
            self.df[field] = pd.to_numeric(self.df[field], errors="coerce")

        invalid = (
            self.df["shares"].isna()
            | ~np.isfinite(self.df["shares"])
            | (self.df["shares"] <= 0)
            | self.df["avg_buy_price"].isna()
            | ~np.isfinite(self.df["avg_buy_price"])
            | (self.df["avg_buy_price"] < 0)
        )
        if invalid.any():
            bad_symbols = self.df.loc[invalid, "symbol"].tolist()
            raise ValueError(
                "Invalid shares or average buy price for holding(s): "
                + ", ".join(bad_symbols)
            )

        if "sector" not in self.df.columns:
            self.df["sector"] = "Diversified"
        self.df["sector"] = (
            self.df["sector"].fillna("Diversified").astype(str).str.strip()
        )
        self.df.loc[self.df["sector"] == "", "sector"] = "Diversified"

        if "company_name" not in self.df.columns:
            self.df["company_name"] = self.df["symbol"]
        self.df["company_name"] = self.df["company_name"].fillna(
            self.df["symbol"]
        )

    def _fetch_from_neon(self) -> dict:
        """Fetch holdings from NeonDB, falling back to the matching local JSON."""
        db_url = os.getenv("NEON_DATABASE_URL")
        if db_url and db_url.startswith("postgres"):
            conn = None
            try:
                conn = psycopg2.connect(db_url)
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT * FROM portfolios WHERE portfolio_id = %s",
                        (self.portfolio_id,),
                    )
                    row = cur.fetchone()

                if row:
                    holdings = row.get("holdings", [])
                    if isinstance(holdings, str):
                        holdings = json.loads(holdings)
                    return {
                        "portfolio_id": row.get("portfolio_id", self.portfolio_id),
                        "investor_name": row.get("investor_name", "Valued Investor"),
                        "risk_profile": row.get("risk_profile", "Moderate"),
                        "holdings": holdings,
                        "data_source": "neondb",
                    }
            except Exception as exc:
                print(
                    "[DB Warning] Could not load portfolio from NeonDB "
                    f"({exc}). Falling back to local JSON data."
                )
            finally:
                if conn is not None:
                    conn.close()

        # Support IDs such as PORT-1001 and PORT-1.
        port_num = self.portfolio_id.replace("PORT-100", "").replace("PORT-", "")
        if not port_num:
            port_num = "1"

        json_path = os.path.abspath(
            os.path.join(
                os.path.dirname(__file__),
                "..",
                "data",
                "portfolio",
                f"portfolio_{port_num}.json",
            )
        )
        if not os.path.exists(json_path):
            fallback_path = os.path.abspath(
                os.path.join(
                    os.path.dirname(__file__),
                    "..",
                    "data",
                    "portfolio",
                    "portfolio_1.json",
                )
            )
            if not os.path.exists(fallback_path):
                raise FileNotFoundError(
                    "Could not find portfolio JSON file. Tried "
                    f"{json_path!r} and {fallback_path!r}."
                )
            json_path = fallback_path

        with open(json_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        return {
            "portfolio_id": data.get("portfolio_id", self.portfolio_id),
            "investor_name": data.get("investor_name", "Valued Investor"),
            "risk_profile": data.get(
                "risk_profile",
                data.get("investor_risk_profile", "Moderate"),
            ),
            "holdings": data.get("holdings", []),
            "data_source": "local_json",
        }

    def _resolve_latest_prices(
        self, market_df: pd.DataFrame, symbols: List[str]
    ) -> Dict[str, float]:
        """
        Resolve latest valid positive price per holding from fetched/cached data.
        Does not fall back to the holding's previously stored current_price.
        """
        if market_df is None or market_df.empty:
            raise ValueError("Market data is empty; cannot value the portfolio.")

        market_df = market_df.copy()
        market_df = market_df.sort_index()

        # This implementation expects a flat ticker-column DataFrame, as returned
        # by marketData.fetch_market_data. Fail explicitly for unexpected schemas.
        if isinstance(market_df.columns, pd.MultiIndex):
            raise ValueError(
                "Market data has MultiIndex columns, but flat ticker columns "
                "were expected. Update marketData.fetch_market_data to return "
                "one column per ticker."
            )

        price_columns: Dict[str, Any] = {}
        for column in market_df.columns:
            key = _normalise_symbol(column)
            if key:
                price_columns[key] = column

        latest_prices: Dict[str, float] = {}
        missing_symbols: List[str] = []

        for original_symbol in symbols:
            key = _normalise_symbol(original_symbol)
            column = price_columns.get(key)

            if column is None:
                missing_symbols.append(original_symbol)
                continue

            values = pd.to_numeric(market_df[column], errors="coerce")
            values = values[np.isfinite(values) & (values > 0)].dropna()

            if values.empty:
                missing_symbols.append(original_symbol)
                continue

            latest_prices[original_symbol] = float(values.iloc[-1])

        if missing_symbols:
            raise ValueError(
                "No valid fetched or cached market price for holding(s): "
                + ", ".join(missing_symbols)
                + ". Valuation stopped rather than using stored/stale prices."
            )

        return latest_prices

    def _calculate_risk_metrics(
        self,
        market_df: pd.DataFrame,
        symbols: List[str],
        weights: Dict[str, float],
    ) -> Dict[str, Any]:
        """Calculate volatility, drawdown, and beta without hard-coded metrics."""
        # Build normalized column mapping so symbol suffix differences do not
        # prevent risk calculations (for example, TCS and TCS.NS).
        columns_by_symbol = {
            _normalise_symbol(column): column for column in market_df.columns
        }

        matched = {}
        for symbol in symbols:
            column = columns_by_symbol.get(_normalise_symbol(symbol))
            if column is not None:
                matched[symbol] = pd.to_numeric(
                    market_df[column], errors="coerce"
                )

        if not matched:
            return {
                "annualized_volatility_pct": None,
                "max_drawdown_pct": None,
                "portfolio_beta": None,
                "benchmark_annualized_volatility_pct": None,
                "risk_flag": "UNAVAILABLE",
            }

        prices = pd.DataFrame(matched, index=market_df.index).sort_index()
        returns = prices.pct_change(fill_method=None)
        returns = returns.replace([np.inf, -np.inf], np.nan)

        # Weighted daily return series. Renormalize weights on days when some
        # symbols lack returns, so missing observations do not become zero returns.
        weight_series = pd.Series(
            {symbol: weights.get(symbol, 0.0) for symbol in matched}
        )
        weighted_returns = returns.mul(weight_series, axis="columns")
        available_weight = returns.notna().mul(weight_series, axis="columns").sum(
            axis="columns"
        )
        portfolio_returns = weighted_returns.sum(
            axis="columns", min_count=1
        ).div(available_weight.replace(0, np.nan))
        portfolio_returns = portfolio_returns.dropna()

        volatility: Optional[float] = None
        max_drawdown: Optional[float] = None
        beta: Optional[float] = None
        benchmark_volatility: Optional[float] = None

        if len(portfolio_returns) >= 2:
            daily_std = _safe_float(portfolio_returns.std(ddof=1))
            if daily_std is not None:
                volatility = daily_std * np.sqrt(252) * 100

            cumulative = (1 + portfolio_returns).cumprod()
            running_peak = cumulative.cummax()
            drawdown = cumulative.div(running_peak).sub(1)
            drawdown_value = _safe_float(drawdown.min())
            if drawdown_value is not None:
                max_drawdown = drawdown_value * 100

        benchmark_column = columns_by_symbol.get(
            _normalise_symbol(self.benchmark)
        )
        if benchmark_column is not None:
            benchmark_prices = pd.to_numeric(
                market_df[benchmark_column], errors="coerce"
            )
            benchmark_returns = benchmark_prices.pct_change(fill_method=None)
            benchmark_returns = benchmark_returns.replace(
                [np.inf, -np.inf], np.nan
            )

            bench_std = _safe_float(benchmark_returns.std(ddof=1))
            if bench_std is not None and len(benchmark_returns.dropna()) >= 2:
                benchmark_volatility = bench_std * np.sqrt(252) * 100

            aligned = pd.concat(
                [portfolio_returns.rename("portfolio"), benchmark_returns.rename("benchmark")],
                axis=1,
            ).dropna()

            if len(aligned) >= 2:
                variance = _safe_float(aligned["benchmark"].var(ddof=1))
                covariance = _safe_float(
                    aligned["portfolio"].cov(aligned["benchmark"])
                )
                if (
                    variance is not None
                    and covariance is not None
                    and variance > 0
                ):
                    beta = covariance / variance

        if volatility is None:
            risk_flag = "UNAVAILABLE"
        elif volatility > 22 or any(
            value > 60 for value in self._current_sector_allocations().values()
        ):
            risk_flag = "HIGH"
        elif volatility > 15:
            risk_flag = "MODERATE"
        else:
            risk_flag = "NORMAL"

        return {
            "annualized_volatility_pct": (
                round(volatility, 2) if volatility is not None else None
            ),
            "max_drawdown_pct": (
                round(max_drawdown, 2) if max_drawdown is not None else None
            ),
            "portfolio_beta": round(beta, 2) if beta is not None else None,
            "benchmark_annualized_volatility_pct": (
                round(benchmark_volatility, 2)
                if benchmark_volatility is not None
                else None
            ),
            "risk_flag": risk_flag,
        }

    def _current_sector_allocations(self) -> Dict[str, float]:
        """Return sector allocation percentages after current values are computed."""
        if "current_value" not in self.df.columns:
            return {}
        total_current = float(self.df["current_value"].sum())
        if total_current <= 0:
            return {}
        grouped = self.df.groupby("sector")["current_value"].sum()
        return (grouped / total_current * 100).round(2).to_dict()

    def generate_full_payload(self) -> dict:
        """Calculate all portfolio metrics from one consistent market-data payload."""
        symbols = self.df["symbol"].tolist()

        # 1. Fetch historical prices. marketData is responsible for fresh/cache logic.
        market_df = fetch_market_data(
            symbols,
            benchmark=self.benchmark,
            force_refresh=self.force_refresh,
        )
        if market_df is None or market_df.empty:
            raise ValueError("Market data is empty; cannot value the portfolio.")

        market_df = market_df.copy().sort_index()

        # 2. Use the latest valid price from fetched or cached market data.
        latest_prices = self._resolve_latest_prices(market_df, symbols)
        self.df["current_price"] = self.df["symbol"].map(latest_prices)

        # 3. Calculate all monetary metrics from the same updated current_price.
        self.df["invested_value"] = (
            self.df["shares"] * self.df["avg_buy_price"]
        )
        self.df["current_value"] = (
            self.df["shares"] * self.df["current_price"]
        )
        self.df["pnl"] = self.df["current_value"] - self.df["invested_value"]

        invested_values = self.df["invested_value"].replace(0, np.nan)
        self.df["pnl_pct"] = (
            self.df["pnl"].div(invested_values).mul(100).round(2)
        ).fillna(0.0)

        total_invested = float(self.df["invested_value"].sum())
        total_current = float(self.df["current_value"].sum())
        total_pnl = total_current - total_invested
        pnl_pct = (
            (total_pnl / total_invested) * 100
            if total_invested > 0
            else 0.0
        )

        # 4. Holdings-level values and P&L contribution.
        holdings_summary = []
        for _, row in self.df.iterrows():
            allocation_pct = (
                float(row["current_value"]) / total_current * 100
                if total_current > 0
                else 0.0
            )
            pnl_contribution_pct = (
                float(row["pnl"]) / total_invested * 100
                if total_invested > 0
                else 0.0
            )

            shares_value = _safe_float(row["shares"])
            holdings_summary.append(
                {
                    "symbol": str(row["symbol"]),
                    "company_name": str(row.get("company_name", row["symbol"])),
                    "sector": str(row.get("sector", "Diversified")),
                    "shares": shares_value,
                    "avg_buy_price": round(float(row["avg_buy_price"]), 4),
                    "current_price": round(float(row["current_price"]), 4),
                    "invested_value": round(float(row["invested_value"]), 2),
                    "current_value": round(float(row["current_value"]), 2),
                    "pnl": round(float(row["pnl"]), 2),
                    "pnl_pct": round(float(row["pnl_pct"]), 2),
                    "allocation_pct": round(allocation_pct, 2),
                    "pnl_contribution_pct": round(pnl_contribution_pct, 2),
                }
            )

        # 5. Sector allocation and concentration alerts.
        sector_group = self.df.groupby("sector")["current_value"].sum()
        sector_pcts = (
            (sector_group / total_current * 100).round(2).to_dict()
            if total_current > 0
            else {}
        )
        concentration_alerts = [
            (
                f"Concentration Risk: {sector} accounts for {percentage}% "
                "of total portfolio (threshold: >40%)."
            )
            for sector, percentage in sector_pcts.items()
            if percentage > 40.0
        ]

        # 6. Portfolio weights for risk calculations.
        weights = (
            (
                self.df.set_index("symbol")["current_value"]
                / total_current
            ).to_dict()
            if total_current > 0
            else {}
        )
        risk_metrics = self._calculate_risk_metrics(
            market_df=market_df,
            symbols=symbols,
            weights=weights,
        )

        # 7. News is supplementary; news provider failures should not break valuation.
        all_news = {}
        for symbol in symbols:
            try:
                all_news[symbol] = fetch_ticker_news(symbol)
            except Exception as exc:
                print(f"[News Warning] Could not fetch news for {symbol}: {exc}")
                all_news[symbol] = []

        # Timestamp of the last row containing any data, plus latest valid
        # observation date per holding so stale/uneven series can be investigated.
        non_empty_rows = market_df.dropna(how="all")
        market_data_as_of = (
            non_empty_rows.index.max().isoformat()
            if not non_empty_rows.empty
            else None
        )

        market_data_by_symbol_as_of = {}
        for symbol in symbols:
            column = next(
                (
                    col
                    for col in market_df.columns
                    if _normalise_symbol(col) == _normalise_symbol(symbol)
                ),
                None,
            )
            if column is None:
                market_data_by_symbol_as_of[symbol] = None
                continue
            valid_prices = pd.to_numeric(
                market_df[column], errors="coerce"
            ).dropna()
            market_data_by_symbol_as_of[symbol] = (
                valid_prices.index[-1].isoformat()
                if not valid_prices.empty
                else None
            )

        timestamp_now = datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat()

        return {
            "metadata": {
                "portfolio_id": self.portfolio_id,
                "investor_name": self.portfolio_data.get(
                    "investor_name", "Valued Investor"
                ),
                "risk_profile": self.portfolio_data.get(
                    "risk_profile", "Moderate"
                ),
                "portfolio_data_source": self.portfolio_data.get(
                    "data_source", "unknown"
                ),
                "benchmark": self.benchmark,
                "force_refresh": self.force_refresh,
                "calculated_at": timestamp_now,
                # Backwards-compatible field; this is calculation time, not
                # proof that the underlying market data is live.
                "data_freshness": timestamp_now,
                "market_data_as_of": market_data_as_of,
                "market_data_by_symbol_as_of": market_data_by_symbol_as_of,
                "market_price_source": "market_data_cache_or_yahoo_finance",
                "price_semantics": "latest_available_observation_not_guaranteed_intraday",
            },
            "summary": {
                "total_invested": round(total_invested, 2),
                "total_current_value": round(total_current, 2),
                "total_pnl": round(total_pnl, 2),
                "pnl_pct": round(pnl_pct, 2),
            },
            "holdings": holdings_summary,
            "sector_allocation": sector_pcts,
            "concentration_alerts": concentration_alerts,
            "risk_metrics": risk_metrics,
            "holdings_news": all_news,
        }


if __name__ == "__main__":
    engine = PortfolioAnalytics("PORT-1001")
    print(json.dumps(engine.generate_full_payload(), indent=2, default=str))
