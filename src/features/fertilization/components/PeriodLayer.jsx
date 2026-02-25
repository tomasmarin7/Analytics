import { PERIODS_ARIA_LABEL } from "../../../components/timeline/constants";
import FertilizationButton from "./FertilizationButton";

const PeriodLayer = ({
  periods,
  onFertilizationClick,
  raisedPeriodId,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  zIndex = 1,
  onRequestForeground,
}) => (
  <div className="lower-dots-bridge__periods" style={{ zIndex }} aria-label={PERIODS_ARIA_LABEL}>
    {periods.map((period) => (
      <FertilizationButton
        key={period.id}
        period={period}
        onClick={onFertilizationClick}
        isRaised={period.id === raisedPeriodId}
        selectedHuerto={selectedHuerto}
        selectedCuartel={selectedCuartel}
        selectedYears={selectedYears}
        onRequestForeground={onRequestForeground}
      />
    ))}
  </div>
);

export default PeriodLayer;
