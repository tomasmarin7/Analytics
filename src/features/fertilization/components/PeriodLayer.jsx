import { PERIODS_ARIA_LABEL } from "../../../components/timeline/constants";
import FertilizationButton from "./FertilizationButton";

const PeriodLayer = ({
  periods,
  onFertilizationClick,
  raisedPeriodId,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
}) => (
  <div className="lower-dots-bridge__periods" aria-label={PERIODS_ARIA_LABEL}>
    {periods.map((period) => (
      <FertilizationButton
        key={period.id}
        period={period}
        onClick={onFertilizationClick}
        isRaised={period.id === raisedPeriodId}
        selectedHuerto={selectedHuerto}
        selectedCuartel={selectedCuartel}
        selectedYears={selectedYears}
      />
    ))}
  </div>
);

export default PeriodLayer;
