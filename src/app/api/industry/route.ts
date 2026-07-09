import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry") ?? "";

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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { industry?: string };
  const industry = body.industry?.trim() ?? "";

  return NextResponse.json({
    status: "source_pending",
    industry,
    message: "行业分析 API 通路已准备，当前数据源待接入，不生成产业链关系。",
    upstream: [],
    midstream: [],
    downstream: [],
    coreCompanies: [],
    relatedTickers: [],
    conclusion: "数据源待接入，AI 不编造产业链关系。",
    verificationItems: ["配置 X_BEARER_TOKEN", "配置 FMP_API_KEY", "配置 ALPHA_VANTAGE_API_KEY", "配置 OPENAI_API_KEY"]
  });
}
