import { buildTechnicalSeries, round } from "./indicators";
import type { CandlePoint, TechnicalSeries } from "./types";

const SOURCE_PENDING = "数据源待接入";
const ALPHA_BASE_URL = "https://www.alphavantage.co/query";
const FMP_BASE_URL = "https://financialmodelingprep.com/api/v3";

export async function getEquitySeries(symbol: string): Promise<TechnicalSeries> {
  const normalized = symbol.trim().toUpperCase();
  if (!normalized) {
    return buildTechnicalSeries([], "请输入股票代码");
  }

  const alphaKey = process.env.ALPHA_VANTAGE_API_KEY;
  const fmpKey = process.env.FMP_API_KEY;

  if (fmpKey) {
    const candles = await fetchFmpHistorical(normalized, fmpKey);
    if (candles.length > 0) {
      return buildTechnicalSeries(candles);
    }
  }

  if (alphaKey) {
    const candles = await fetchAlphaDaily(normalized, alphaKey);
    if (candles.length > 0) {
      return buildTechnicalSeries(candles);
    }
  }

  return buildTechnicalSeries([], SOURCE_PENDING);
}

export async function getCryptoSeries(symbol = "BTCUSD"): Promise<TechnicalSeries> {
  const alphaKey = process.env.ALPHA_VANTAGE_API_KEY;
  const fmpKey = process.env.FMP_API_KEY;

  if (fmpKey) {
    const candles = await fetchFmpHistorical(symbol, fmpKey);
    if (candles.length > 0) {
      return buildTechnicalSeries(candles);
    }
  }

  if (!alphaKey) {
    return buildTechnicalSeries([], SOURCE_PENDING);
  }

  try {
    const url = new URL(ALPHA_BASE_URL);
    url.searchParams.set("function", "DIGITAL_CURRENCY_DAILY");
    url.searchParams.set("symbol", "BTC");
    url.searchParams.set("market", "USD");
    url.searchParams.set("apikey", alphaKey);
    const data = await fetchJson<Record<string, unknown>>(url);
    const raw = data["Time Series (Digital Currency Daily)"] as Record<string, Record<string, string>> | undefined;
    const candles = Object.entries(raw ?? {})
      .map(([time, value]) => ({
        time,
        open: Number(value["1. open"]),
        high: Number(value["2. high"]),
        low: Number(value["3. low"]),
        close: Number(value["4. close"]),
        volume: Number(value["5. volume"])
      }))
      .filter(isCandle)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(-260);

    return buildTechnicalSeries(candles, candles.length ? undefined : SOURCE_PENDING);
  } catch {
    return buildTechnicalSeries([], SOURCE_PENDING);
  }
}

export async function getQuote(symbol: string) {
  const fmpKey = process.env.FMP_API_KEY;
  if (!fmpKey) {
    return {
      status: "source_pending" as const,
      symbol: symbol.toUpperCase(),
      price: null,
      changePercent: null,
      volume: null,
      avgVolume: null,
      message: SOURCE_PENDING
    };
  }

  try {
    const url = new URL(`${FMP_BASE_URL}/quote/${symbol.toUpperCase()}`);
    url.searchParams.set("apikey", fmpKey);
    const [quote] = await fetchJson<Array<Record<string, number | string | null>>>(url);
    if (!quote) {
      throw new Error("Missing quote");
    }
    return {
      status: "ready" as const,
      symbol: String(quote.symbol ?? symbol.toUpperCase()),
      price: numberOrNull(quote.price),
      changePercent: numberOrNull(quote.changesPercentage),
      volume: numberOrNull(quote.volume),
      avgVolume: numberOrNull(quote.avgVolume),
      message: undefined
    };
  } catch {
    return {
      status: "error" as const,
      symbol: symbol.toUpperCase(),
      price: null,
      changePercent: null,
      volume: null,
      avgVolume: null,
      message: SOURCE_PENDING
    };
  }
}

async function fetchFmpHistorical(symbol: string, apiKey: string): Promise<CandlePoint[]> {
  try {
    const url = new URL(`${FMP_BASE_URL}/historical-price-full/${symbol}`);
    url.searchParams.set("timeseries", "300");
    url.searchParams.set("apikey", apiKey);
    const data = await fetchJson<{ historical?: Array<Record<string, number | string>> }>(url);
    return (data.historical ?? [])
      .map((row) => ({
        time: String(row.date),
        open: Number(row.open),
        high: Number(row.high),
        low: Number(row.low),
        close: Number(row.close),
        volume: Number(row.volume)
      }))
      .filter(isCandle)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(-260);
  } catch {
    return [];
  }
}

async function fetchAlphaDaily(symbol: string, apiKey: string): Promise<CandlePoint[]> {
  try {
    const url = new URL(ALPHA_BASE_URL);
    url.searchParams.set("function", "TIME_SERIES_DAILY_ADJUSTED");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("outputsize", "full");
    url.searchParams.set("apikey", apiKey);
    const data = await fetchJson<Record<string, unknown>>(url);
    const raw = data["Time Series (Daily)"] as Record<string, Record<string, string>> | undefined;
    return Object.entries(raw ?? {})
      .map(([time, value]) => ({
        time,
        open: Number(value["1. open"]),
        high: Number(value["2. high"]),
        low: Number(value["3. low"]),
        close: Number(value["4. close"]),
        volume: Number(value["6. volume"])
      }))
      .filter(isCandle)
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(-260);
  } catch {
    return [];
  }
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

function isCandle(value: CandlePoint): boolean {
  return (
    Boolean(value.time) &&
    Number.isFinite(value.open) &&
    Number.isFinite(value.high) &&
    Number.isFinite(value.low) &&
    Number.isFinite(value.close) &&
    Number.isFinite(value.volume)
  );
}

function numberOrNull(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? round(numeric) : null;
}
