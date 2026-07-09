import { Button, Card, PageShell, Pill, TextInput } from "@/components/Ui";
import styles from "./page.module.css";

const columns = [
  ["上游：资源 / 设备 / 零部件", ["光器件材料", "半导体设备", "电力设备", "关键零部件", "待验证供应商"]],
  ["中游：制造 / 集成 / 平台", ["光模块 / CPO", "服务器与网络", "存储与 HBM", "系统集成", "核心瓶颈公司"]],
  ["下游：客户 / 应用 / 需求", ["云厂商", "AI训练集群", "数据中心", "机器人应用", "政府/国防合同"]]
] as const;

const companies = [
  ["NVDA", "算力与网络核心", "直接相关", "green"],
  ["AVGO", "网络芯片 / CPO", "直接相关", "green"],
  ["LITE", "光器件与模块", "间接相关", "green"],
  ["COHR", "光通信与材料", "间接相关", "green"],
  ["GLW", "光纤与玻璃材料", "待验证", "amber"],
  ["VRT", "数据中心电力", "直接相关", "green"]
] as const;

export default function IndustryPage() {
  return (
    <PageShell title="行业分析模块">
      <Card className={styles.inputPanel}>
        <label>输入行业名称</label>
        <TextInput className={styles.industryInput} placeholder="AI基础设施 / CPO / 半导体 / 数据中心电力 / 机器人 / 存储" />
        <div className={styles.startButton}><Button>开始分析</Button></div>
        <div className={styles.clearButton}><Button variant="secondary">清空</Button></div>
      </Card>

      <Card className={styles.mapPanel}>
        <h2>产业链全景图谱</h2>
        <p>上游 / 中游 / 下游拆解，并标注核心受益公司与待验证关系。</p>
        <div className={styles.chainColumns}>
          {columns.map(([title, items], index) => (
            <section className={`${styles.chainColumn} ${index === 1 ? styles.midColumn : ""}`} key={title}>
              <h3>{title}</h3>
              {items.map((item) => <div className={styles.chainNode} key={item}>{item}</div>)}
            </section>
          ))}
        </div>
      </Card>

      <Card className={styles.radarPanel}>
        <h2>核心公司雷达</h2>
        <p>显示行业强相关公司；无法验证则标注待验证。</p>
        <div className={styles.companyList}>
          {companies.map(([ticker, label, relation, tone]) => (
            <div className={styles.companyRow} key={ticker}>
              <strong>{ticker}</strong>
              <span>{label}</span>
              <Pill tone={tone} className={styles.relation}>{relation}</Pill>
            </div>
          ))}
        </div>
      </Card>

      <Card className={styles.summaryPanel}>
        <h2>AI行业逻辑摘要</h2>
        <p>输出：行业名称、行业简介、上游公司、中游公司、下游公司、核心公司、相关美股代码、行业逻辑摘要、AI分析结论、待验证事项。AI 不允许编造产业链关系。</p>
      </Card>
    </PageShell>
  );
}
