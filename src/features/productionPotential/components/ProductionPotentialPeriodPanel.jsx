import ProductionPotentialTable from "./ProductionPotentialTable";

const ProductionPotentialPeriodPanel = ({ selectedCuartel, selectedYears, currentDate, onRegisterProduction }) => (
  <ProductionPotentialTable
    selectedCuartel={selectedCuartel}
    selectedYears={selectedYears}
    currentDate={currentDate}
    onRegisterProduction={onRegisterProduction}
  />
);

export default ProductionPotentialPeriodPanel;
