import FertilizationPlanTable from "./FertilizationPlanTable";
import "../styles/FertilizationButton.css";

const FertilizationButton = ({
  period,
  onClick,
  isRaised = false,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
}) => (
  <div
    className={`lower-dots-bridge__fertilization-slot ${
      isRaised ? "lower-dots-bridge__fertilization-slot--raised" : ""
    }`}
    style={{ left: `${period.left}%`, width: `${period.width}%` }}
  >
    <button
      type="button"
      className={`lower-dots-bridge__fertilization-button ${
        isRaised ? "lower-dots-bridge__fertilization-button--raised" : ""
      }`}
      title={period.label}
      onClick={() => onClick?.(period)}
    >
      <span className="lower-dots-bridge__fertilization-title">{period.label}</span>
    </button>

    {isRaised ? (
      <div className="lower-dots-bridge__fertilization-panel">
        <FertilizationPlanTable
          selectedHuerto={selectedHuerto}
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
        />
      </div>
    ) : null}
  </div>
);

export default FertilizationButton;
