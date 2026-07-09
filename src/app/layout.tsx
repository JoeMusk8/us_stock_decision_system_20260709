import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "美股交易决策辅助系统",
  description: "四模块独立的美股交易决策辅助系统"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
