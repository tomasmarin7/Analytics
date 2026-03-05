import { useCallback, useEffect, useMemo, useState } from "react";
import { PERIODS_ARIA_LABEL } from "../../../components/timeline/constants";
import { POST_PRUNING_COUNT_EVENT_ID } from "../../timelineEvents";
import { PERIOD_PANEL_TYPES } from "../config/panelTypes";
import FertilizationButton from "./FertilizationButton";
import ProduccionFinalReal from "./produccionFinalReal";
import ProduccionObjetivoFinal from "./produccionObjetivoFinal";
import ProduccionPosibleConteoPostPoda from "./produccionPosibleConteoPostPoda";
import ProduccionPostPodaObjetivo from "./produccionPostPodaObjetivo";
import ProductionHistoricalBridge from "./productionBridge/ProductionHistoricalBridge";

const PRODUCTION_POTENTIAL_REGISTER_STORAGE_KEY = "productionPotentialRegisterByCuartel";
const PRODUCTION_POTENTIAL_DARDO_PERIOD_ID = "periodo-produccion-posible-variedad-dardo";
const PRODUCTION_POTENTIAL_CURRENT_HEIGHT_PX = 425;
const PRUNING_LINE_FALLBACK_RATIO = 0.8;
const normalizeText = (value) => String(value ?? "").trim().toUpperCase();

