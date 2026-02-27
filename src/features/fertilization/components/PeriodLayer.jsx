import { useCallback, useEffect, useMemo, useState } from "react";
import { PERIODS_ARIA_LABEL } from "../../../components/timeline/constants";
import { POST_PRUNING_COUNT_EVENT_ID } from "../../timelineEvents";
import { PERIOD_PANEL_TYPES } from "../config/panelTypes";
import FertilizationButton from "./FertilizationButton";
import ProductionHistoricalBridge from "./productionBridge/ProductionHistoricalBridge";

const PRODUCTION_POTENTIAL_REGISTER_STORAGE_KEY = "productionPotentialRegisterByCuartel";
const PRUNING_REGISTER_STORAGE_KEY = "pruningRegisterByCuartel";
const PRODUCTION_POTENTIAL_DARDO_PERIOD_ID = "periodo-produccion-posible-variedad-dardo";
const PRODUCTION_POTENTIAL_CURRENT_HEIGHT_PX = 425;
const PRUNING_LINE_FALLBACK_RATIO = 0.8;
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
  showPruningTitle = true,
}) => {
  const [productionRegisterByCuartel, setProductionRegisterByCuartel] = useState({});
  const [pruningRegisterByCuartel, setPruningRegisterByCuartel] = useState({});
  const [historicalBridgeMetrics, setHistoricalBridgeMetrics] = useState(null);

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
      const raw = window.localStorage.getItem(PRUNING_REGISTER_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setPruningRegisterByCuartel(parsed);
      }
    } catch {
      setPruningRegisterByCuartel({});
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PRUNING_REGISTER_STORAGE_KEY, JSON.stringify(pruningRegisterByCuartel));
    } catch {
      // noop
    }
  }, [pruningRegisterByCuartel]);

  const handleProductionRegister = useCallback((payload) => {
    const normalizedCuartel = normalizeText(payload?.cuartel);
    if (!normalizedCuartel) return;

    setProductionRegisterByCuartel((current) => ({
      ...current,
      [normalizedCuartel]: payload,
    }));
  }, []);

  const handleBridgeMetricsChange = useCallback((metrics) => {
    setHistoricalBridgeMetrics(metrics);
  }, []);

  const handlePruningRegister = useCallback((payload) => {
    const normalizedCuartel = normalizeText(payload?.cuartel);
    if (!normalizedCuartel) return;

    setPruningRegisterByCuartel((current) => ({
      ...current,
      [normalizedCuartel]: payload,
    }));
  }, []);

  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  const registeredProductionForSelectedCuartel = normalizedSelectedCuartel
    ? productionRegisterByCuartel[normalizedSelectedCuartel]
    : null;
  const hasDefinedProductionPotentialForSelectedCuartel =
    Number.isFinite(Number(registeredProductionForSelectedCuartel?.visual?.totalKgHa)) ||
    (Array.isArray(registeredProductionForSelectedCuartel?.visual?.segments) &&
      registeredProductionForSelectedCuartel.visual.segments.length > 0) ||
    (Array.isArray(registeredProductionForSelectedCuartel?.rows) &&
      registeredProductionForSelectedCuartel.rows.length > 0);

  const periodsWithPruningGeometry = useMemo(() => {
    if (!Array.isArray(periods)) return [];

    const dardoPeriod = periods.find((period) => period.id === PRODUCTION_POTENTIAL_DARDO_PERIOD_ID);
    const postPruningEvent = timelineEvents.find((event) => event.id === POST_PRUNING_COUNT_EVENT_ID);
    const dardoRight = Number(dardoPeriod?.left) + Number(dardoPeriod?.width);
    const postPruningLeft = Number(postPruningEvent?.leftPercent);
    const hasFallbackGeometry =
      Number.isFinite(dardoRight) && Number.isFinite(postPruningLeft) && postPruningLeft > dardoRight;

    const pruningGeometry = historicalBridgeMetrics?.preGeometry ?? (hasFallbackGeometry
      ? { left: dardoRight, width: postPruningLeft - dardoRight }
      : null);
    const postHeightPx = Number(historicalBridgeMetrics?.postHeightPx);
    const pruningLineHeightPx =
      Number.isFinite(postHeightPx) && postHeightPx > 0
        ? postHeightPx
        : PRODUCTION_POTENTIAL_CURRENT_HEIGHT_PX * PRUNING_LINE_FALLBACK_RATIO;

    return periods.map((period) => {
      if (period?.panelType !== PERIOD_PANEL_TYPES.PRUNING_DECISION) return period;

      return {
        ...period,
        left: Number.isFinite(Number(pruningGeometry?.left)) ? Number(pruningGeometry.left) : period.left,
        width: Number.isFinite(Number(pruningGeometry?.width)) ? Number(pruningGeometry.width) : period.width,
        raisedLeft: Number.isFinite(Number(pruningGeometry?.left))
          ? Number(pruningGeometry.left)
          : period.raisedLeft,
        raisedWidth: Number.isFinite(Number(pruningGeometry?.width))
          ? Number(pruningGeometry.width)
          : period.raisedWidth,
        pruningLineHeightPx: Number.isFinite(pruningLineHeightPx)
          ? pruningLineHeightPx
          : period.pruningLineHeightPx,
      };
    });
  }, [historicalBridgeMetrics, periods, timelineEvents]);

  const visiblePeriods = useMemo(
    () =>
      periodsWithPruningGeometry.filter(
        (period) =>
          period?.panelType !== PERIOD_PANEL_TYPES.PRUNING_DECISION ||
          hasDefinedProductionPotentialForSelectedCuartel,
      ),
    [hasDefinedProductionPotentialForSelectedCuartel, periodsWithPruningGeometry],
  );

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
        onMetricsChange={handleBridgeMetricsChange}
      />

      {visiblePeriods.map((period) => (
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
          onRegisterPruning={handlePruningRegister}
          registeredProductionByCuartel={productionRegisterByCuartel}
          registeredPruningByCuartel={pruningRegisterByCuartel}
          showFertilizationTitle={showFertilizationTitle}
          showProductionPotentialTitle={showProductionPotentialTitle}
          showProductionPotentialValue={showProductionPotentialValue}
          showPruningTitle={showPruningTitle}
        />
      ))}
    </div>
  );
};

export default PeriodLayer;
