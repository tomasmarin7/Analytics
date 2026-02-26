import FertilizationPlanTable from "./FertilizationPlanTable";

const FertilizationPeriodPanel = ({ selectedHuerto, selectedCuartel, selectedYears }) => (
  <FertilizationPlanTable
    selectedHuerto={selectedHuerto}
    selectedCuartel={selectedCuartel}
    selectedYears={selectedYears}
  />
);

export default FertilizationPeriodPanel;
