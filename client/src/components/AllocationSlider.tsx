interface AllocationSliderProps {
  equityPercent: number;
  isDecisionRound: boolean;
  hasSubmitted: boolean;
  submittedCount: number;
  totalCount: number;
  onChange: (equityPercent: number) => void;
  onSubmit: () => void;
}

export function AllocationSlider({
  equityPercent,
  isDecisionRound,
  hasSubmitted,
  submittedCount,
  totalCount,
  onChange,
  onSubmit,
}: AllocationSliderProps) {
  const debtPercent = 100 - equityPercent;
  const locked = !isDecisionRound || hasSubmitted;

  return (
    <div className="panel allocation-panel">
      <h3>Your Allocation</h3>
      <div className="allocation-readout">
        <span className="equity-value">{equityPercent}% Equity</span>
        <span className="debt-value">{debtPercent}% Debt</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={equityPercent}
        disabled={locked}
        onChange={(e) => onChange(Number(e.target.value))}
        className="allocation-slider"
        style={{ background: `linear-gradient(to right, var(--accent) ${equityPercent}%, var(--green) ${equityPercent}%)` }}
      />
      <button className="submit-allocation" disabled={locked} onClick={onSubmit}>
        {hasSubmitted ? "Locked In ✓" : "Submit Allocation"}
      </button>
      <div className="allocation-hint">
        {!isDecisionRound
          ? "No more decisions to make — this is the final snapshot."
          : hasSubmitted
            ? `Waiting on other players — ${submittedCount}/${totalCount} locked in.`
            : "Equity swings harder in both directions. Debt is steadier. Submit early to skip the wait once everyone's ready."}
      </div>
    </div>
  );
}
