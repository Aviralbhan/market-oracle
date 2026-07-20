import type { Server, Socket } from "socket.io";
import { RoomManager } from "./rooms";
import { getScenario } from "./scenarios";
import { buildSnapshot, executeTrade, startGame } from "./gameEngine";
import type { TradeRequest } from "./types";

interface SocketData {
  roomCode?: string;
  playerId?: string;
}

function typedSocket(socket: Socket) {
  return socket as Socket & { data: SocketData };
}

export function registerSocketHandlers(io: Server, roomManager: RoomManager): void {
  io.on("connection", (rawSocket) => {
    const socket = typedSocket(rawSocket);

    socket.on("create-room", ({ playerName, scenarioId }: { playerName: string; scenarioId: string }) => {
      if (socket.data.roomCode) {
        socket.emit("error-message", "You are already in a room.");
        return;
      }
      const scenario = getScenario(scenarioId);
      if (!scenario) {
        socket.emit("error-message", "Unknown scenario.");
        return;
      }

      const room = roomManager.createRoom(scenarioId, 100000);
      const player = roomManager.addPlayer(room, playerName, socket.id, true);
      socket.join(room.code);
      socket.data.roomCode = room.code;
      socket.data.playerId = player.id;

      socket.emit("room-created", { roomCode: room.code, playerId: player.id });
      io.to(room.code).emit("room-update", buildSnapshot(room, scenario));
    });

    socket.on("join-room", ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
      if (socket.data.roomCode) {
        socket.emit("error-message", "You are already in a room.");
        return;
      }
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        socket.emit("error-message", "Room not found.");
        return;
      }
      if (room.status !== "lobby") {
        socket.emit("error-message", "This game has already started.");
        return;
      }

      const scenario = getScenario(room.scenarioId);
      if (!scenario) {
        socket.emit("error-message", "Scenario missing for this room.");
        return;
      }

      const player = roomManager.addPlayer(room, playerName, socket.id, false);
      socket.join(room.code);
      socket.data.roomCode = room.code;
      socket.data.playerId = player.id;

      socket.emit("room-joined", { roomCode: room.code, playerId: player.id });
      io.to(room.code).emit("room-update", buildSnapshot(room, scenario));
    });

    socket.on("rejoin", ({ roomCode, playerId }: { roomCode: string; playerId: string }) => {
      const room = roomManager.getRoom(roomCode);
      if (!room) {
        socket.emit("rejoin-failed");
        return;
      }
      const scenario = getScenario(room.scenarioId);
      if (!scenario) {
        socket.emit("rejoin-failed");
        return;
      }
      const player = roomManager.rejoinPlayer(room, playerId, socket.id);
      if (!player) {
        socket.emit("rejoin-failed");
        return;
      }

      socket.join(room.code);
      socket.data.roomCode = room.code;
      socket.data.playerId = player.id;

      socket.emit("rejoined", { roomCode: room.code, playerId: player.id });
      io.to(room.code).emit("room-update", buildSnapshot(room, scenario));
    });

    socket.on("start-game", () => {
      const { roomCode, playerId } = socket.data;
      if (!roomCode || !playerId) return;
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      const player = room.players.get(playerId);
      if (!player?.isHost) {
        socket.emit("error-message", "Only the host can start the game.");
        return;
      }
      const scenario = getScenario(room.scenarioId);
      if (!scenario) return;

      startGame(io, room, scenario);
    });

    socket.on("trade", (tradeRequest: TradeRequest) => {
      const { roomCode, playerId } = socket.data;
      if (!roomCode || !playerId) return;
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      const scenario = getScenario(room.scenarioId);
      if (!scenario) return;

      const result = executeTrade(room, scenario, playerId, tradeRequest);
      if (!result.ok) {
        socket.emit("trade-result", result);
        return;
      }
      socket.emit("trade-result", result);
      io.to(room.code).emit("room-update", buildSnapshot(room, scenario));
    });

    socket.on("leave-room", () => {
      const { roomCode, playerId } = socket.data;
      if (!roomCode || !playerId) return;
      const room = roomManager.getRoom(roomCode);
      if (!room) return;
      roomManager.removePlayer(room, playerId);
      socket.leave(roomCode);
      socket.data.roomCode = undefined;
      socket.data.playerId = undefined;
      const scenario = getScenario(room.scenarioId);
      if (scenario) io.to(room.code).emit("room-update", buildSnapshot(room, scenario));
    });

    socket.on("disconnect", () => {
      const { roomCode, playerId } = socket.data;
      if (!roomCode || !playerId) return;
      const room = roomManager.getRoom(roomCode);
      if (!room) return;

      roomManager.markDisconnected(room, playerId, () => {
        const scenario = getScenario(room.scenarioId);
        if (scenario) io.to(room.code).emit("room-update", buildSnapshot(room, scenario));
      });

      const scenario = getScenario(room.scenarioId);
      if (scenario) io.to(room.code).emit("room-update", buildSnapshot(room, scenario));
    });
  });
}
