"use client";

import { useState } from "react";
import styles from "./page.module.css";

const modules = [
  { key: "dashboard", label: "仪表盘模块", path: "/dashboard" },
  { key: "info", label: "信息抓取和分析模块", path: "/info" },
  { key: "industry", label: "行业分析模块", path: "/industry" },
  { key: "stocks", label: "个股分析模块", path: "/stocks" }
];

export default function Home() {
  const [activeModule, setActiveModule] = useState(modules[0]);

  return (
    <main className={styles.portal}>
      <header className={styles.switcher}>
        <div>
          <p>美股交易决策辅助系统</p>
          <h1>模块入口</h1>
        </div>
        <nav aria-label="模块切换">
          {modules.map((module) => (
            <button
              className={module.key === activeModule.key ? styles.active : ""}
              key={module.key}
              onClick={() => setActiveModule(module)}
              type="button"
            >
              {module.label}
            </button>
          ))}
        </nav>
      </header>
      <iframe className={styles.moduleFrame} src={activeModule.path} title={activeModule.label} />
    </main>
  );
}
