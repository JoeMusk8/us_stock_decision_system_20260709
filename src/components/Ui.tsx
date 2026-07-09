import type { ReactNode } from "react";
import styles from "./Ui.module.css";

export function PageShell({ title, children, compactTitle = false }: { title: string; children: ReactNode; compactTitle?: boolean }) {
  return (
    <main className={styles.page}>
      <p className={compactTitle ? styles.brandSmall : styles.brand}>美股交易决策辅助系统</p>
      <h1 className={compactTitle ? styles.titleSmall : styles.title}>{title}</h1>
      <div className={styles.rule} />
      {children}
    </main>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`${styles.card} ${className}`}>{children}</section>;
}

export function Button({ children, variant = "primary" }: { children: ReactNode; variant?: "primary" | "secondary" }) {
  return <button className={variant === "primary" ? styles.primaryButton : styles.secondaryButton}>{children}</button>;
}

export function Pill({ children, tone = "gray", className = "" }: { children: ReactNode; tone?: "gray" | "green" | "blue" | "amber" | "purple"; className?: string }) {
  return <span className={`${styles.pill} ${styles[tone]} ${className}`}>{children}</span>;
}

export function TextInput({ placeholder, className = "" }: { placeholder: string; className?: string }) {
  return <input className={`${styles.input} ${className}`} placeholder={placeholder} />;
}
