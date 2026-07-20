export interface Asset {
  symbol: string;
  name: string;
}

export interface ScenarioTick {
  day: number;
  label: string;
  prices: Record<string, number>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  peakToTroughPct: number;
  assets: Asset[];
  ticks: ScenarioTick[];
}

export interface Holding {
  symbol: string;
  quantity: number;
}

export interface Player {
  id: string;
  socketId: string | null;
  name: string;
  cash: number;
  holdings: Record<string, number>;
  connected: boolean;
  disconnectedAt: number | null;
  isHost: boolean;
}

export type RoomStatus = "lobby" | "running" | "ended";

export interface Room {
  code: string;
  scenarioId: string;
  status: RoomStatus;
  players: Map<string, Player>;
  currentTickIndex: number;
  tickEndsAt: number | null;
  tickDurationMs: number;
  startingCash: number;
  createdAt: number;
  tickTimer: NodeJS.Timeout | null;
}

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
