import { NextResponse } from "next/server";
import { getEquitySeries, getQuote } from "@/lib/market-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 15);

  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const [quote, technicals] = await Promise.all([getQuote(symbol), getEquitySeries(symbol)]);
      return {
        symbol,
        companyName: symbol,
        quote,
        technicals,
        decisionLevel: technicals.status === "ready" ? "观察" : "等待确认",
        observationRange: technicals.status === "ready" ? "由技术区间辅助观察" : "暂无数据",
        riskRange: technicals.status === "ready" ? "跌破关键均线需谨慎" : "数据源待接入",
        financialSummary: quote.status === "ready" ? "财务摘要待接入 FMP/SEC 明细" : "数据源待接入",
        flowSummary: quote.status === "ready" ? "资金流向需结合成交量与外部资金数据确认" : "数据源待接入",
        xSummary: "X 信息待接入"
      };
    })
  );

  return NextResponse.json({ symbols, results });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { symbols?: string[] | string };
  const rawSymbols = Array.isArray(body.symbols) ? body.symbols.join(",") : body.symbols ?? "";
  const requestUrl = new URL(request.url);
  requestUrl.searchParams.set("symbols", rawSymbols);
  return GET(new Request(requestUrl));
}
