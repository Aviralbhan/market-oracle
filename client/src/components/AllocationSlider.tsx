interface AllocationSliderProps {
  equityPercent: number;
  disabled: boolean;
  onChange: (equityPercent: number) => void;
}

export function AllocationSlider({ equityPercent, disabled, onChange }: AllocationSliderProps) {
  const debtPercent = 100 - equityPercent;

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
        step={5}
        value={equityPercent}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="allocation-slider"
      />
      <div className="allocation-hint">
        {disabled
          ? "Allocation is locked for the final snapshot — no more decisions to make."
          : "Equity swings harder in both directions. Debt is steadier. Drag to set your split for the next period."}
      </div>
    </div>
  );
}
