import { NextResponse } from "next/server";
import { getCryptoSeries, getEquitySeries, getQuote } from "@/lib/market-data";

export async function GET() {
  const [nasdaqQuote, nasdaqTechnicals, btcTechnicals] = await Promise.all([
    getQuote("QQQ"),
    getEquitySeries("QQQ"),
    getCryptoSeries("BTCUSD")
  ]);

  return NextResponse.json({
    nasdaq: {
      label: "纳斯达克指数",
      quote: nasdaqQuote,
      technicals: nasdaqTechnicals,
      flow: nasdaqQuote.status === "ready" ? "资金流向待接入" : "数据源待接入"
    },
    bitcoin: {
      label: "比特币实时价格",
      technicals: btcTechnicals
    },
    sentiment: {
      label: "市场情绪",
      value: "数据源待接入",
      fearGreed: "数据源待接入"
    },
    events: {
      nonFarmPayroll: "数据源待接入",
      fedMeeting: "数据源待接入",
      earnings: "数据源待接入"
    },
    aiInterpretation: "数据不足时不做确定性判断，等待行情、情绪与事件数据源接入。",
    marketLevel: "谨慎环境"
  });
}
