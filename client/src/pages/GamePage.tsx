import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";
import { Timer } from "../components/Timer";
import { IndexChart } from "../components/IndexChart";
import { NarrativeCard } from "../components/NarrativeCard";
import { AllocationSlider } from "../components/AllocationSlider";
import { PortfolioSummary } from "../components/PortfolioSummary";
import { Leaderboard } from "../components/Leaderboard";

export function GamePage() {
  const navigate = useNavigate();
  const { snapshot, selfPlayerId, setAllocation, connected } = useRoom();

  useEffect(() => {
    if (!connected) return;
    if (!snapshot) {
      navigate("/", { replace: true });
      return;
    }
    if (snapshot.status === "lobby") navigate(`/lobby/${snapshot.code}`, { replace: true });
    if (snapshot.status === "ended") navigate(`/results/${snapshot.code}`, { replace: true });
  }, [snapshot, connected, navigate]);

  if (!snapshot || !snapshot.snapshot) {
    return (
      <div className="page">
        <p>Loading scenario…</p>
      </div>
    );
  }

  const self = snapshot.players.find((p) => p.id === selfPlayerId);

  return (
    <div className="page game-page">
      <div className="game-header">
        <h1>{snapshot.scenarioName}</h1>
        <span className="tick-label">
          Snapshot {snapshot.currentSnapshotIndex + 1}/{snapshot.totalSnapshots}
        </span>
        {snapshot.isDecisionRound && (
          <Timer roundEndsAt={snapshot.roundEndsAt} roundDurationMs={snapshot.roundDurationMs} />
        )}
      </div>

      <div className="game-grid">
        <div className="game-main">
          <NarrativeCard snapshot={snapshot.snapshot} />
          <IndexChart history={snapshot.snapshotHistory} />
          {self && (
            <AllocationSlider
              equityPercent={self.equityPercent}
              disabled={!snapshot.isDecisionRound}
              onChange={setAllocation}
            />
          )}
        </div>
        <div className="game-side">
          {self && <PortfolioSummary portfolioValue={self.portfolioValue} />}
          <Leaderboard players={snapshot.players} selfPlayerId={selfPlayerId} />
        </div>
      </div>
    </div>
  );
}
