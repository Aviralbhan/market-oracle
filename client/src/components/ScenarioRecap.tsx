import type { ScenarioSnapshot } from "../types";

export function ScenarioRecap({ history }: { history: ScenarioSnapshot[] }) {
  return (
    <div className="panel recap-panel">
      <h3>What Happened</h3>
      <ul className="recap-list">
        {history.map((s) => (
          <li key={s.index}>
            <span className="recap-label">{s.label}</span>
            <p className="recap-narrative">{s.narrative}</p>
            {s.index > 0 && (
              <div className="narrative-returns">
                <span className={s.equityReturnPct >= 0 ? "positive" : "negative"}>
                  Equity {s.equityReturnPct >= 0 ? "+" : ""}
                  {s.equityReturnPct}%
                </span>
                <span className={s.debtReturnPct >= 0 ? "positive" : "negative"}>
                  Debt {s.debtReturnPct >= 0 ? "+" : ""}
                  {s.debtReturnPct}%
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
