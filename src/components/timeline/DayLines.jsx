import { useEffect, useRef, useState } from "react";
import TodayMarker from "./TodayMarker";
import TimelineEventMarker from "./eventMarker/TimelineEventMarker";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DayLines = ({
  dayLines,
  lineVisualLevel,
  visibleDays,
  isTodayVisible,
  todayLeftPercent,
  timelineEvents,
  activeEventId,
  onTimelineEventToggle,
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

  const fixedVerticalEvents = timelineEvents.filter(
    (event) => event.id === activeEventId && event.connector?.fixedLeftPx !== undefined,
  );
  const visibleEvents = timelineEvents.filter((event) => event.isVisible);

  return (
    <div
      ref={linesRef}
      className={`lower-dots-bridge__lines lower-dots-bridge__lines--${lineVisualLevel}`}
      style={{
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

      {fixedVerticalEvents.map((event) => (
        <span
          key={`fixed-vertical-${event.id}`}
          className="lower-dots-bridge__event-fixed-vertical"
          style={{ left: `${event.connector.fixedLeftPx}px` }}
          aria-hidden="true"
        />
      ))}

      {visibleEvents.map((event) => (
        <TimelineEventMarker
          key={event.id}
          eventId={event.id}
          label={event.label}
          leftPercent={event.leftPercent}
          containerWidth={containerWidth}
          isActive={activeEventId === event.id}
          connector={event.connector}
          onToggle={onTimelineEventToggle}
        />
      ))}
    </div>
  );
};

export default DayLines;
