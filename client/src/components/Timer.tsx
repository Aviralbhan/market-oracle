import { useEffect, useState } from "react";

interface TimerProps {
  tickEndsAt: number | null;
  tickDurationMs: number;
}

export function Timer({ tickEndsAt, tickDurationMs }: TimerProps) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!tickEndsAt) {
      setRemainingMs(0);
      return;
    }
    const update = () => setRemainingMs(Math.max(0, tickEndsAt - Date.now()));
    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [tickEndsAt]);

  const pct = tickDurationMs > 0 ? Math.min(100, (remainingMs / tickDurationMs) * 100) : 0;
  const seconds = (remainingMs / 1000).toFixed(1);

  return (
    <div className="timer">
      <div className="timer-track">
        <div className="timer-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="timer-label">{seconds}s to next tick</span>
    </div>
  );
}
