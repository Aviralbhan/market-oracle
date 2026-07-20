import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../hooks/useRoom";
import { Timer } from "../components/Timer";
import { PriceChart } from "../components/PriceChart";
import { TradePanel } from "../components/TradePanel";
import { PortfolioPanel } from "../components/PortfolioPanel";
import { Leaderboard } from "../components/Leaderboard";

export function GamePage() {
  const navigate = useNavigate();
  const { snapshot, selfPlayerId, trade, lastTradeError, clearTradeError, connected } = useRoom();

  useEffect(() => {
    if (!connected) return;
    if (!snapshot) {
      navigate("/", { replace: true });
      return;
    }
    if (snapshot.status === "lobby") navigate(`/lobby/${snapshot.code}`, { replace: true });
    if (snapshot.status === "ended") navigate(`/results/${snapshot.code}`, { replace: true });
  }, [snapshot, connected, navigate]);

  if (!snapshot || !snapshot.tick) {
    return (
      <div className="page">
        <p>Loading market data…</p>
      </div>
    );
  }

  const self = snapshot.players.find((p) => p.id === selfPlayerId);
  const prices = snapshot.tick.prices;

  return (
    <div className="page game-page">
      <div className="game-header">
        <h1>{snapshot.scenarioName}</h1>
        <span className="tick-label">
          {snapshot.tick.label} · Round {snapshot.currentTickIndex + 1}/{snapshot.totalTicks}
        </span>
        <Timer tickEndsAt={snapshot.tickEndsAt} tickDurationMs={snapshot.tickDurationMs} />
      </div>

      <div className="game-grid">
        <div className="game-main">
          <PriceChart assets={snapshot.assets} history={snapshot.priceHistory} />
          {self && (
            <TradePanel
              assets={snapshot.assets}
              prices={prices}
              cash={self.cash}
              holdings={self.holdings}
              onTrade={trade}
              error={lastTradeError}
              onClearError={clearTradeError}
            />
          )}
        </div>
        <div className="game-side">
          {self && (
            <PortfolioPanel
              cash={self.cash}
              holdings={self.holdings}
              prices={prices}
              assets={snapshot.assets}
              portfolioValue={self.portfolioValue}
            />
          )}
          <Leaderboard players={snapshot.players} selfPlayerId={selfPlayerId} />
        </div>
      </div>
    </div>
  );
}
