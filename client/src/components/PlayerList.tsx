import type { PublicPlayer } from "../types";

export function PlayerList({ players, selfPlayerId }: { players: PublicPlayer[]; selfPlayerId: string | null }) {
  return (
    <ul className="player-list">
      {players.map((p) => (
        <li key={p.id} className={p.id === selfPlayerId ? "self" : ""}>
          <span className={`dot ${p.connected ? "online" : "offline"}`} />
          <span>{p.name}</span>
          {p.isHost && <span className="badge">Host</span>}
        </li>
      ))}
    </ul>
  );
}
