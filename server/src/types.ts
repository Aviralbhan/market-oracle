export interface ScenarioSnapshot {
  index: number;
  label: string;
  narrative: string;
  /** % return applied entering this snapshot from the previous one. 0 for index 0 (baseline). */
  equityReturnPct: number;
  debtReturnPct: number;
  /** Cumulative index values for charting, starting at 100 at index 0. */
  equityIndex: number;
  debtIndex: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  peakToTroughPct: number;
  snapshots: ScenarioSnapshot[];
}

export interface Player {
  id: string;
  socketId: string | null;
  name: string;
  portfolioValue: number;
  /** Current allocation choice, 0-100. Rest is allocated to debt. */
  equityPercent: number;
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
  currentSnapshotIndex: number;
  roundEndsAt: number | null;
  roundDurationMs: number;
  startingCash: number;
  createdAt: number;
  roundTimer: NodeJS.Timeout | null;
}

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
