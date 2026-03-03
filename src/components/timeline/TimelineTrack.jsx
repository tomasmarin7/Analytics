import { useEffect, useMemo, useState } from "react";
import DayLines from "./DayLines";
import MonthLabels from "./MonthLabels";
import TodayMarker from "./TodayMarker";
import { PeriodLayer } from "../../features/fertilization";
import { PERIOD_PANEL_TYPES } from "../../features/fertilization/config/panelTypes";
import { DAY_MS } from "./constants";
import "./Timeline.css";

const DORMANCY_BREAKERS_REGISTER_STORAGE_KEY = "dormancyBreakersRegisterByCuartel";
const PRUNING_REGISTER_STORAGE_KEY = "pruningRegisterByCuartel";
const normalizeText = (value) => String(value ?? "").trim().toUpperCase();

const TimelineTrack = ({
  dayLines,
  porcionesFriosSummary,
  lineVisualLevel,
  visibleDays,
  monthMarkers,
  visiblePeriods,
  onFertilizationClick,
  raisedPeriodId,
  isTodayVisible,
  todayLeftPercent,
  timelineEvents,
  activeEventIds,
  onTimelineEventToggle,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
  showFertilizationTitle,
  showProductionPotentialTitle,
  showProductionPotentialValue,
  showPruningTitle,
  viewStartMs,
  viewEndMs,
  viewSpanMs,
  onSetVisibleRangeByDates,
  currentDate,
}) => {
  const [foregroundLayer, setForegroundLayer] = useState("porciones-frios");
  const [isPorcionesFriosPanelOpen, setIsPorcionesFriosPanelOpen] = useState(false);
  const [isPorcionesFriosZoomPending, setIsPorcionesFriosZoomPending] = useState(false);
  const [registeredDormancyBreakersByCuartel, setRegisteredDormancyBreakersByCuartel] = useState({});
  const [registeredPruningByCuartel, setRegisteredPruningByCuartel] = useState({});
  const referenceYear = new Date(currentDate ?? Date.now()).getFullYear();
  const porcionesFriosZoomStartMs = useMemo(() => Date.UTC(referenceYear, 4, 1), [referenceYear]);
  const porcionesFriosZoomEndMs = useMemo(() => Date.UTC(referenceYear, 8, 1), [referenceYear]);
  const yearStartMs = useMemo(() => Date.UTC(referenceYear, 0, 1), [referenceYear]);
  const yearEndMs = useMemo(() => Date.UTC(referenceYear + 1, 0, 1) - DAY_MS, [referenceYear]);
  const isPorcionesFriosZoomed =
    Math.abs(viewStartMs - porcionesFriosZoomStartMs) <= DAY_MS &&
    Math.abs(viewEndMs - porcionesFriosZoomEndMs) <= DAY_MS;
  const raisedPeriodPanelType = useMemo(
    () => visiblePeriods.find((period) => period?.id === raisedPeriodId)?.panelType ?? null,
    [raisedPeriodId, visiblePeriods],
  );
  const shouldRaiseFertilizationLayer =
    foregroundLayer === "fertilization" &&
    raisedPeriodId &&
    raisedPeriodPanelType !== PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL_VARIETY_DARDO;
  const periodsZIndex = shouldRaiseFertilizationLayer ? 4 : 2;
  const dataRecordsZIndex = foregroundLayer === "data-records" ? 4 : 3;
  const porcionesFriosZIndex = 3;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DORMANCY_BREAKERS_REGISTER_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setRegisteredDormancyBreakersByCuartel(parsed);
      }
    } catch {
      setRegisteredDormancyBreakersByCuartel({});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PRUNING_REGISTER_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setRegisteredPruningByCuartel(parsed);
      }
    } catch {
      setRegisteredPruningByCuartel({});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        DORMANCY_BREAKERS_REGISTER_STORAGE_KEY,
        JSON.stringify(registeredDormancyBreakersByCuartel),
      );
    } catch {
      // noop
    }
  }, [registeredDormancyBreakersByCuartel]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PRUNING_REGISTER_STORAGE_KEY, JSON.stringify(registeredPruningByCuartel));
    } catch {
      // noop
    }
  }, [registeredPruningByCuartel]);

  useEffect(() => {
    if (isPorcionesFriosZoomPending && isPorcionesFriosZoomed) {
      setIsPorcionesFriosPanelOpen(true);
      setIsPorcionesFriosZoomPending(false);
      return;
    }

    if (!isPorcionesFriosZoomPending && !isPorcionesFriosZoomed && isPorcionesFriosPanelOpen) {
      setIsPorcionesFriosPanelOpen(false);
    }
  }, [isPorcionesFriosPanelOpen, isPorcionesFriosZoomPending, isPorcionesFriosZoomed]);

  const handlePorcionesFriosForeground = () => {
    setForegroundLayer("porciones-frios");
    if (isPorcionesFriosZoomed) {
      setIsPorcionesFriosPanelOpen(true);
    }
  };

  const handleTogglePorcionesFriosPanel = () => {
    const willOpen = !(foregroundLayer === "porciones-frios" && isPorcionesFriosPanelOpen);

    setForegroundLayer("porciones-frios");
    setIsPorcionesFriosPanelOpen(false);
    setIsPorcionesFriosZoomPending(willOpen);

    onSetVisibleRangeByDates?.({
      startMs: willOpen ? porcionesFriosZoomStartMs : yearStartMs,
      endMs: willOpen ? porcionesFriosZoomEndMs : yearEndMs,
      animate: true,
    });
  };

  const handleRegisterDormancyBreakers = (payload) => {
    const normalizedCuartel = normalizeText(payload?.cuartel ?? selectedCuartel);
    if (!normalizedCuartel) return;

    setRegisteredDormancyBreakersByCuartel((current) => ({
      ...current,
      [normalizedCuartel]: {
        ...payload,
        cuartel: normalizedCuartel,
      },
    }));
  };

  const handleRegisterPruning = (payload) => {
    const normalizedCuartel = normalizeText(payload?.cuartel ?? selectedCuartel);
    if (!normalizedCuartel) return;

    setRegisteredPruningByCuartel((current) => ({
      ...current,
      [normalizedCuartel]: {
        ...payload,
        cuartel: normalizedCuartel,
      },
    }));
  };
  return (
    <div className="lower-dots-bridge__inner">
      <span className="lower-dots-bridge__dot" aria-hidden="true" />

      <div className="lower-dots-bridge__track" aria-hidden="true">
        <PeriodLayer
          periods={visiblePeriods}
          timelineEvents={timelineEvents}
          onFertilizationClick={onFertilizationClick}
          raisedPeriodId={raisedPeriodId}
          selectedHuerto={selectedHuerto}
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
          currentDate={currentDate}
          zIndex={periodsZIndex}
          onRequestForeground={() => {
            setForegroundLayer("fertilization");
            setIsPorcionesFriosPanelOpen(false);
          }}
          showFertilizationTitle={showFertilizationTitle}
          showProductionPotentialTitle={showProductionPotentialTitle}
          showProductionPotentialValue={showProductionPotentialValue}
          showPruningTitle={showPruningTitle}
          registeredPruningByCuartel={registeredPruningByCuartel}
          onRegisterPruning={handleRegisterPruning}
        />
        <DayLines
          dayLines={dayLines}
          porcionesFriosSummary={porcionesFriosSummary}
          monthMarkers={monthMarkers}
          lineVisualLevel={lineVisualLevel}
          visibleDays={visibleDays}
          isTodayVisible={isTodayVisible}
          todayLeftPercent={todayLeftPercent}
          timelineEvents={timelineEvents}
          activeEventIds={activeEventIds}
          onTimelineEventToggle={onTimelineEventToggle}
          selectedHuerto={selectedHuerto}
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
          onSelectedYearsChange={onSelectedYearsChange}
          dataRecordsZIndex={dataRecordsZIndex}
          porcionesFriosZIndex={porcionesFriosZIndex}
          isPorcionesFriosForeground={foregroundLayer === "porciones-frios"}
          isPorcionesFriosPanelOpen={foregroundLayer === "porciones-frios" && isPorcionesFriosPanelOpen}
          onTogglePorcionesFriosPanel={handleTogglePorcionesFriosPanel}
          onRequestDataRecordsForeground={() => {
            setForegroundLayer("data-records");
            setIsPorcionesFriosPanelOpen(false);
          }}
          onRequestPorcionesFriosForeground={handlePorcionesFriosForeground}
          viewStartMs={viewStartMs}
          viewEndMs={viewEndMs}
          viewSpanMs={viewSpanMs}
          currentDate={currentDate}
          onRegisterDormancyBreakers={handleRegisterDormancyBreakers}
          registeredDormancyBreakers={
            registeredDormancyBreakersByCuartel[normalizeText(selectedCuartel)]
          }
          registeredPruning={registeredPruningByCuartel[normalizeText(selectedCuartel)]}
        />
        <MonthLabels markers={monthMarkers} />
        {isTodayVisible ? (
          <div className="lower-dots-bridge__today-layer" aria-hidden="true">
            <TodayMarker leftPercent={todayLeftPercent} />
          </div>
        ) : null}
      </div>

      <span className="lower-dots-bridge__dot" aria-hidden="true" />
    </div>
  );
};

export default TimelineTrack;
