"use client";

import { createChart, type IChartApi, type ISeriesApi } from "lightweight-charts";
import { useEffect, useMemo, useRef } from "react";
import type { TechnicalSeries } from "@/lib/types";
import styles from "./MarketChart.module.css";

type Props = {
  title: string;
  subtitle: string;
  series: TechnicalSeries;
  compact?: boolean;
};

export function MarketChart({ title, subtitle, series, compact = false }: Props) {
  const priceRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const ready = series.status === "ready" && series.candles.length > 0;
  const statusMessage = series.message ?? "数据源待接入";
  const chartHeight = compact ? 154 : 170;

  const latestClose = useMemo(() => {
    const latest = series.candles.at(-1);
    return latest ? latest.close.toLocaleString("en-US", { maximumFractionDigits: 2 }) : null;
  }, [series.candles]);

  useEffect(() => {
    if (!ready || !priceRef.current || !rsiRef.current || !volumeRef.current) {
      return;
    }

    const cleanup: IChartApi[] = [];
    const priceChart = createChart(priceRef.current, {
      height: chartHeight,
      layout: { background: { color: "#f3f4f6" }, textColor: "#6b7280" },
      grid: { vertLines: { color: "#e5e7eb" }, horzLines: { color: "#e5e7eb" } },
      rightPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } }
    });
    const candles = priceChart.addCandlestickSeries({
      upColor: "#10a37f",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#10a37f",
      wickDownColor: "#ef4444"
    });
    candles.setData(series.candles);
    addLine(priceChart, series.ma20, "#10a37f");
    addLine(priceChart, series.ma50, "#2563eb");
    addLine(priceChart, series.ma120, "#f59e0b");
    addLine(priceChart, series.ma250, "#7c3aed");
    priceChart.timeScale().fitContent();
    cleanup.push(priceChart);

    const rsiChart = createChart(rsiRef.current, {
      height: compact ? 86 : 78,
      layout: { background: { color: "#f3f4f6" }, textColor: "#6b7280" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } }
    });
    addLine(rsiChart, series.rsi, "#f59e0b", 2);
    rsiChart.timeScale().fitContent();
    cleanup.push(rsiChart);

    const volumeChart = createChart(volumeRef.current, {
      height: compact ? 86 : 78,
      layout: { background: { color: "#f3f4f6" }, textColor: "#6b7280" },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      rightPriceScale: { visible: false },
      timeScale: { visible: false, borderVisible: false },
      crosshair: { vertLine: { visible: false }, horzLine: { visible: false } }
    });
    const histogram = volumeChart.addHistogramSeries({ priceFormat: { type: "volume" } });
    histogram.setData(series.volume);
    volumeChart.timeScale().fitContent();
    cleanup.push(volumeChart);

    return () => cleanup.forEach((chart) => chart.remove());
  }, [chartHeight, compact, ready, series]);

  return (
    <section className={`${styles.chartCard} ${compact ? styles.compact : ""}`}>
      <header className={styles.chartHeader}>
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        {latestClose ? <span className={styles.current}>当前：{latestClose}</span> : null}
      </header>
      <div className={styles.legend}>
        <span className={styles.ma20}>MA20</span>
        <span className={styles.ma50}>MA50</span>
        <span className={styles.ma120}>MA120</span>
        <span className={styles.ma250}>MA250</span>
      </div>
      <div className={styles.priceChart} ref={priceRef}>
        {!ready ? <div className={styles.empty}>{statusMessage}</div> : null}
      </div>
      <div className={styles.subCharts}>
        <div className={styles.subChart}>
          <span>RSI</span>
          <div ref={rsiRef}>{!ready ? <b>{statusMessage}</b> : null}</div>
        </div>
        <div className={styles.subChart}>
          <span>成交量</span>
          <div ref={volumeRef}>{!ready ? <b>{statusMessage}</b> : null}</div>
        </div>
      </div>
    </section>
  );
}

function addLine(chart: IChartApi, data: Array<{ time: string; value: number }>, color: string, lineWidth = 2): ISeriesApi<"Line"> {
  const line = chart.addLineSeries({
    color,
    lineWidth: lineWidth as 2,
    priceLineVisible: false,
    lastValueVisible: false
  });
  line.setData(data);
  return line;
}
