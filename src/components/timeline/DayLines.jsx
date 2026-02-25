import { useEffect, useRef, useState } from "react";
import TodayMarker from "./TodayMarker";
import TimelineEventMarker from "./eventMarker/TimelineEventMarker";
import { EventActivationOverlay } from "./eventActivation";
import { EVENT_ACTIVATION_VERTICAL_TOP_PX } from "./eventActivation/constants";
import FoliarAnalysisPanel from "../foliarAnalysis/FoliarAnalysisPanel";
import { DATA_RECORDS_EVENT_IDS } from "../../features/timelineEvents";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DayLines = ({
  dayLines,
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

  const activeEventSet = new Set(activeEventIds ?? []);
  const activeEvents = timelineEvents.filter((event) => activeEventSet.has(event.id));
  const visibleEvents = timelineEvents.filter((event) => event.isVisible);

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
        const baseClass = `lower-dots-bridge__line${line.isMonthStart ? " lower-dots-bridge__line--month-start" : ""}`;

        if (!isTodayVisible || line.isMonthStart || visibleDays <= 1) {
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

      {isTodayVisible && <TodayMarker leftPercent={todayLeftPercent} />}

      <EventActivationOverlay activeEvents={activeEvents} containerWidth={containerWidth}>
        {activeEvents.some((event) => DATA_RECORDS_EVENT_IDS.includes(event.id)) ? (
          <FoliarAnalysisPanel
            activeEvents={activeEvents}
            selectedHuerto={selectedHuerto}
            selectedCuartel={selectedCuartel}
            selectedYears={selectedYears}
            onSelectedYearsChange={onSelectedYearsChange}
          />
        ) : null}
      </EventActivationOverlay>

      {visibleEvents.map((event) => (
        <TimelineEventMarker
          key={event.id}
          eventId={event.id}
          label={event.label}
          leftPercent={event.leftPercent}
          containerWidth={containerWidth}
          isActive={activeEventSet.has(event.id)}
          connector={event.connector}
          onToggle={onTimelineEventToggle}
        />
      ))}
    </div>
  );
};

export default DayLines;
