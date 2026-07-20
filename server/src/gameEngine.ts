import type { Server } from "socket.io";
import type { Player, PublicPlayer, Room, RoomSnapshot, Scenario } from "./types";

function toPublicPlayer(player: Player): PublicPlayer {
  return {
    id: player.id,
    name: player.name,
    portfolioValue: player.portfolioValue,
    equityPercent: player.equityPercent,
    hasSubmitted: player.hasSubmitted,
    connected: player.connected,
    isHost: player.isHost,
  };
}

export function buildSnapshot(room: Room, scenario: Scenario): RoomSnapshot {
  const snapshot = scenario.snapshots[room.currentSnapshotIndex] ?? null;
  const isDecisionRound = room.status === "running" && room.currentSnapshotIndex < scenario.snapshots.length - 1;

  const players: PublicPlayer[] = Array.from(room.players.values())
    .map(toPublicPlayer)
    .sort((a, b) => b.portfolioValue - a.portfolioValue);

  return {
    code: room.code,
    scenarioId: room.scenarioId,
    scenarioName: scenario.name,
    status: room.status,
    currentSnapshotIndex: room.currentSnapshotIndex,
    totalSnapshots: scenario.snapshots.length,
    roundEndsAt: room.roundEndsAt,
    roundDurationMs: room.roundDurationMs,
    isDecisionRound,
    snapshot,
    snapshotHistory: scenario.snapshots.slice(0, room.currentSnapshotIndex + 1),
    players,
  };
}

function broadcastSnapshot(io: Server, room: Room, scenario: Scenario): void {
  io.to(room.code).emit("room-update", buildSnapshot(room, scenario));
}

function applyReturn(room: Room, snapshot: Scenario["snapshots"][number]): void {
  for (const player of room.players.values()) {
    const equityFrac = player.equityPercent / 100;
    const debtFrac = 1 - equityFrac;
    const growth = equityFrac * (snapshot.equityReturnPct / 100) + debtFrac * (snapshot.debtReturnPct / 100);
    player.portfolioValue = Math.round(player.portfolioValue * (1 + growth) * 100) / 100;
  }
}

export function startGame(io: Server, room: Room, scenario: Scenario): void {
  if (room.status !== "lobby") return;
  room.status = "running";
  room.currentSnapshotIndex = 0;
  advanceToSnapshot(io, room, scenario, 0);
}

export function advanceToSnapshot(io: Server, room: Room, scenario: Scenario, index: number): void {
  if (room.roundTimer) {
    clearTimeout(room.roundTimer);
    room.roundTimer = null;
  }

  room.currentSnapshotIndex = index;
  const snapshot = scenario.snapshots[index];

  if (index > 0) {
    applyReturn(room, snapshot);
  }

  const isLastSnapshot = index >= scenario.snapshots.length - 1;
  if (isLastSnapshot) {
    endGame(io, room, scenario);
    return;
  }

  for (const player of room.players.values()) {
    player.hasSubmitted = false;
  }

  room.roundEndsAt = Date.now() + room.roundDurationMs;
  broadcastSnapshot(io, room, scenario);

  room.roundTimer = setTimeout(() => {
    advanceToSnapshot(io, room, scenario, room.currentSnapshotIndex + 1);
  }, room.roundDurationMs);
}

function endGame(io: Server, room: Room, scenario: Scenario): void {
  room.status = "ended";
  room.roundEndsAt = null;
  broadcastSnapshot(io, room, scenario);
}

export interface SetAllocationResult {
  ok: boolean;
  error?: string;
}

export function setAllocation(room: Room, playerId: string, equityPercent: number): SetAllocationResult {
  if (room.status !== "running") {
    return { ok: false, error: "This room isn't in an active round." };
  }
  const player = room.players.get(playerId);
  if (!player) return { ok: false, error: "Player not found in room." };
  if (player.hasSubmitted) {
    return { ok: false, error: "You've already submitted this round." };
  }

  if (!Number.isFinite(equityPercent)) {
    return { ok: false, error: "Invalid allocation." };
  }

  player.equityPercent = Math.max(0, Math.min(100, Math.round(equityPercent * 10) / 10));
  return { ok: true };
}

export function submitAllocation(room: Room, playerId: string): SetAllocationResult {
  if (room.status !== "running") {
    return { ok: false, error: "This room isn't in an active round." };
  }
  const player = room.players.get(playerId);
  if (!player) return { ok: false, error: "Player not found in room." };

  player.hasSubmitted = true;
  return { ok: true };
}

export function allConnectedPlayersSubmitted(room: Room): boolean {
  const connectedPlayers = Array.from(room.players.values()).filter((p) => p.connected);
  if (connectedPlayers.length === 0) return false;
  return connectedPlayers.every((p) => p.hasSubmitted);
}

export { broadcastSnapshot };
