import "./EventActivationOverlay.css";
import { EVENT_BULLET_HORIZONTAL_GAP_PX } from "./constants";
import { resolveEventAnchorPx } from "./eventActivationMath";

const EventActivationOverlay = ({
  activeEvents,
  containerWidth,
  defaultAnchorPx = null,
  overlayZIndex = 2,
  onRequestForeground,
  isDataRecordsContent = false,
  children,
}) => {
  const resolvedAnchorPx = resolveEventAnchorPx({ activeEvents, containerWidth });
  const anchorPx = resolvedAnchorPx ?? defaultAnchorPx;
  if (anchorPx === null) return null;

  const panelLeftPx = anchorPx + EVENT_BULLET_HORIZONTAL_GAP_PX;
  const hasInteractiveContent = Boolean(children);

  return (
    <>
      <div
        className={`timeline-event-activation__panel${
          hasInteractiveContent ? " timeline-event-activation__panel--interactive" : ""
        }${isDataRecordsContent ? " timeline-event-activation__panel--data-records" : ""}`}
        style={{
          left: `${panelLeftPx}px`,
          right: 0,
          zIndex: overlayZIndex,
        }}
        aria-hidden={!hasInteractiveContent}
        onPointerDown={onRequestForeground}
      >
        {children}
      </div>
      <span
        className="timeline-event-activation__vertical"
        style={{ left: `${anchorPx}px`, zIndex: Math.max(1, overlayZIndex - 1) }}
        aria-hidden="true"
      />
    </>
  );
};

export default EventActivationOverlay;
