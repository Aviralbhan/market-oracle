const STARTING_CASH = 100000;

export function PortfolioSummary({ portfolioValue }: { portfolioValue: number }) {
  const gainPct = ((portfolioValue - STARTING_CASH) / STARTING_CASH) * 100;
  const isUp = gainPct >= 0;

  return (
    <div className="panel portfolio-panel">
      <h3>Your Portfolio</h3>
      <div className="portfolio-summary">
        <div>
          <span className="label">Value</span>
          <span className="value strong">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div>
          <span className="label">Since Start</span>
          <span className={`value ${isUp ? "positive" : "negative"}`}>
            {isUp ? "+" : ""}
            {gainPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
