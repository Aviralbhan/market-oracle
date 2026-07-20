import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ScenarioSnapshot } from "../types";

interface IndexChartProps {
  history: ScenarioSnapshot[];
}

export function IndexChart({ history }: IndexChartProps) {
  const data = history.map((s) => ({ label: s.label, Equity: s.equityIndex, Debt: s.debtIndex }));

  return (
    <div className="price-chart">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} minTickGap={16} />
          <YAxis tick={{ fontSize: 11 }} width={48} />
          <Tooltip
            contentStyle={{ background: "var(--panel-bg)", border: "1px solid var(--border-color)", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="Equity" stroke="#4f8cff" dot={false} strokeWidth={2} isAnimationActive={false} />
          <Line type="monotone" dataKey="Debt" stroke="#37c98a" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
