import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";

export function HomePage() {
  const { roomCode: roomCodeFromUrl } = useParams();
  const navigate = useNavigate();
  const { snapshot, scenarios, createRoom, joinRoom, errorMessage, clearError, connected } = useRoom();

  const [createName, setCreateName] = useState("");
  const [scenarioId, setScenarioId] = useState("");

  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState(roomCodeFromUrl?.toUpperCase() ?? "");

  useEffect(() => {
    if (scenarios.length > 0 && !scenarioId) setScenarioId(scenarios[0].id);
  }, [scenarios, scenarioId]);

  useEffect(() => {
    if (roomCodeFromUrl) setJoinCode(roomCodeFromUrl.toUpperCase());
  }, [roomCodeFromUrl]);

  useEffect(() => {
    if (!snapshot) return;
    if (snapshot.status === "lobby") navigate(`/lobby/${snapshot.code}`, { replace: true });
    else if (snapshot.status === "running") navigate(`/game/${snapshot.code}`, { replace: true });
    else if (snapshot.status === "ended") navigate(`/results/${snapshot.code}`, { replace: true });
  }, [snapshot, navigate]);

  return (
    <div className="page home-page">
      <h1>Market Oracle</h1>
      <p className="tagline">A real-time multiplayer portfolio simulation. Split your money between Equity and Debt at each turning point of a historic market scenario and see who comes out ahead.</p>
      {!connected && <p className="status-warning">Connecting to server…</p>}
      {errorMessage && (
        <p className="error-banner" onClick={clearError}>
          {errorMessage}
        </p>
      )}

      <div className="home-grid">
        <div className="panel">
          <h3>Host a Game</h3>
          <label>
            Your name
            <input value={createName} onChange={(e) => setCreateName(e.target.value)} maxLength={24} placeholder="e.g. Aviral" />
          </label>
          <label>
            Scenario
            <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.peakToTroughPct}%)
                </option>
              ))}
            </select>
          </label>
          {scenarioId && (
            <p className="scenario-desc">{scenarios.find((s) => s.id === scenarioId)?.description}</p>
          )}
          <button
            disabled={!createName.trim() || !scenarioId}
            onClick={() => createRoom(createName.trim(), scenarioId)}
          >
            Create Room
          </button>
        </div>

        <div className="panel">
          <h3>Join a Game</h3>
          <label>
            Your name
            <input value={joinName} onChange={(e) => setJoinName(e.target.value)} maxLength={24} placeholder="e.g. Priya" />
          </label>
          <label>
            Room code
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="ABC123"
            />
          </label>
          <button disabled={!joinName.trim() || joinCode.length !== 6} onClick={() => joinRoom(joinCode, joinName.trim())}>
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
