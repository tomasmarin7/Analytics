import { useEffect, useMemo, useState } from "react";
import DayLines from "./DayLines";
import MonthLabels from "./MonthLabels";
import TodayMarker from "./TodayMarker";
import { PeriodLayer } from "../../features/fertilization";
import { DAY_MS } from "./constants";
import "./Timeline.css";

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
  const referenceYear = new Date(currentDate ?? Date.now()).getFullYear();
  const porcionesFriosZoomStartMs = useMemo(() => Date.UTC(referenceYear, 4, 1), [referenceYear]);
  const porcionesFriosZoomEndMs = useMemo(() => Date.UTC(referenceYear, 8, 1), [referenceYear]);
  const yearStartMs = useMemo(() => Date.UTC(referenceYear, 0, 1), [referenceYear]);
  const yearEndMs = useMemo(() => Date.UTC(referenceYear + 1, 0, 1) - DAY_MS, [referenceYear]);
  const isPorcionesFriosZoomed =
    Math.abs(viewStartMs - porcionesFriosZoomStartMs) <= DAY_MS &&
    Math.abs(viewEndMs - porcionesFriosZoomEndMs) <= DAY_MS;
  const periodsZIndex = foregroundLayer === "fertilization" ? 4 : 2;
  const dataRecordsZIndex = foregroundLayer === "data-records" ? 4 : 3;
  const porcionesFriosZIndex = foregroundLayer === "porciones-frios" ? 5 : 1;

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
