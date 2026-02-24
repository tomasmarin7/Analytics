import "./EventActivationOverlay.css";
import { EVENT_BULLET_HORIZONTAL_GAP_PX } from "./constants";
import { resolveEventAnchorPx } from "./eventActivationMath";

const EventActivationOverlay = ({ activeEvent, containerWidth }) => {
  const anchorPx = resolveEventAnchorPx({ activeEvent, containerWidth });
  if (anchorPx === null) return null;

  const bulletLeftPx = anchorPx + EVENT_BULLET_HORIZONTAL_GAP_PX;

  return (
    <>
      <span
        className="timeline-event-activation__bullet"
        style={{
          left: `${bulletLeftPx}px`,
          right: 0,
        }}
        aria-hidden="true"
      />
      <span
        className="timeline-event-activation__vertical"
        style={{ left: `${anchorPx}px` }}
        aria-hidden="true"
      />
    </>
  );
};

export default EventActivationOverlay;
