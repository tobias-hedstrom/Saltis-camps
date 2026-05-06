export default function ProgressBar({ value, max, label, colorClass = "progress-fill-blue" }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="progress-wrap">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-track">
        <div className={`progress-fill ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-nums">
        {value} / {max}
      </div>
    </div>
  );
}
