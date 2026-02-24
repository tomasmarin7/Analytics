import "./FertilizationButton.css";

const FertilizationButton = ({ period, onClick }) => (
  <button
    type="button"
    className="lower-dots-bridge__fertilization-button"
    style={{ left: `${period.left}%`, width: `${period.width}%` }}
    title={period.label}
    onClick={() => onClick?.(period)}
  >
    <span className="lower-dots-bridge__fertilization-title">{period.label}</span>
  </button>
);

export default FertilizationButton;
