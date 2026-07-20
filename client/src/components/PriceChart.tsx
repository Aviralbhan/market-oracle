import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Asset, ScenarioTick } from "../types";

const COLORS = ["#4f8cff", "#ff6b6b", "#37c98a", "#f6c445", "#b58bff"];

interface PriceChartProps {
  assets: Asset[];
  history: ScenarioTick[];
}

export function PriceChart({ assets, history }: PriceChartProps) {
  const data = history.map((tick) => ({ label: tick.label, ...tick.prices }));

  return (
    <div className="price-chart">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={24} />
          <YAxis tick={{ fontSize: 11 }} width={56} />
          <Tooltip
            contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", fontSize: 12 }}
          />
          {assets.map((asset, i) => (
            <Line
              key={asset.symbol}
              type="monotone"
              dataKey={asset.symbol}
              name={asset.name}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
