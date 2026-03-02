import { useEffect, useMemo, useRef, useState } from "react";
import TimelineEventMarker from "./eventMarker/TimelineEventMarker";
import { EventActivationOverlay } from "./eventActivation";
import { EVENT_ACTIVATION_VERTICAL_TOP_PX } from "./eventActivation/constants";
import FoliarAnalysisPanel from "../foliarAnalysis/FoliarAnalysisPanel";
import { PorcionesFriosLayer } from "../../features/porcionesFrios";
import { DATA_RECORDS_EVENT_CONNECTOR } from "../../features/timelineEvents/shared/connectors";
import { buildVarietyColorPair } from "../../features/productionPotential/productionPotentialService";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const DAY_MS = 86400000;

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE_PATTERN = /^(\d{2})\/(\d{2})$/;
const DISPLAY_DATE_WITH_YEAR_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const parseDormancyDateToUtcMs = (value, fallbackYear) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;

  const isoMatch = normalized.match(ISO_DATE_PATTERN);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return Date.UTC(Number(year), Number(month) - 1, Number(day));
  }

  const displayMatch = normalized.match(DISPLAY_DATE_PATTERN);
  if (displayMatch) {
    const [, day, month] = displayMatch;
    if (!Number.isFinite(Number(fallbackYear))) return null;
    return Date.UTC(Number(fallbackYear), Number(month) - 1, Number(day));
  }

  const displayWithYearMatch = normalized.match(DISPLAY_DATE_WITH_YEAR_PATTERN);
  if (displayWithYearMatch) {
    const [, day, month, year] = displayWithYearMatch;
    return Date.UTC(Number(year), Number(month) - 1, Number(day));
  }

  return null;
};

