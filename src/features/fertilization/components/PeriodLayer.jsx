import { useCallback, useEffect, useState } from "react";
import { PERIODS_ARIA_LABEL } from "../../../components/timeline/constants";
import FertilizationButton from "./FertilizationButton";
import ProductionHistoricalBridge from "./productionBridge/ProductionHistoricalBridge";

const PRODUCTION_POTENTIAL_REGISTER_STORAGE_KEY = "productionPotentialRegisterByCuartel";
const normalizeText = (value) => String(value ?? "").trim().toUpperCase();

const PeriodLayer = ({
  periods,
  timelineEvents = [],
  onFertilizationClick,
  raisedPeriodId,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  currentDate,
  zIndex = 1,
  onRequestForeground,
  showFertilizationTitle = true,
  showProductionPotentialTitle = true,
  showProductionPotentialValue = true,
}) => {
  const [productionRegisterByCuartel, setProductionRegisterByCuartel] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PRODUCTION_POTENTIAL_REGISTER_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setProductionRegisterByCuartel(parsed);
      }
    } catch {
      setProductionRegisterByCuartel({});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        PRODUCTION_POTENTIAL_REGISTER_STORAGE_KEY,
        JSON.stringify(productionRegisterByCuartel),
      );
    } catch {
      // noop: localStorage can fail in restricted contexts
    }
  }, [productionRegisterByCuartel]);

  const handleProductionRegister = useCallback((payload) => {
    const normalizedCuartel = normalizeText(payload?.cuartel);
    if (!normalizedCuartel) return;

    setProductionRegisterByCuartel((current) => ({
      ...current,
      [normalizedCuartel]: payload,
    }));
  }, []);

  return (
    <div className="lower-dots-bridge__periods" style={{ zIndex }} aria-label={PERIODS_ARIA_LABEL}>
      <ProductionHistoricalBridge
        periods={periods}
        timelineEvents={timelineEvents}
        selectedCuartel={selectedCuartel}
        selectedYears={selectedYears}
        currentDate={currentDate}
        registeredProductionByCuartel={productionRegisterByCuartel}
        showProductionPotentialTitle={showProductionPotentialTitle}
        showProductionPotentialValue={showProductionPotentialValue}
      />

      {periods.map((period) => (
        <FertilizationButton
          key={period.id}
          period={period}
          onClick={onFertilizationClick}
          isRaised={period.id === raisedPeriodId}
          selectedHuerto={selectedHuerto}
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
          currentDate={currentDate}
          onRequestForeground={onRequestForeground}
          onRegisterProduction={handleProductionRegister}
          registeredProductionByCuartel={productionRegisterByCuartel}
          showFertilizationTitle={showFertilizationTitle}
          showProductionPotentialTitle={showProductionPotentialTitle}
          showProductionPotentialValue={showProductionPotentialValue}
        />
      ))}
    </div>
  );
};

export default PeriodLayer;
