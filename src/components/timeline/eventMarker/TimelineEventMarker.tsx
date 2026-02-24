import "./TimelineEventMarker.css";
import { buildDynamicConnectorPath, resolveFixedAnchorLocalX } from "./eventMarkerMath";

type TimelineEventConnector = {
  viewBox: string;
  path?: string;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  fixedLeftPx?: number;
};

type TimelineEventMarkerProps = {
  eventId: string;
  label: string;
  leftPercent: number;
  containerWidth: number;
  isActive: boolean;
  connector: TimelineEventConnector;
  onToggle?: (eventId: string) => void;
};

const TimelineEventMarker = ({
  eventId,
  label,
  leftPercent,
  containerWidth,
  isActive,
  connector,
  onToggle,
}: TimelineEventMarkerProps) => {
  const connectorPath =
    connector.fixedLeftPx === undefined
      ? connector.path ?? ""
      : buildDynamicConnectorPath(
          resolveFixedAnchorLocalX({
            fixedLeftPx: connector.fixedLeftPx,
            leftPercent,
            containerWidth,
          }),
        );

  return (
    <button
      type="button"
      className={`timeline-event-marker ${isActive ? "timeline-event-marker--active" : ""}`}
      style={{ left: `${leftPercent}%` }}
      onClick={() => onToggle?.(eventId)}
      aria-label={label}
      title={label}
    >
      <span className="timeline-event-marker__shape" aria-hidden="true" />
      <span className="timeline-event-marker__stem" aria-hidden="true" />
      <span className="timeline-event-marker__label" aria-hidden="true">
        {label}
      </span>

      {isActive && (
        <span
          className="timeline-event-marker__connector"
          style={{
            width: `${connector.width}px`,
            height: `${connector.height}px`,
            transform: `translate(${connector.offsetX}px, ${connector.offsetY}px)`,
          }}
          aria-hidden="true"
        >
          <svg className="timeline-event-marker__connector-svg" viewBox={connector.viewBox} preserveAspectRatio="none">
            <path d={connectorPath} />
          </svg>
        </span>
      )}
    </button>
  );
};

export default TimelineEventMarker;
