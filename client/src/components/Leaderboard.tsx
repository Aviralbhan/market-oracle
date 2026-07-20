import type { PublicPlayer } from "../types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function Leaderboard({
  players,
  selfPlayerId,
  showSubmitted = false,
}: {
  players: PublicPlayer[];
  selfPlayerId: string | null;
  showSubmitted?: boolean;
}) {
  return (
    <div className="panel leaderboard">
      <h3>Leaderboard</h3>
      <ol>
        {players.map((p, i) => (
          <li key={p.id} className={p.id === selfPlayerId ? "self" : ""}>
            <span className="rank">{MEDALS[i] ?? `#${i + 1}`}</span>
            <span className="name">
              {p.name}
              {!p.connected && <em className="disconnected"> (reconnecting…)</em>}
              {showSubmitted && p.connected && p.hasSubmitted && <span className="submitted-check"> ✓</span>}
            </span>
            <span className="value">${p.portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
