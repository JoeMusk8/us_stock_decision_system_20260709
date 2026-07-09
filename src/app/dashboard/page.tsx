import { MarketChart } from "@/components/MarketChart";
import { Card, PageShell, Pill, TextInput } from "@/components/Ui";
import { getCryptoSeries, getEquitySeries, getQuote } from "@/lib/market-data";
import styles from "./page.module.css";

const reminders = Array.from({ length: 15 }, (_, index) => `提醒${index + 1}：输入事件/日期`);

export default async function DashboardPage() {
  const [nasdaqQuote, nasdaqSeries, btcSeries] = await Promise.all([
    getQuote("QQQ"),
    getEquitySeries("QQQ"),
    getCryptoSeries("BTCUSD")
  ]);

  return (
    <PageShell title="仪表盘模块" compactTitle>
      <div className={styles.metricGrid}>
        <TopMetric title="纳斯达克指数" value={formatMoney(nasdaqQuote.price, "")} note={formatPercent(nasdaqQuote.changePercent, "日内")} tone="green" />
        <TopMetric title="纳斯达克资金流向" value="数据源待接入" note="资金流向待接入" tone="amber" />
        <TopMetric title="纳斯达克 RSI" value={latestValue(nasdaqSeries.rsi)} note={nasdaqSeries.status === "ready" ? "真实计算" : "数据源待接入"} tone="blue" />
        <TopMetric title="比特币实时价格" value={latestBtc(btcSeries)} note={btcSeries.status === "ready" ? "风险偏好参考" : "数据源待接入"} tone="purple" />
        <TopMetric title="市场情绪状态" value="数据源待接入" note="只显示恐惧 / 贪婪" tone="amber" wide />
      </div>

      <Card className={styles.nasdaqChart}>
        <MarketChart title="纳斯达克技术状态图" subtitle="图形化展示 QQQ / 纳指：K线、MA20、MA50、MA120、MA250、RSI、成交量。" series={nasdaqSeries} />
      </Card>

      <Card className={styles.btcChart}>
        <MarketChart title="比特币技术状态图" subtitle="图形化展示 BTC：实时价格、K线、MA20、MA50、MA120、MA250、RSI、成交量。" series={btcSeries} />
      </Card>

      <Card className={styles.aiPanel}>
        <h2>每日AI综合分析输出窗口</h2>
        <p>每日由 AI 根据纳斯达克、资金流向、RSI、均线结构、成交量、比特币和事件日历输出。</p>
        <div className={styles.pills}>
          <Pill tone="amber">市场状态：谨慎</Pill>
          <Pill tone="amber">情绪：待接入</Pill>
          <Pill tone="gray">风险偏好：待确认</Pill>
        </div>
        <div className={styles.aiText}>今日AI结论：关键数据源尚未全部接入，系统不做确定性判断；等待纳斯达克、资金流向、RSI、均线、成交量、BTC和情绪数据同步后再输出市场辅助等级。</div>
      </Card>

      <Card className={styles.reminderPanel}>
        <h2>自定义时间提醒跟踪输入</h2>
        <p>具体提醒哪些内容由用户输入，至少支持 15 个跟踪窗口。</p>
        <Pill tone="gray" className={styles.reminderCount}>15个输入窗口</Pill>
        <div className={styles.reminders}>
          {reminders.map((placeholder) => <TextInput key={placeholder} placeholder={placeholder} />)}
        </div>
      </Card>
    </PageShell>
  );
}

function TopMetric({ title, value, note, tone, wide = false }: { title: string; value: string; note: string; tone: "green" | "amber" | "blue" | "purple"; wide?: boolean }) {
  return (
    <Card className={`${styles.topMetric} ${wide ? styles.wideMetric : ""}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <em>{note}</em>
      <i className={styles[`${tone}Dot`]} />
    </Card>
  );
}

function latestValue(points: Array<{ value: number }>): string {
  const latest = points.at(-1);
  return latest ? String(latest.value) : "待接入";
}

function latestBtc(series: { candles: Array<{ close: number }> }): string {
  const latest = series.candles.at(-1);
  return latest ? `$${latest.close.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "数据源待接入";
}

function formatMoney(value: number | null, prefix = "$"): string {
  if (value == null) {
    return "数据源待接入";
  }
  return `${prefix}${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function formatPercent(value: number | null, label: string): string {
  if (value == null) {
    return "数据源待接入";
  }
  return `${label} ${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
