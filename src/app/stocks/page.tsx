import { MarketChart } from "@/components/MarketChart";
import { Button, Card, PageShell, Pill, TextInput } from "@/components/Ui";
import { getEquitySeries, getQuote } from "@/lib/market-data";
import styles from "./page.module.css";

const symbols = ["NVDA", "TSLA", "LITE", "COHR", "MU", "AVGO", "AMD", "GLW"];

export default async function StocksPage() {
  const [technicalSeries, quotes] = await Promise.all([
    getEquitySeries("NVDA"),
    Promise.all(symbols.slice(0, 6).map((symbol) => getQuote(symbol)))
  ]);

  return (
    <PageShell title="个股分析模块" compactTitle>
      <Card className={styles.inputPanel}>
        <TextInput className={styles.stockInput} placeholder="NVDA, TSLA, LITE, COHR, MU" />
        <div className={styles.addButton}><Button>添加股票</Button></div>
        <div className={styles.clearButton}><Button variant="secondary">清空股票</Button></div>
        <div className={styles.tags}>
          {symbols.map((symbol) => <Pill tone="gray" key={symbol}>{symbol}</Pill>)}
        </div>
      </Card>

      <Card className={styles.stockListPanel}>
        <h2>股票列表</h2>
        <p>每只股票都有独立 AI分析 按钮。</p>
        <Pill tone="green" className={styles.countPill}>当前 8 / 15</Pill>
        <div className={styles.stockRows}>
          {quotes.map((quote, index) => (
            <div className={`${styles.stockRow} ${index === 0 ? styles.activeRow : ""}`} key={quote.symbol}>
              <strong>{quote.symbol}</strong>
              <span>{formatMoney(quote.price)}</span>
              <em className={(quote.changePercent ?? 0) >= 0 ? styles.up : styles.down}>{formatPercent(quote.changePercent)}</em>
              <button>AI分析</button>
            </div>
          ))}
        </div>
        <Pill tone="gray" className={styles.remaining}>剩余 7 个空位</Pill>
      </Card>

      <Card className={styles.chartPanel}>
        <h2>图像化技术指标：NVDA</h2>
        <p>展示K线、MA20、MA50、MA120、MA250、RSI和成交量，不再只用表格。</p>
        <div className={styles.metrics}>
          <Metric label="当前价格" value={formatMoney(quotes[0]?.price)} note={formatPercent(quotes[0]?.changePercent)} tone="green" />
          <Metric label="RSI" value={latestValue(technicalSeries.rsi)} note={technicalSeries.status === "ready" ? "真实计算" : "数据源待接入"} tone="amber" />
          <Metric label="成交量" value={quotes[0]?.volume ? "已接入" : "待接入"} note={quotes[0]?.avgVolume ? "含均量" : "数据源待接入"} tone="blue" />
        </div>
        <div className={styles.embeddedChart}>
          <MarketChart title="价格 / 均线 / RSI / 成交量" subtitle="" series={technicalSeries} compact />
        </div>
      </Card>

      <Card className={styles.aiPanel}>
        <h2>AI 深入调研输出</h2>
        <p>点击某只股票的 AI分析 后，输出完整公司研究：基本面 + 技术面 + 区间辅助。</p>
        <Pill tone="blue" className={styles.currentPill}>当前：NVDA</Pill>
        <section className={styles.rangePanel}>
          <h3>区间辅助输出</h3>
          <div>
            <article>
              <span>辅助观察区间</span>
              <strong>{technicalSeries.status === "ready" ? "由均线与RSI计算" : "暂无数据"}</strong>
              <em>数据不足不输出确定价格</em>
            </article>
            <article>
              <span>风险区间</span>
              <strong>{technicalSeries.status === "ready" ? "跌破关键均线" : "暂无数据"}</strong>
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
