import { PERIODS_ARIA_LABEL } from "./constants";

const PeriodLayer = ({ periods }) => (
  <div className="lower-dots-bridge__periods" aria-label={PERIODS_ARIA_LABEL}>
    {periods.map((period) => (
      <span
        key={period.id}
        className="lower-dots-bridge__period"
        style={{ left: `${period.left}%`, width: `${period.width}%`, backgroundColor: period.color }}
        title={period.label}
      >
        <span className="lower-dots-bridge__period-label">{period.label}</span>
      </span>
    ))}
  </div>
);

export default PeriodLayer;
