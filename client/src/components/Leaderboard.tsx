import type { PublicPlayer } from "../types";

export function Leaderboard({ players, selfPlayerId }: { players: PublicPlayer[]; selfPlayerId: string | null }) {
  return (
    <div className="panel leaderboard">
      <h3>Leaderboard</h3>
      <ol>
        {players.map((p, i) => (
          <li key={p.id} className={p.id === selfPlayerId ? "self" : ""}>
            <span className="rank">#{i + 1}</span>
            <span className="name">
              {p.name}
              {!p.connected && <em className="disconnected"> (reconnecting…)</em>}
            </span>
            <span className="value">${p.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
