import "./EventActivationOverlay.css";
import { EVENT_BULLET_HORIZONTAL_GAP_PX } from "./constants";
import { resolveEventAnchorPx } from "./eventActivationMath";

const EventActivationOverlay = ({
  activeEvents,
  containerWidth,
  overlayZIndex = 2,
  onRequestForeground,
  children,
}) => {
  const anchorPx = resolveEventAnchorPx({ activeEvents, containerWidth });
  if (anchorPx === null) return null;

  const bulletLeftPx = anchorPx + EVENT_BULLET_HORIZONTAL_GAP_PX;
  const hasInteractiveContent = Boolean(children);

  return (
    <>
      <div
        className={`timeline-event-activation__bullet${hasInteractiveContent ? " timeline-event-activation__bullet--interactive" : ""}`}
        style={{
          left: `${bulletLeftPx}px`,
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
