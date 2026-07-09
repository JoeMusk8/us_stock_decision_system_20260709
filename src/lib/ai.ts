const PROHIBITED_TERMS = [
  "立即买入",
  "立即卖出",
  "最佳买入价格",
  "最佳卖出价格",
  "保证盈利",
  "一定上涨"
];

export function sanitizeAiText(text: string): string {
  return PROHIBITED_TERMS.reduce((current, term) => current.replaceAll(term, "辅助观察"), text);
}

export function dataUnavailable(reason = "数据源待接入") {
  return {
    status: "source_pending" as const,
    message: reason
  };
}
