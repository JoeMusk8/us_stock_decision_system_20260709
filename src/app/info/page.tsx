"use client";

import { useState } from "react";
import { Button, Card, PageShell, Pill, TextInput } from "@/components/Ui";
import styles from "./page.module.css";

type ApiState = {
  status: string;
  message: string;
  accounts?: string[];
};

export default function InfoPage() {
  const [input, setInput] = useState("");
  const [accounts, setAccounts] = useState<string[]>([]);
  const [apiState, setApiState] = useState<ApiState | null>(null);
  const [loading, setLoading] = useState(false);

  async function syncAccounts(nextAccounts = accounts) {
    setLoading(true);
    const response = await fetch("/api/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "track_accounts", accounts: nextAccounts })
    });
    const data = (await response.json()) as ApiState;
    setApiState(data);
    setLoading(false);
  }

  async function addAccounts() {
    const parsed = input
      .split(/[,\s/]+/)
      .map((account) => account.trim())
      .filter(Boolean)
      .map((account) => (account.startsWith("@") ? account : `@${account}`));
    const nextAccounts = Array.from(new Set([...accounts, ...parsed])).slice(0, 15);
    setAccounts(nextAccounts);
    setInput("");
    await syncAccounts(nextAccounts);
  }

  async function clearAccounts() {
    setAccounts([]);
    setInput("");
    await syncAccounts([]);
  }

  return (
    <PageShell title="信息抓取和分析模块">
      <Card className={styles.inputPanel}>
        <label>输入 X 账号，最多 15 个</label>
        <TextInput
          className={styles.accountInput}
          placeholder="输入 X 账号，多个账号可用逗号或空格分隔"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <div className={styles.addButton}><Button onClick={addAccounts} disabled={loading}>添加账号</Button></div>
        <div className={styles.clearButton}><Button variant="secondary" onClick={clearAccounts} disabled={loading}>清空账号</Button></div>
        <Pill tone="green" className={styles.countPill}>当前 {accounts.length} / 15</Pill>
      </Card>

      <Card className={styles.accountsPanel}>
        <h2>跟踪账号</h2>
        <p>点击账号可查看该账号输出内容。</p>
        {accounts.length > 0 ? (
          <div className={styles.accountList}>
            {accounts.map((account, index) => (
              <div className={`${styles.accountRow} ${index === 0 ? styles.activeRow : ""}`} key={account}>
                <Pill tone="blue" className={styles.xPill}>X</Pill>
                <strong>{account}</strong>
                <Pill tone={index === 0 ? "green" : "gray"} className={styles.statusPill}>{index === 0 ? "当前" : "待接入"}</Pill>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>暂无跟踪账号。添加账号后将调用 X API 通路。</div>
        )}
        <Pill tone="gray" className={styles.remaining}>剩余 {15 - accounts.length} 个空位</Pill>
      </Card>

      <Card className={styles.postsPanel}>
        <h2>按账号输出内容</h2>
        <Pill tone="amber" className={styles.currentAccount}>X API 待接入</Pill>
        <div className={styles.emptyPosts}>
          <strong>暂无真实 X 内容</strong>
          <p>系统不会显示示例推文。配置 `X_BEARER_TOKEN` 后，账号内容将在这里按账号输出。</p>
          <button onClick={() => syncAccounts()} disabled={loading}>刷新接口</button>
        </div>
      </Card>

      <Card className={styles.analysisPanel}>
        <h2>AI 分析输出栏</h2>
        <p>选择某条账号内容并点击“AI分析”后，在这里显示结果。</p>
        <Pill tone="amber" className={styles.waiting}>{loading ? "请求中" : "等待真实内容"}</Pill>
        <div className={styles.selectedBox}>
          <strong>当前分析对象</strong>
          <span>暂无真实 X 内容</span>
          <span>配置 X API 后可选择内容并触发 AI 分析。</span>
        </div>
        <div className={styles.resultBox}>
          <strong>AI分析结果</strong>
          <span>真实性：暂无证据</span>
          <span>公司映射：暂无明确关系</span>
          <span>影响方向：暂无数据</span>
          <span>影响强度：暂无数据</span>
          <span>证据来源：数据源待接入</span>
          <span>{apiState?.message ?? "按钮已连接 /api/info，等待 API key 配置。"}</span>
        </div>
        <div className={styles.verifyBox}>待验证事项：配置 X API、SEC EDGAR、FMP、Alpha Vantage 与 OpenAI 后再输出证据。</div>
      </Card>
    </PageShell>
  );
}
