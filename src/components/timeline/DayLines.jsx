import { useEffect, useMemo, useRef, useState } from "react";
import TimelineEventMarker from "./eventMarker/TimelineEventMarker";
import { EventActivationOverlay } from "./eventActivation";
import { EVENT_ACTIVATION_VERTICAL_TOP_PX } from "./eventActivation/constants";
import FoliarAnalysisPanel from "../foliarAnalysis/FoliarAnalysisPanel";
import { DATA_RECORDS_EVENT_CONNECTOR } from "../../features/timelineEvents/shared/connectors";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DayLines = ({
  dayLines,
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
  currentDate,
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
        overlayZIndex={dataRecordsZIndex}
        onRequestForeground={onRequestDataRecordsForeground}
        isDataRecordsContent
      >
        <FoliarAnalysisPanel
          activeEvents={activeEvents}
          selectedHuerto={selectedHuerto}
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
          onSelectedYearsChange={onSelectedYearsChange}
          currentDate={currentDate}
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
          onToggle={onTimelineEventToggle}
        />
      ))}
    </div>
  );
};

export default DayLines;
