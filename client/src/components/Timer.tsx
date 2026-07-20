import { useEffect, useState } from "react";

interface TimerProps {
  roundEndsAt: number | null;
  roundDurationMs: number;
  label?: string;
}

export function Timer({ roundEndsAt, roundDurationMs, label = "to lock in your allocation" }: TimerProps) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!roundEndsAt) {
      setRemainingMs(0);
      return;
    }
    const update = () => setRemainingMs(Math.max(0, roundEndsAt - Date.now()));
    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [roundEndsAt]);

  const pct = roundDurationMs > 0 ? Math.min(100, (remainingMs / roundDurationMs) * 100) : 0;
  const seconds = (remainingMs / 1000).toFixed(1);
  const isUrgent = pct < 25;

  return (
    <div className="timer">
      <div className="timer-track">
        <div className={`timer-fill${isUrgent ? " urgent" : ""}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="timer-label">{seconds}s {label}</span>
    </div>
  );
}
