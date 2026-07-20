import type { ScenarioSnapshot } from "../types";

export function NarrativeCard({ snapshot }: { snapshot: ScenarioSnapshot }) {
  const isBaseline = snapshot.index === 0;

  return (
    <div className="panel narrative-card">
      <span className="narrative-label">{snapshot.label}</span>
      <p className="narrative-text">{snapshot.narrative}</p>
      {!isBaseline && (
        <div className="narrative-returns">
          <span className={snapshot.equityReturnPct >= 0 ? "positive" : "negative"}>
            Equity {snapshot.equityReturnPct >= 0 ? "+" : ""}
            {snapshot.equityReturnPct}%
          </span>
          <span className={snapshot.debtReturnPct >= 0 ? "positive" : "negative"}>
            Debt {snapshot.debtReturnPct >= 0 ? "+" : ""}
            {snapshot.debtReturnPct}%
          </span>
        </div>
      )}
    </div>
  );
}
