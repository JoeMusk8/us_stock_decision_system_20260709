import type { CandlePoint, LinePoint, TechnicalSeries, VolumePoint } from "./types";

export function movingAverage(candles: CandlePoint[], period: number): LinePoint[] {
  const result: LinePoint[] = [];
  let sum = 0;

  candles.forEach((candle, index) => {
    sum += candle.close;
    if (index >= period) {
      sum -= candles[index - period].close;
    }
    if (index >= period - 1) {
      result.push({ time: candle.time, value: round(sum / period) });
    }
  });

  return result;
}

export function rsi(candles: CandlePoint[], period = 14): LinePoint[] {
  if (candles.length <= period) {
    return [];
  }

  const points: LinePoint[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i += 1) {
    const delta = candles[i].close - candles[i - 1].close;
    gains += Math.max(delta, 0);
    losses += Math.max(-delta, 0);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  points.push({ time: candles[period].time, value: toRsi(avgGain, avgLoss) });

  for (let i = period + 1; i < candles.length; i += 1) {
    const delta = candles[i].close - candles[i - 1].close;
    avgGain = (avgGain * (period - 1) + Math.max(delta, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-delta, 0)) / period;
    points.push({ time: candles[i].time, value: toRsi(avgGain, avgLoss) });
  }

  return points;
}

export function volumeSeries(candles: CandlePoint[]): VolumePoint[] {
  return candles.map((candle) => ({
    time: candle.time,
    value: candle.volume,
    color: candle.close >= candle.open ? "#10a37f" : "#ef4444"
  }));
}

export function buildTechnicalSeries(candles: CandlePoint[], message?: string): TechnicalSeries {
  if (candles.length < 30) {
    return {
      status: candles.length === 0 ? "source_pending" : "insufficient",
      message: message ?? (candles.length === 0 ? "数据源待接入" : "当前数据不足"),
      candles,
      ma20: [],
      ma50: [],
      ma120: [],
      ma250: [],
      rsi: [],
      volume: volumeSeries(candles)
    };
  }

  return {
    status: "ready",
    candles,
    ma20: movingAverage(candles, 20),
    ma50: movingAverage(candles, 50),
    ma120: movingAverage(candles, 120),
    ma250: movingAverage(candles, 250),
    rsi: rsi(candles),
    volume: volumeSeries(candles)
  };
}

function toRsi(avgGain: number, avgLoss: number): number {
  if (avgLoss === 0) {
    return 100;
  }
  const rs = avgGain / avgLoss;
  return round(100 - 100 / (1 + rs));
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}
