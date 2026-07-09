import { Button, Card, PageShell, Pill, TextInput } from "@/components/Ui";
import styles from "./page.module.css";

const accounts = ["@Semianalysis", "@elonmusk", "@nvidia", "@OpenAI", "@federalreserve", "@Broadcom", "@AMD", "@CNBC"];
const posts = [
  ["15分钟前", "AI服务器架构变化可能影响 CPO / PCB 供应链节奏。", "未分析"],
  ["42分钟前", "提到某AI集群扩展节奏和供应链瓶颈，需要进一步核验。", "未分析"],
  ["2小时前", "转发一份关于PCB/光互连产业链影响的研究观点。", "已分析"]
];

export default function InfoPage() {
  return (
    <PageShell title="信息抓取和分析模块">
      <Card className={styles.inputPanel}>
        <label>输入 X 账号，最多 15 个</label>
        <TextInput className={styles.accountInput} placeholder="例如：@Semianalysis / @elonmusk / @nvidia" />
        <div className={styles.addButton}><Button>添加账号</Button></div>
        <div className={styles.clearButton}><Button variant="secondary">清空账号</Button></div>
        <Pill tone="green" className={styles.countPill}>当前 8 / 15</Pill>
      </Card>

      <Card className={styles.accountsPanel}>
        <h2>跟踪账号</h2>
        <p>点击账号可查看该账号输出内容。</p>
        <div className={styles.accountList}>
          {accounts.map((account, index) => (
            <div className={`${styles.accountRow} ${index === 0 ? styles.activeRow : ""}`} key={account}>
              <Pill tone="blue" className={styles.xPill}>X</Pill>
              <strong>{account}</strong>
              <Pill tone={index === 0 ? "green" : "gray"} className={styles.statusPill}>{index === 0 ? "当前" : "输出"}</Pill>
            </div>
          ))}
        </div>
        <Pill tone="gray" className={styles.remaining}>剩余 7 个空位</Pill>
      </Card>

      <Card className={styles.postsPanel}>
        <h2>按账号输出内容</h2>
        <Pill tone="blue" className={styles.currentAccount}>当前账号：@Semianalysis</Pill>
        <div className={styles.postList}>
          {posts.map(([time, content, status]) => (
            <article className={styles.postCard} key={time}>
              <strong>@Semianalysis</strong>
              <span>{time}</span>
              <p>{content}</p>
              <Pill tone={status === "已分析" ? "green" : "amber"} className={styles.analysisState}>{status}</Pill>
              <button>AI分析</button>
            </article>
          ))}
        </div>
      </Card>

      <Card className={styles.analysisPanel}>
        <h2>AI 分析输出栏</h2>
        <p>选择某条账号内容并点击“AI分析”后，在这里显示结果。</p>
        <Pill tone="amber" className={styles.waiting}>等待选择内容</Pill>
        <div className={styles.selectedBox}>
          <strong>当前分析对象</strong>
          <span>账号：@Semianalysis</span>
          <span>内容：AI服务器架构变化可能影响 CPO / PCB 供应链节奏。</span>
        </div>
        <div className={styles.resultBox}>
          <strong>AI分析结果</strong>
          <span>相关主题：AI基础设施 / CPO / PCB</span>
          <span>相关公司：GLW / COHR / LITE</span>
          <span>真实性：部分可验证</span>
          <span>影响方向：可能偏负</span>
          <span>影响强度：中等</span>
          <span>证据来源：X原文 / 待接入SEC与FMP核验</span>
        </div>
        <div className={styles.verifyBox}>待验证事项：是否有公司公告、SEC文件、客户订单或财报指引支持该判断。</div>
      </Card>
    </PageShell>
  );
}
