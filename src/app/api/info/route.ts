import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "source_pending",
    message: "X API、SEC EDGAR、FMP 与 Alpha Vantage 数据源待接入",
    accounts: [],
    posts: [],
    analysisRules: {
      truthLevels: ["已验证", "部分可验证", "暂无证据", "存疑", "明显不可靠"],
      mappingLevels: ["直接相关", "间接相关", "弱相关", "暂无明确关系"]
    }
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { accounts?: string[]; action?: string };
  const accounts = (body.accounts ?? []).map((account) => account.trim()).filter(Boolean).slice(0, 15);

  return NextResponse.json({
    status: "source_pending",
    action: body.action ?? "track_accounts",
    message: "X API 尚未接入，已准备接收账号并等待数据源配置。",
    accounts,
    posts: [],
    analysis: null,
    verificationItems: ["配置 X_BEARER_TOKEN", "配置 FMP_API_KEY", "配置 ALPHA_VANTAGE_API_KEY", "配置 OPENAI_API_KEY"]
  });
}
