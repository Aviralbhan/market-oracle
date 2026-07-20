import type { Asset } from "../types";

interface PortfolioPanelProps {
  cash: number;
  holdings: Record<string, number>;
  prices: Record<string, number>;
  assets: Asset[];
  portfolioValue: number;
}

export function PortfolioPanel({ cash, holdings, prices, assets, portfolioValue }: PortfolioPanelProps) {
  const nameFor = (symbol: string) => assets.find((a) => a.symbol === symbol)?.name ?? symbol;

  return (
    <div className="panel portfolio-panel">
      <h3>Your Portfolio</h3>
      <div className="portfolio-summary">
        <div>
          <span className="label">Cash</span>
          <span className="value">${cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
        <div>
          <span className="label">Total Value</span>
          <span className="value strong">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      <ul className="holdings-list">
        {Object.entries(holdings).length === 0 && <li className="empty">No positions yet</li>}
        {Object.entries(holdings).map(([symbol, qty]) => (
          <li key={symbol}>
            <span>{symbol} — {nameFor(symbol)}</span>
            <span>
              {qty.toFixed(2)} @ ${prices[symbol]?.toFixed(2) ?? "-"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
