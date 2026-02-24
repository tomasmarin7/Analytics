import { PERIODS_ARIA_LABEL } from "../timeline/constants";
import FertilizationButton from "./FertilizationButton";

const PeriodLayer = ({ periods, onFertilizationClick }) => (
  <div className="lower-dots-bridge__periods" aria-label={PERIODS_ARIA_LABEL}>
    {periods.map((period) => (
      <FertilizationButton key={period.id} period={period} onClick={onFertilizationClick} />
    ))}
  </div>
);

export default PeriodLayer;