const DayLines = ({
  dayLines,
  porcionesFriosSummary,
  monthMarkers = [],
  lineVisualLevel,
  visibleDays,
  isTodayVisible,
  todayLeftPercent,
  timelineEvents,
  activeEventIds,
  onTimelineEventToggle,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
  dataRecordsZIndex = 2,
  onRequestDataRecordsForeground,
  porcionesFriosZIndex = 1,
  isPorcionesFriosForeground = false,
  isPorcionesFriosPanelOpen = false,
  onTogglePorcionesFriosPanel,
  onRequestPorcionesFriosForeground,
  viewStartMs,
  viewEndMs,
  viewSpanMs,
  currentDate,
  onRegisterDormancyBreakers,
  registeredDormancyBreakers,
}) => {
  const linesRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const element = linesRef.current;
    if (!element) return undefined;

    const updateWidth = () => setContainerWidth(element.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const currentActiveEventSet = useMemo(() => new Set(activeEventIds ?? []), [activeEventIds]);
  const activeEvents = timelineEvents.filter((event) => currentActiveEventSet.has(event.id));
  const handleTimelineEventToggle = (eventId) => {
    onRequestDataRecordsForeground?.();
    onTimelineEventToggle?.(eventId);
  };
  const renderedMarkerEvents = timelineEvents
    .filter((event) => event.isVisible || currentActiveEventSet.has(event.id))
    .map((event) => {
      const markerLeftPercent = clamp(event.leftPercent, 0, 100);
      return {
        ...event,
        markerLeftPx: (markerLeftPercent / 100) * containerWidth,
        markerOutOfView: event.leftPercent !== markerLeftPercent,
      };
    });
  const dormancyBreakerMarkers = useMemo(() => {
    const registeredRows = Array.isArray(registeredDormancyBreakers?.rows)
      ? registeredDormancyBreakers.rows
      : [];
    if (!registeredRows.length || !Number.isFinite(viewStartMs) || !Number.isFinite(viewSpanMs) || viewSpanMs <= 0) {
      return [];
    }

    return registeredRows.flatMap((row) => {
      const variedad = String(row?.variedad ?? "").trim();
      if (!variedad) return [];

      const colorPair = buildVarietyColorPair(variedad);
      const applications = [
        {
          id: "1",
          dateMs: parseDormancyDateToUtcMs(row?.fechaAplicacionRompedor1, row?.year),
          label: `${variedad} - Rompedor 1`,
        },
        {
          id: "2",
          dateMs: parseDormancyDateToUtcMs(row?.fechaAplicacionRompedor2, row?.year),
          label: `${variedad} - Rompedor 2`,
        },
      ];

      return applications
        .filter((application) => Number.isFinite(application.dateMs))
        .map((application) => ({
          key: `${registeredDormancyBreakers?.year ?? "year"}-${variedad}-${application.id}`,
          label: application.label,
          leftPercent: clamp((((application.dateMs + DAY_MS / 2) - viewStartMs) / viewSpanMs) * 100, 0, 100),
          isVisible: application.dateMs >= viewStartMs && application.dateMs <= viewEndMs,
          color: colorPair.strong,
          textColor: colorPair.text,
        }))
        .filter((application) => application.isVisible);
    });
  }, [registeredDormancyBreakers, viewEndMs, viewSpanMs, viewStartMs]);
  return (
    <div
      ref={linesRef}
      className={`lower-dots-bridge__lines lower-dots-bridge__lines--${lineVisualLevel}`}
      style={{
        "--event-fixed-vertical-top": `${EVENT_ACTIVATION_VERTICAL_TOP_PX}px`,
        gridTemplateColumns: `repeat(${visibleDays}, minmax(0, 1fr))`,
      }}
    >
      {dayLines.map((line, index) => {
        const baseClass = "lower-dots-bridge__line";

        if (!isTodayVisible || visibleDays <= 1) {
          return <span key={line.id} className={baseClass} />;
        }

        const lineCenterPercent = ((index + 0.5) / visibleDays) * 100;
        const maxDistancePercent = 25;
        const distancePercent = Math.abs(lineCenterPercent - todayLeftPercent);
        const proximity = clamp(1 - distancePercent / maxDistancePercent, 0, 1);
        const exponentialWeight = (Math.exp(4 * proximity) - 1) / (Math.exp(4) - 1);
        const scaleY = 1 + exponentialWeight * 3.4;

        return <span key={line.id} className={baseClass} style={{ transform: `scaleY(${scaleY})` }} />;
      })}

      <PorcionesFriosLayer
        bars={porcionesFriosSummary.bars}
        chartStartMs={porcionesFriosSummary.barChartStartMs}
        chartEndMs={porcionesFriosSummary.barChartEndMs}
        maxAccumulatedPortions={porcionesFriosSummary.barMaxAccumulated}
        viewStartMs={viewStartMs}
        viewEndMs={viewEndMs}
        viewSpanMs={viewSpanMs}
        currentDate={currentDate}
        isForeground={isPorcionesFriosForeground}
        onFocus={onTogglePorcionesFriosPanel}
        zIndex={porcionesFriosZIndex}
      />

      {dormancyBreakerMarkers.map((marker) => (
        <span
          key={marker.key}
          className="lower-dots-bridge__dormancy-breaker-marker"
          style={{
            left: `${marker.leftPercent}%`,
            "--dormancy-breaker-color": marker.color,
            "--dormancy-breaker-text-color": marker.textColor,
          }}
          aria-hidden="true"
        >
          <span className="lower-dots-bridge__dormancy-breaker-marker-line" />
          <span className="lower-dots-bridge__dormancy-breaker-marker-label">{marker.label}</span>
        </span>
      ))}

      {monthMarkers.map((marker) => (
        <span
          key={`month-line-${marker.id}`}
          className="lower-dots-bridge__month-start-line"
          style={{ left: `${marker.ratio * 100}%` }}
          aria-hidden="true"
        />
      ))}

      <EventActivationOverlay
        activeEvents={activeEvents}
        containerWidth={containerWidth}
        defaultAnchorPx={DATA_RECORDS_EVENT_CONNECTOR.fixedLeftPx}
        overlayZIndex={isPorcionesFriosPanelOpen ? porcionesFriosZIndex : dataRecordsZIndex}
        onRequestForeground={isPorcionesFriosPanelOpen ? onRequestPorcionesFriosForeground : onRequestDataRecordsForeground}
        isDataRecordsContent
        showVerticalLine={!isPorcionesFriosPanelOpen}
      >
        <FoliarAnalysisPanel
          activeEvents={activeEvents}
          selectedHuerto={selectedHuerto}
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
          onSelectedYearsChange={onSelectedYearsChange}
          currentDate={currentDate}
          showPorcionesFriosPanel={isPorcionesFriosPanelOpen}
          porcionesFriosSummary={porcionesFriosSummary}
          onRegisterDormancyBreakers={onRegisterDormancyBreakers}
        />
      </EventActivationOverlay>

      {renderedMarkerEvents.map((event) => (
        <TimelineEventMarker
          key={event.id}
          eventId={event.id}
          label={event.label}
          labelLines={event.labelLines}
          leftPx={event.markerLeftPx}
          isActive={currentActiveEventSet.has(event.id)}
          isOutOfView={event.markerOutOfView}
          connector={event.connector}
          onToggle={handleTimelineEventToggle}
        />
      ))}
    </div>
  );
};

export default DayLines;
