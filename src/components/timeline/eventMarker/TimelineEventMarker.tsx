import "./TimelineEventMarker.css";
import "../../../features/timelineEvents/budAnalysis/marker.css";
import "../../../features/timelineEvents/prePruningCount/marker.css";
import {
  buildDynamicConnectorPath,
  buildDynamicConnectorPathWithoutStem,
  resolveFixedAnchorLocalX,
} from "./eventMarkerMath";

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
  labelLines?: string[];
  leftPx: number;
  isActive: boolean;
  isOutOfView?: boolean;
  connector: TimelineEventConnector;
  onToggle?: (eventId: string) => void;
};

const TimelineEventMarker = ({
  eventId,
  label,
  labelLines,
  leftPx,
  isActive,
  isOutOfView = false,
  connector,
  onToggle,
}: TimelineEventMarkerProps) => {
  const renderedLabelLines = labelLines?.length ? labelLines : [label];
  const connectorPath =
    connector.fixedLeftPx === undefined
      ? connector.path ?? ""
      : (() => {
          const anchorLocalX = resolveFixedAnchorLocalX({
            fixedLeftPx: connector.fixedLeftPx,
            markerLeftPx: leftPx,
          });
          return isOutOfView
            ? buildDynamicConnectorPathWithoutStem(anchorLocalX)
            : buildDynamicConnectorPath(anchorLocalX);
        })();

  const connectorStyle = {
    width: `${connector.width}px`,
    height: `${connector.height}px`,
    transform: `translate(${connector.offsetX}px, ${connector.offsetY}px)`,
  };

  return (
    <button
      type="button"
      className={`timeline-event-marker timeline-event-marker--${eventId} ${isActive ? "timeline-event-marker--active" : ""} ${
        isOutOfView ? "timeline-event-marker--ghost" : ""
      }`}
      style={{ left: `${leftPx}px` }}
      onClick={() => onToggle?.(eventId)}
      aria-label={label}
      title={label}
    >
      <span className="timeline-event-marker__shape" aria-hidden="true" />
      <span className="timeline-event-marker__stem" aria-hidden="true" />
      <span className="timeline-event-marker__label" aria-hidden="true">
        {renderedLabelLines.map((line) => (
          <span key={line} className="timeline-event-marker__label-line">
            {line}
          </span>
        ))}
      </span>

      {isActive && (
        <span
          className="timeline-event-marker__connector"
          style={connectorStyle}
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
