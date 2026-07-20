import type { Server } from "socket.io";
import type { Player, PublicPlayer, Room, RoomSnapshot, Scenario, TradeRequest } from "./types";

function currentPrices(room: Room, scenario: Scenario): Record<string, number> | null {
  const tick = scenario.ticks[room.currentTickIndex];
  return tick ? tick.prices : null;
}

export function portfolioValue(player: Player, prices: Record<string, number> | null): number {
  let value = player.cash;
  for (const [symbol, quantity] of Object.entries(player.holdings)) {
    const price = prices?.[symbol] ?? 0;
    value += price * quantity;
  }
  return Math.round(value * 100) / 100;
}

export function buildSnapshot(room: Room, scenario: Scenario): RoomSnapshot {
  const tick = scenario.ticks[room.currentTickIndex] ?? null;
  const prices = tick ? tick.prices : null;

  const players: PublicPlayer[] = Array.from(room.players.values())
    .map((p) => ({
      id: p.id,
      name: p.name,
      cash: p.cash,
      holdings: p.holdings,
      connected: p.connected,
      isHost: p.isHost,
      portfolioValue: portfolioValue(p, prices),
    }))
    .sort((a, b) => b.portfolioValue - a.portfolioValue);

  return {
    code: room.code,
    scenarioId: room.scenarioId,
    scenarioName: scenario.name,
    assets: scenario.assets,
    status: room.status,
    currentTickIndex: room.currentTickIndex,
    tickEndsAt: room.tickEndsAt,
    tickDurationMs: room.tickDurationMs,
    tick,
    priceHistory: scenario.ticks.slice(0, room.currentTickIndex + 1),
    players,
    totalTicks: scenario.ticks.length,
  };
}

function broadcastSnapshot(io: Server, room: Room, scenario: Scenario): void {
  io.to(room.code).emit("room-update", buildSnapshot(room, scenario));
}

export function startGame(io: Server, room: Room, scenario: Scenario): void {
  if (room.status !== "lobby") return;
  room.status = "running";
  room.currentTickIndex = 0;
  scheduleTick(io, room, scenario);
}

function scheduleTick(io: Server, room: Room, scenario: Scenario): void {
  room.tickEndsAt = Date.now() + room.tickDurationMs;
  broadcastSnapshot(io, room, scenario);

  room.tickTimer = setTimeout(() => {
    advanceTick(io, room, scenario);
  }, room.tickDurationMs);
}

function advanceTick(io: Server, room: Room, scenario: Scenario): void {
  room.currentTickIndex += 1;
  if (room.currentTickIndex >= scenario.ticks.length) {
    endGame(io, room, scenario);
    return;
  }
  scheduleTick(io, room, scenario);
}

function endGame(io: Server, room: Room, scenario: Scenario): void {
  room.status = "ended";
  room.tickEndsAt = null;
  room.currentTickIndex = scenario.ticks.length - 1;
  if (room.tickTimer) {
    clearTimeout(room.tickTimer);
    room.tickTimer = null;
  }
  broadcastSnapshot(io, room, scenario);
}

export interface TradeResult {
  ok: boolean;
  error?: string;
}

export function executeTrade(room: Room, scenario: Scenario, playerId: string, req: TradeRequest): TradeResult {
  if (room.status !== "running") {
    return { ok: false, error: "Market is not open right now." };
  }

  const player = room.players.get(playerId);
  if (!player) return { ok: false, error: "Player not found in room." };

  const prices = currentPrices(room, scenario);
  const price = prices?.[req.symbol];
  if (!price) return { ok: false, error: "Unknown asset." };

  const quantity = Math.round(Math.max(0, req.quantity) * 10000) / 10000;
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, error: "Quantity must be greater than zero." };
  }

  if (req.action === "buy") {
    const cost = Math.round(price * quantity * 100) / 100;
    if (cost > player.cash + 0.001) {
      return { ok: false, error: "Not enough cash for this trade." };
    }
    player.cash = Math.round((player.cash - cost) * 100) / 100;
    player.holdings[req.symbol] = Math.round(((player.holdings[req.symbol] ?? 0) + quantity) * 10000) / 10000;
    return { ok: true };
  }

  if (req.action === "sell") {
    const owned = player.holdings[req.symbol] ?? 0;
    if (quantity > owned + 0.0001) {
      return { ok: false, error: "Not enough shares to sell." };
    }
    const proceeds = Math.round(price * quantity * 100) / 100;
    player.cash = Math.round((player.cash + proceeds) * 100) / 100;
    const remaining = Math.round((owned - quantity) * 10000) / 10000;
    if (remaining <= 0.0001) {
      delete player.holdings[req.symbol];
    } else {
      player.holdings[req.symbol] = remaining;
    }
    return { ok: true };
  }

  return { ok: false, error: "Unknown trade action." };
}

export { broadcastSnapshot };