const PeriodLayer = ({
  periods,
  timelineEvents = [],
  viewStartMs,
  viewEndMs,
  viewSpanMs,
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
  registeredPruningByCuartel = {},
  onRegisterPruning,
}) => {
  const [productionRegisterByCuartel, setProductionRegisterByCuartel] = useState({});
  const [postPruningObjectiveMetrics, setPostPruningObjectiveMetrics] = useState(null);
  const [finalObjectiveMetrics, setFinalObjectiveMetrics] = useState(null);

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

  const handlePostPruningObjectiveMetricsChange = useCallback((metrics) => {
    setPostPruningObjectiveMetrics(metrics);
  }, []);

  const handleFinalObjectiveMetricsChange = useCallback((metrics) => {
    setFinalObjectiveMetrics(metrics);
  }, []);

  const productionPotentialDardoPeriod = useMemo(
    () =>
      Array.isArray(periods)
        ? periods.find((period) => period?.id === PRODUCTION_POTENTIAL_DARDO_PERIOD_ID) ?? null
        : null,
    [periods],
  );

  const handlePostPruningShapeClick = useCallback(() => {
    if (!productionPotentialDardoPeriod) return;
    onFertilizationClick?.(productionPotentialDardoPeriod);
  }, [onFertilizationClick, productionPotentialDardoPeriod]);

  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  const registeredProductionForSelectedCuartel = normalizedSelectedCuartel
    ? productionRegisterByCuartel[normalizedSelectedCuartel]
    : null;
  const registeredPruningForSelectedCuartel = normalizedSelectedCuartel
    ? registeredPruningByCuartel[normalizedSelectedCuartel]
    : null;
  const hasDefinedProductionPotentialForSelectedCuartel =
    Number.isFinite(Number(registeredProductionForSelectedCuartel?.visual?.totalKgHa)) ||
    (Array.isArray(registeredProductionForSelectedCuartel?.visual?.segments) &&
      registeredProductionForSelectedCuartel.visual.segments.length > 0) ||
    (Array.isArray(registeredProductionForSelectedCuartel?.rows) &&
      registeredProductionForSelectedCuartel.rows.length > 0);
  const hasGeneratedPostPruningForSelectedCuartel =
    Array.isArray(registeredPruningForSelectedCuartel?.generatedPostPruningRows) &&
    registeredPruningForSelectedCuartel.generatedPostPruningRows.length > 0;

  const periodsWithPruningGeometry = useMemo(() => {
    if (!Array.isArray(periods)) return [];

    const dardoPeriod = periods.find((period) => period.id === PRODUCTION_POTENTIAL_DARDO_PERIOD_ID);
    const postPruningEvent = timelineEvents.find((event) => event.id === POST_PRUNING_COUNT_EVENT_ID);
    const dardoRight = Number(dardoPeriod?.left) + Number(dardoPeriod?.width);
    const postPruningLeft = Number(postPruningEvent?.leftPercent);
    const hasFallbackGeometry =
      Number.isFinite(dardoRight) && Number.isFinite(postPruningLeft) && postPruningLeft > dardoRight;

    const pruningGeometry = postPruningObjectiveMetrics?.geometry ?? (hasFallbackGeometry
      ? { left: dardoRight, width: postPruningLeft - dardoRight }
      : null);
    const pruningHeightPx = Number(postPruningObjectiveMetrics?.heightPx);
    const pruningLineHeightPx =
      Number.isFinite(pruningHeightPx) && pruningHeightPx > 0
        ? pruningHeightPx
        : PRODUCTION_POTENTIAL_CURRENT_HEIGHT_PX * PRUNING_LINE_FALLBACK_RATIO;
    const raleoHeightPx = Number(finalObjectiveMetrics?.heightPx);
    const raleoLineHeightPx =
      Number.isFinite(raleoHeightPx) && raleoHeightPx > 0
        ? raleoHeightPx
        : PRODUCTION_POTENTIAL_CURRENT_HEIGHT_PX * PRUNING_LINE_FALLBACK_RATIO;

    return periods.map((period) => {
      const isPruningDecisionPeriod = period?.panelType === PERIOD_PANEL_TYPES.PRUNING_DECISION;
      const isRaleoDecisionPeriod = period?.panelType === PERIOD_PANEL_TYPES.RALEO_DECISION;
      if (!isPruningDecisionPeriod && !isRaleoDecisionPeriod) return period;

      return {
        ...period,
        ...(isPruningDecisionPeriod
          ? {
              left: Number.isFinite(Number(pruningGeometry?.left)) ? Number(pruningGeometry.left) : period.left,
              width: Number.isFinite(Number(pruningGeometry?.width)) ? Number(pruningGeometry.width) : period.width,
              raisedLeft: Number.isFinite(Number(pruningGeometry?.left))
                ? Number(pruningGeometry.left)
                : period.raisedLeft,
              raisedWidth: Number.isFinite(Number(pruningGeometry?.width))
                ? Number(pruningGeometry.width)
                : period.raisedWidth,
            }
          : {}),
        pruningLineHeightPx: isRaleoDecisionPeriod
          ? (Number.isFinite(raleoLineHeightPx) ? raleoLineHeightPx : period.pruningLineHeightPx)
          : (Number.isFinite(pruningLineHeightPx) ? pruningLineHeightPx : period.pruningLineHeightPx),
      };
    });
  }, [finalObjectiveMetrics, periods, postPruningObjectiveMetrics, timelineEvents]);

  const visiblePeriods = useMemo(
    () =>
      periodsWithPruningGeometry.filter(
        (period) =>
          (period?.panelType !== PERIOD_PANEL_TYPES.PRUNING_DECISION &&
            period?.panelType !== PERIOD_PANEL_TYPES.RALEO_DECISION) ||
          hasDefinedProductionPotentialForSelectedCuartel,
      ),
    [hasDefinedProductionPotentialForSelectedCuartel, periodsWithPruningGeometry],
  );

  return (
    <div className="lower-dots-bridge__periods" style={{ zIndex }} aria-label={PERIODS_ARIA_LABEL}>
      {!hasGeneratedPostPruningForSelectedCuartel ? (
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
      ) : null}
      <ProduccionPostPodaObjetivo
        periods={periods}
        timelineEvents={timelineEvents}
        viewStartMs={viewStartMs}
        viewEndMs={viewEndMs}
        viewSpanMs={viewSpanMs}
        selectedCuartel={selectedCuartel}
        registeredProductionByCuartel={productionRegisterByCuartel}
        registeredPruningByCuartel={registeredPruningByCuartel}
        showLabels={showProductionPotentialTitle}
        onMetricsChange={handlePostPruningObjectiveMetricsChange}
        onClick={handlePostPruningShapeClick}
        onPointerDown={onRequestForeground}
      />
      <ProduccionPosibleConteoPostPoda
        periods={periods}
        timelineEvents={timelineEvents}
        viewStartMs={viewStartMs}
        viewEndMs={viewEndMs}
        viewSpanMs={viewSpanMs}
        selectedCuartel={selectedCuartel}
        registeredProductionByCuartel={productionRegisterByCuartel}
        registeredPruningByCuartel={registeredPruningByCuartel}
        showLabels={showProductionPotentialTitle}
        onClick={handlePostPruningShapeClick}
        onPointerDown={onRequestForeground}
      />
      <ProduccionObjetivoFinal
        viewStartMs={viewStartMs}
        viewEndMs={viewEndMs}
        viewSpanMs={viewSpanMs}
        selectedCuartel={selectedCuartel}
        registeredProductionByCuartel={productionRegisterByCuartel}
        registeredPruningByCuartel={registeredPruningByCuartel}
        showLabels={showProductionPotentialTitle}
        onMetricsChange={handleFinalObjectiveMetricsChange}
        onClick={handlePostPruningShapeClick}
        onPointerDown={onRequestForeground}
      />
      <ProduccionFinalReal
        viewStartMs={viewStartMs}
        viewEndMs={viewEndMs}
        viewSpanMs={viewSpanMs}
        selectedCuartel={selectedCuartel}
        registeredProductionByCuartel={productionRegisterByCuartel}
        registeredPruningByCuartel={registeredPruningByCuartel}
        showLabels={showProductionPotentialTitle}
        onClick={handlePostPruningShapeClick}
        onPointerDown={onRequestForeground}
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
          onRegisterPruning={onRegisterPruning}
          registeredProductionByCuartel={productionRegisterByCuartel}
          registeredPruningByCuartel={registeredPruningByCuartel}
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
