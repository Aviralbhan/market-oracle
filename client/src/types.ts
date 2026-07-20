export interface Asset {
  symbol: string;
  name: string;
}

export interface ScenarioTick {
  day: number;
  label: string;
  prices: Record<string, number>;
}

export interface ScenarioSummary {
  id: string;
  name: string;
  description: string;
  peakToTroughPct: number;
}

export type RoomStatus = "lobby" | "running" | "ended";

export interface PublicPlayer {
  id: string;
  name: string;
  cash: number;
  holdings: Record<string, number>;
  connected: boolean;
  isHost: boolean;
  portfolioValue: number;
}

export interface RoomSnapshot {
  code: string;
  scenarioId: string;
  scenarioName: string;
  assets: Asset[];
  status: RoomStatus;
  currentTickIndex: number;
  tickEndsAt: number | null;
  tickDurationMs: number;
  tick: ScenarioTick | null;
  priceHistory: ScenarioTick[];
  players: PublicPlayer[];
  totalTicks: number;
}

export interface TradeRequest {
  symbol: string;
  action: "buy" | "sell";
  quantity: number;
}

export interface TradeResult {
  ok: boolean;
  error?: string;
}
