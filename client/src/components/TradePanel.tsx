import { useState } from "react";
import type { Asset, TradeRequest } from "../types";

interface TradePanelProps {
  assets: Asset[];
  prices: Record<string, number>;
  cash: number;
  holdings: Record<string, number>;
  onTrade: (req: TradeRequest) => void;
  error: string | null;
  onClearError: () => void;
}

export function TradePanel({ assets, prices, cash, holdings, onTrade, error, onClearError }: TradePanelProps) {
  const [symbol, setSymbol] = useState(assets[0]?.symbol ?? "");
  const [quantity, setQuantity] = useState("1");

  const price = prices[symbol] ?? 0;
  const qty = Number(quantity) || 0;
  const cost = Math.round(price * qty * 100) / 100;
  const owned = holdings[symbol] ?? 0;

  function submit(action: "buy" | "sell") {
    if (qty <= 0) return;
    onClearError();
    onTrade({ symbol, action, quantity: qty });
  }

  return (
    <div className="panel trade-panel">
      <h3>Trade</h3>
      <div className="trade-row">
        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
          {assets.map((a) => (
            <option key={a.symbol} value={a.symbol}>
              {a.symbol} — {a.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div className="trade-meta">
        <span>Price: ${price.toFixed(2)}</span>
        <span>Owned: {owned.toFixed(2)}</span>
        <span>Cost: ${cost.toFixed(2)}</span>
      </div>
      <div className="trade-actions">
        <button className="buy" onClick={() => submit("buy")} disabled={cost > cash || qty <= 0}>
          Buy
        </button>
        <button className="sell" onClick={() => submit("sell")} disabled={qty > owned || qty <= 0}>
          Sell
        </button>
      </div>
      {error && <p className="trade-error">{error}</p>}
    </div>
  );
}
