export type DataStatus = "ready" | "source_pending" | "insufficient" | "error";

export type CandlePoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type LinePoint = {
  time: string;
  value: number;
};

export type VolumePoint = {
  time: string;
  value: number;
  color?: string;
};

export type TechnicalSeries = {
  status: DataStatus;
  message?: string;
  candles: CandlePoint[];
  ma20: LinePoint[];
  ma50: LinePoint[];
  ma120: LinePoint[];
  ma250: LinePoint[];
  rsi: LinePoint[];
  volume: VolumePoint[];
};

export type StockDecisionLevel =
  | "不参与"
  | "观察"
  | "等待确认"
  | "可重点关注"
  | "高风险，谨慎";

export type MarketLevel = "积极环境" | "中性环境" | "谨慎环境" | "高风险环境";

export type MappingLevel = "直接相关" | "间接相关" | "弱相关" | "暂无明确关系";

export type TruthLevel = "已验证" | "部分可验证" | "暂无证据" | "存疑" | "明显不可靠";
