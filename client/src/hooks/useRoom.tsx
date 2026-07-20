import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { socket, saveSession, loadSession, clearSession } from "../lib/socket";
import type { RoomSnapshot, ScenarioSummary, SetAllocationResult } from "../types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

interface RoomContextValue {
  connected: boolean;
  snapshot: RoomSnapshot | null;
  selfPlayerId: string | null;
  errorMessage: string | null;
  scenarios: ScenarioSummary[];
  createRoom: (playerName: string, scenarioId: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startGame: () => void;
  setAllocation: (equityPercent: number) => void;
  leaveRoom: () => void;
  clearError: () => void;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(socket.connected);
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [selfPlayerId, setSelfPlayerId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/scenarios`)
      .then((res) => res.json())
      .then(setScenarios)
      .catch(() => setErrorMessage("Could not reach the game server. Is it running?"));
  }, []);

  useEffect(() => {
    function onConnect() {
      setConnected(true);
      const session = loadSession();
      if (session) {
        socket.emit("rejoin", session);
      }
    }
    function onDisconnect() {
      setConnected(false);
    }
    function onRoomCreated({ roomCode, playerId }: { roomCode: string; playerId: string }) {
      saveSession({ roomCode, playerId });
      setSelfPlayerId(playerId);
    }
    function onRoomJoined({ roomCode, playerId }: { roomCode: string; playerId: string }) {
      saveSession({ roomCode, playerId });
      setSelfPlayerId(playerId);
    }
    function onRejoined({ roomCode, playerId }: { roomCode: string; playerId: string }) {
      saveSession({ roomCode, playerId });
      setSelfPlayerId(playerId);
    }
    function onRejoinFailed() {
      clearSession();
      setSelfPlayerId(null);
      setSnapshot(null);
    }
    function onRoomUpdate(next: RoomSnapshot) {
      setSnapshot(next);
    }
    function onErrorMessage(message: string) {
      setErrorMessage(message);
    }
    function onAllocationResult(result: SetAllocationResult) {
      if (!result.ok) setErrorMessage(result.error ?? "Could not update allocation.");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room-created", onRoomCreated);
    socket.on("room-joined", onRoomJoined);
    socket.on("rejoined", onRejoined);
    socket.on("rejoin-failed", onRejoinFailed);
    socket.on("room-update", onRoomUpdate);
    socket.on("error-message", onErrorMessage);
    socket.on("allocation-result", onAllocationResult);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room-created", onRoomCreated);
      socket.off("room-joined", onRoomJoined);
      socket.off("rejoined", onRejoined);
      socket.off("rejoin-failed", onRejoinFailed);
      socket.off("room-update", onRoomUpdate);
      socket.off("error-message", onErrorMessage);
      socket.off("allocation-result", onAllocationResult);
    };
  }, []);

  const createRoom = useCallback((playerName: string, scenarioId: string) => {
    socket.emit("create-room", { playerName, scenarioId });
  }, []);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    socket.emit("join-room", { roomCode: roomCode.toUpperCase(), playerName });
  }, []);

  const startGame = useCallback(() => {
    socket.emit("start-game");
  }, []);

  const setAllocation = useCallback((equityPercent: number) => {
    socket.emit("set-allocation", { equityPercent });
  }, []);

  const leaveRoom = useCallback(() => {
    socket.emit("leave-room");
    clearSession();
    setSnapshot(null);
    setSelfPlayerId(null);
  }, []);

  const clearError = useCallback(() => setErrorMessage(null), []);

  const value = useMemo(
    () => ({
      connected,
      snapshot,
      selfPlayerId,
      errorMessage,
      scenarios,
      createRoom,
      joinRoom,
      startGame,
      setAllocation,
      leaveRoom,
      clearError,
    }),
    [connected, snapshot, selfPlayerId, errorMessage, scenarios, createRoom, joinRoom, startGame, setAllocation, leaveRoom, clearError]
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoom(): RoomContextValue {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within a RoomProvider");
  return ctx;
}
