import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "source_pending",
    message: "X API、SEC EDGAR、FMP 与 Alpha Vantage 数据源待接入",
    accounts: ["@Semianalysis", "@elonmusk", "@nvidia", "@OpenAI", "@federalreserve", "@Broadcom", "@AMD", "@CNBC"],
    posts: [],
    analysisRules: {
      truthLevels: ["已验证", "部分可验证", "暂无证据", "存疑", "明显不可靠"],
      mappingLevels: ["直接相关", "间接相关", "弱相关", "暂无明确关系"]
    }
  });
}
