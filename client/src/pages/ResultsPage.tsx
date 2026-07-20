import { useNavigate } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";
import { Leaderboard } from "../components/Leaderboard";
import { ScenarioRecap } from "../components/ScenarioRecap";

export function ResultsPage() {
  const navigate = useNavigate();
  const { snapshot, selfPlayerId, leaveRoom } = useRoom();

  if (!snapshot) {
    return (
      <div className="page">
        <p>No results to show.</p>
        <button onClick={() => navigate("/")}>Back Home</button>
      </div>
    );
  }

  const winner = snapshot.players[0];

  return (
    <div className="page results-page">
      <h1>Game Over</h1>
      <p className="scenario-name">{snapshot.scenarioName}</p>
      {winner && (
        <p className="winner-banner">
          🏆 {winner.name} wins with ${winner.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
      )}
      <div className="results-grid">
        <Leaderboard players={snapshot.players} selfPlayerId={selfPlayerId} />
        <ScenarioRecap history={snapshot.snapshotHistory} />
      </div>
      <button
        onClick={() => {
          leaveRoom();
          navigate("/");
        }}
      >
        Play Again
      </button>
    </div>
  );
}
