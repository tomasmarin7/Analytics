import ProductionPotentialTable from "./ProductionPotentialTable";

const ProductionPotentialPeriodPanel = ({ selectedCuartel, selectedYears, onRegisterProduction }) => (
  <ProductionPotentialTable
    selectedCuartel={selectedCuartel}
    selectedYears={selectedYears}
    onRegisterProduction={onRegisterProduction}
  />
);

export default ProductionPotentialPeriodPanel;
