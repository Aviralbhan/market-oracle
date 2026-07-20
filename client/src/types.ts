export interface ScenarioSnapshot {
  index: number;
  label: string;
  narrative: string;
  equityReturnPct: number;
  debtReturnPct: number;
  equityIndex: number;
  debtIndex: number;
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
  portfolioValue: number;
  equityPercent: number;
  connected: boolean;
  isHost: boolean;
}

export interface RoomSnapshot {
  code: string;
  scenarioId: string;
  scenarioName: string;
  status: RoomStatus;
  currentSnapshotIndex: number;
  totalSnapshots: number;
  roundEndsAt: number | null;
  roundDurationMs: number;
  isDecisionRound: boolean;
  snapshot: ScenarioSnapshot | null;
  snapshotHistory: ScenarioSnapshot[];
  players: PublicPlayer[];
}

export interface SetAllocationRequest {
  equityPercent: number;
}

export interface SetAllocationResult {
  ok: boolean;
  error?: string;
}
