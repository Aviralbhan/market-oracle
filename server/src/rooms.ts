import { randomUUID } from "crypto";
import type { Player, Room } from "./types";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const GRACE_MS = 2 * 60 * 1000;
const DEFAULT_ROUND_MS = 20000;

export class RoomManager {
  private rooms = new Map<string, Room>();
  private disconnectTimers = new Map<string, NodeJS.Timeout>();

  private generateRoomCode(): string {
    let code: string;
    do {
      code = Array.from({ length: 6 }, () =>
        ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
      ).join("");
    } while (this.rooms.has(code));
    return code;
  }

  createRoom(scenarioId: string, startingCash: number, roundDurationMs = DEFAULT_ROUND_MS): Room {
    const code = this.generateRoomCode();
    const room: Room = {
      code,
      scenarioId,
      status: "lobby",
      players: new Map(),
      currentSnapshotIndex: 0,
      roundEndsAt: null,
      roundDurationMs,
      startingCash,
      createdAt: Date.now(),
      roundTimer: null,
    };
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  deleteRoom(code: string): void {
    this.rooms.delete(code);
  }

  allRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  addPlayer(room: Room, name: string, socketId: string, isHost: boolean): Player {
    const player: Player = {
      id: randomUUID(),
      socketId,
      name: name.slice(0, 24).trim() || "Trader",
      portfolioValue: room.startingCash,
      equityPercent: 50,
      connected: true,
      disconnectedAt: null,
      isHost,
    };
    room.players.set(player.id, player);
    return player;
  }

  findPlayerBySocket(room: Room, socketId: string): Player | undefined {
    for (const player of room.players.values()) {
      if (player.socketId === socketId) return player;
    }
    return undefined;
  }

  private timerKey(roomCode: string, playerId: string): string {
    return `${roomCode}:${playerId}`;
  }

  markDisconnected(room: Room, playerId: string, onExpire: () => void): void {
    const player = room.players.get(playerId);
    if (!player) return;
    player.connected = false;
    player.socketId = null;
    player.disconnectedAt = Date.now();

    const key = this.timerKey(room.code, playerId);
    const existing = this.disconnectTimers.get(key);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      room.players.delete(playerId);
      this.disconnectTimers.delete(key);
      onExpire();
    }, GRACE_MS);
    this.disconnectTimers.set(key, timer);
  }

  rejoinPlayer(room: Room, playerId: string, newSocketId: string): Player | undefined {
    const player = room.players.get(playerId);
    if (!player) return undefined;

    const key = this.timerKey(room.code, playerId);
    const timer = this.disconnectTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(key);
    }

    player.connected = true;
    player.socketId = newSocketId;
    player.disconnectedAt = null;
    return player;
  }

  removePlayer(room: Room, playerId: string): void {
    const key = this.timerKey(room.code, playerId);
    const timer = this.disconnectTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(key);
    }
    room.players.delete(playerId);
  }

  sweepStaleRooms(maxAgeMs: number): void {
    const now = Date.now();
    for (const room of this.rooms.values()) {
      const noOneConnected = Array.from(room.players.values()).every((p) => !p.connected);
      const isStale = now - room.createdAt > maxAgeMs;
      if ((room.status === "ended" && noOneConnected) || (isStale && noOneConnected)) {
        if (room.roundTimer) clearTimeout(room.roundTimer);
        this.rooms.delete(room.code);
      }
    }
  }
}
