import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";
import { QRCodeBlock } from "../components/QRCodeBlock";
import { PlayerList } from "../components/PlayerList";

export function LobbyPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { snapshot, selfPlayerId, startGame, connected } = useRoom();

  useEffect(() => {
    if (!connected) return;
    if (!snapshot) {
      navigate("/", { replace: true });
      return;
    }
    if (snapshot.status === "running") navigate(`/game/${snapshot.code}`, { replace: true });
    if (snapshot.status === "ended") navigate(`/results/${snapshot.code}`, { replace: true });
  }, [snapshot, connected, navigate]);

  if (!snapshot) {
    return (
      <div className="page">
        <p>Loading room {roomCode}…</p>
      </div>
    );
  }

  const self = snapshot.players.find((p) => p.id === selfPlayerId);

  return (
    <div className="page lobby-page">
      <h1>Lobby</h1>
      <div className="lobby-grid">
        <div className="panel">
          <h3>Room Code</h3>
          <p className="room-code">{snapshot.code}</p>
          <QRCodeBlock roomCode={snapshot.code} />
          <p className="qr-hint">Scan to join, or share the room code.</p>
        </div>

        <div className="panel">
          <h3>Scenario</h3>
          <p className="scenario-name">{snapshot.scenarioName}</p>

          <h3>Players ({snapshot.players.length})</h3>
          <PlayerList players={snapshot.players} selfPlayerId={selfPlayerId} />

          {self?.isHost ? (
            <button onClick={startGame} disabled={snapshot.players.length < 1}>
              Start Game
            </button>
          ) : (
            <p className="waiting-msg">Waiting for host to start the game…</p>
          )}
        </div>
      </div>
    </div>
  );
}
