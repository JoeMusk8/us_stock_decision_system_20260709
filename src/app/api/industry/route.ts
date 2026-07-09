import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry") ?? "AI基础设施";

  return NextResponse.json({
    status: "source_pending",
    industry,
    message: "当前数据不足，部分行业链关系需要人工验证。",
    upstream: ["待验证"],
    midstream: ["待验证"],
    downstream: ["待验证"],
    coreCompanies: [],
    relatedTickers: [],
    conclusion: "数据源待接入，AI 不编造产业链关系。",
    verificationItems: ["接入 X API", "接入 FMP", "接入 SEC EDGAR", "接入 Alpha Vantage"]
  });
}
