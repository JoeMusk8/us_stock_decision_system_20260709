"use client";

import { useState } from "react";
import { MarketChart } from "@/components/MarketChart";
import { Button, Card, PageShell, Pill, TextInput } from "@/components/Ui";
import type { TechnicalSeries } from "@/lib/types";
import styles from "./page.module.css";

const emptySeries: TechnicalSeries = {
  status: "source_pending",
  message: "数据源待接入",
  candles: [],
  ma20: [],
  ma50: [],
  ma120: [],
  ma250: [],
  rsi: [],
  volume: []
};

type StockResult = {
  symbol: string;
  quote: {
    status: string;
    symbol: string;
    price: number | null;
    changePercent: number | null;
    volume: number | null;
    avgVolume: number | null;
    message?: string;
  };
  technicals: TechnicalSeries;
};

type ApiState = {
  symbols: string[];
  results: StockResult[];
};

export default function StocksPage() {
  const [input, setInput] = useState("");
  const [symbols, setSymbols] = useState<string[]>([]);
  const [results, setResults] = useState<StockResult[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [loading, setLoading] = useState(false);

  async function syncStocks(nextSymbols = symbols) {
    setLoading(true);
    const response = await fetch("/api/stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols: nextSymbols })
    });
    const data = (await response.json()) as ApiState;
    setResults(data.results);
    setSelectedSymbol(data.results[0]?.symbol ?? nextSymbols[0] ?? "");
    setLoading(false);
  }

  async function addStocks() {
    const parsed = input
      .split(/[,\s/]+/)
      .map((symbol) => symbol.trim().toUpperCase())
      .filter(Boolean);
    const nextSymbols = Array.from(new Set([...symbols, ...parsed])).slice(0, 15);
    setSymbols(nextSymbols);
    setInput("");
    await syncStocks(nextSymbols);
  }

  function clearStocks() {
    setSymbols([]);
    setResults([]);
    setSelectedSymbol("");
    setInput("");
  }

  const selected = results.find((result) => result.symbol === selectedSymbol) ?? results[0];
  const technicalSeries = selected?.technicals ?? emptySeries;
  const selectedQuote = selected?.quote;

  return (
    <PageShell title="个股分析模块" compactTitle>
      <Card className={styles.inputPanel}>
        <TextInput
          className={styles.stockInput}
          placeholder="输入股票代码，最多 15 只"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <div className={styles.addButton}><Button onClick={addStocks} disabled={loading}>添加股票</Button></div>
        <div className={styles.clearButton}><Button variant="secondary" onClick={clearStocks} disabled={loading}>清空股票</Button></div>
        <div className={styles.tags}>
          {symbols.map((symbol) => <Pill tone="gray" key={symbol}>{symbol}</Pill>)}
        </div>
      </Card>

      <Card className={styles.stockListPanel}>
        <h2>股票列表</h2>
        <p>每只股票都有独立 AI分析 按钮。</p>
        <Pill tone="green" className={styles.countPill}>当前 {symbols.length} / 15</Pill>
        {symbols.length > 0 ? (
          <div className={styles.stockRows}>
            {symbols.map((symbol) => {
              const result = results.find((item) => item.symbol === symbol);
              return (
                <div className={`${styles.stockRow} ${symbol === selectedSymbol ? styles.activeRow : ""}`} key={symbol}>
                  <strong>{symbol}</strong>
                  <span>{formatMoney(result?.quote.price)}</span>
                  <em className={(result?.quote.changePercent ?? 0) >= 0 ? styles.up : styles.down}>{formatPercent(result?.quote.changePercent)}</em>
                  <button onClick={() => setSelectedSymbol(symbol)}>AI分析</button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.stockEmpty}>暂无股票。添加股票后将调用行情 API 通路。</div>
        )}
        <Pill tone="gray" className={styles.remaining}>剩余 {15 - symbols.length} 个空位</Pill>
      </Card>

      <Card className={styles.chartPanel}>
        <h2>图像化技术指标：{selectedSymbol || "待选择"}</h2>
        <p>展示K线、MA20、MA50、MA120、MA250、RSI和成交量，不再只用表格。</p>
        <div className={styles.metrics}>
          <Metric label="当前价格" value={formatMoney(selectedQuote?.price)} note={formatPercent(selectedQuote?.changePercent)} tone="green" />
          <Metric label="RSI" value={latestValue(technicalSeries.rsi)} note={technicalSeries.status === "ready" ? "真实计算" : "数据源待接入"} tone="amber" />
          <Metric label="成交量" value={selectedQuote?.volume ? "已接入" : "待接入"} note={selectedQuote?.avgVolume ? "含均量" : "数据源待接入"} tone="blue" />
        </div>
        <div className={styles.embeddedChart}>
          <MarketChart title="价格 / 均线 / RSI / 成交量" subtitle="" series={technicalSeries} compact />
        </div>
      </Card>

      <Card className={styles.aiPanel}>
        <h2>AI 深入调研输出</h2>
        <p>点击某只股票的 AI分析 后，输出完整公司研究：基本面 + 技术面 + 区间辅助。</p>
        <Pill tone="blue" className={styles.currentPill}>当前：{selectedSymbol || "待选择"}</Pill>
        <section className={styles.rangePanel}>
          <h3>区间辅助输出</h3>
          <div>
            <article>
              <span>辅助观察区间</span>
              <strong>{technicalSeries.status === "ready" ? "由真实行情计算" : "暂无数据"}</strong>
              <em>数据不足不输出确定价格</em>
            </article>
            <article>
              <span>风险区间</span>
              <strong>{technicalSeries.status === "ready" ? "等待AI模型确认" : "暂无数据"}</strong>
              <em>等待真实数据确认</em>
            </article>
          </div>
        </section>
        <div className={styles.tabs}>
          <Pill tone="green">基本面</Pill>
          <Pill tone="blue">技术面</Pill>
          <Pill tone="amber">风险</Pill>
          <Pill tone="purple">证据</Pill>
        </div>
        <div className={styles.researchGrid}>
          <Research title="公司背景" color="blue" text="公司简介、成立时间、总部、上市交易所、核心管理层、业务发展阶段。" />
          <Research title="主营业务" color="green" text="核心产品、收入分部、客户类型、主要应用场景、收入是否来自核心业务。" />
          <Research title="行业地位" color="amber" text="产业链位置、竞争对手、客户认证、技术壁垒、供应链不可替代性。" />
          <Research title="财务兑现" color="purple" text="收入增长、毛利率、营业利润率、自由现金流、订单/Backlog、指引变化。" />
        </div>
        <section className={styles.conclusion}>
          <strong>综合调研结论</strong>
          <p>输出结论应同时覆盖：公司背景、主营业务、行业地位、财务兑现、技术面状态、辅助观察区间与主要风险。</p>
        </section>
      </Card>
    </PageShell>
  );
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone: "green" | "amber" | "blue" }) {
  return (
    <article className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em className={styles[tone]}>{note}</em>
      <i className={styles[`${tone}Dot`]} />
    </article>
  );
}

function Research({ title, text, color }: { title: string; text: string; color: string }) {
  return (
    <article className={styles.researchCard}>
      <i className={styles[color]} />
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}

function formatMoney(value: number | null | undefined): string {
  if (value == null) {
    return "待接入";
  }
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) {
    return "数据源待接入";
  }
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function latestValue(points: Array<{ value: number }>): string {
  const latest = points.at(-1);
  return latest ? String(latest.value) : "待接入";
}
