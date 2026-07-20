import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";

export function HomePage() {
  const { roomCode: roomCodeFromUrl } = useParams();
  const navigate = useNavigate();
  const { snapshot, createRoom, joinRoom, errorMessage, clearError, connected } = useRoom();

  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState(roomCodeFromUrl?.toUpperCase() ?? "");

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
      <div className="hero">
        <span className="hero-eyebrow">Multiplayer · Real-time · Historical markets</span>
        <h1>Market Oracle</h1>
        <p className="tagline">
          Every room draws a surprise scenario — a real market crash or bull run. At each turning point, split your
          money between Equity and Debt and see who reads the moment best.
        </p>
      </div>
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
          <p className="scenario-desc">
            The scenario is a surprise — picked at random from the deck when you create the room.
          </p>
          <button disabled={!createName.trim()} onClick={() => createRoom(createName.trim())}>
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
