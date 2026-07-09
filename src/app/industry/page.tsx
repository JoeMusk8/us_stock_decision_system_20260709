"use client";

import { useState } from "react";
import { Button, Card, PageShell, Pill, TextInput } from "@/components/Ui";
import styles from "./page.module.css";

const columns = [
  ["上游：资源 / 设备 / 零部件", "upstream"],
  ["中游：制造 / 集成 / 平台", "midstream"],
  ["下游：客户 / 应用 / 需求", "downstream"]
] as const;

type ApiState = {
  status: string;
  industry: string;
  message: string;
  upstream: string[];
  midstream: string[];
  downstream: string[];
  coreCompanies: Array<{ ticker?: string; name?: string; relation?: string }>;
  conclusion: string;
};

export default function IndustryPage() {
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiState, setApiState] = useState<ApiState | null>(null);

  async function analyzeIndustry() {
    setLoading(true);
    const response = await fetch("/api/industry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry })
    });
    const data = (await response.json()) as ApiState;
    setApiState(data);
    setLoading(false);
  }

  function clearIndustry() {
    setIndustry("");
    setApiState(null);
  }

  return (
    <PageShell title="行业分析模块">
      <Card className={styles.inputPanel}>
        <label>输入行业名称</label>
        <TextInput
          className={styles.industryInput}
          placeholder="请输入行业名称"
          value={industry}
          onChange={(event) => setIndustry(event.target.value)}
        />
        <div className={styles.startButton}><Button onClick={analyzeIndustry} disabled={loading}>开始分析</Button></div>
        <div className={styles.clearButton}><Button variant="secondary" onClick={clearIndustry} disabled={loading}>清空</Button></div>
      </Card>

      <Card className={styles.mapPanel}>
        <h2>产业链全景图谱</h2>
        <p>上游 / 中游 / 下游拆解，并标注核心受益公司与待验证关系。</p>
        <div className={styles.chainColumns}>
          {columns.map(([title, key], index) => {
            const items = apiState?.[key] ?? [];
            return (
            <section className={`${styles.chainColumn} ${index === 1 ? styles.midColumn : ""}`} key={title}>
              <h3>{title}</h3>
              {items.length > 0
                ? items.map((item) => <div className={styles.chainNode} key={item}>{item}</div>)
                : Array.from({ length: 5 }, (_, itemIndex) => (
                  <div className={styles.chainNode} key={itemIndex}>数据源待接入</div>
                ))}
            </section>
            );
          })}
        </div>
      </Card>

      <Card className={styles.radarPanel}>
        <h2>核心公司雷达</h2>
        <p>显示行业强相关公司；无法验证则标注待验证。</p>
        {apiState?.coreCompanies?.length ? (
          <div className={styles.companyList}>
            {apiState.coreCompanies.map((company, index) => (
              <div className={styles.companyRow} key={`${company.ticker ?? company.name}-${index}`}>
                <strong>{company.ticker ?? "待验证"}</strong>
                <span>{company.name ?? "数据源待接入"}</span>
                <Pill tone="amber" className={styles.relation}>{company.relation ?? "待验证"}</Pill>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.radarEmpty}>暂无已验证核心公司。配置数据源后再显示公司映射。</div>
        )}
      </Card>

      <Card className={styles.summaryPanel}>
        <h2>AI行业逻辑摘要</h2>
        <p>{apiState?.message ?? "按钮已连接 /api/industry。数据源未接入前，不生成行业链关系、公司映射或 AI 结论。"}</p>
      </Card>
    </PageShell>
  );
}
