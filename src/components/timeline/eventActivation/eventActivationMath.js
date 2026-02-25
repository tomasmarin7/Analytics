export const resolveEventAnchorPx = ({ activeEvents, containerWidth }) => {
  if (!Array.isArray(activeEvents) || activeEvents.length === 0) return null;

  const fixedAnchorEvent = activeEvents.find((event) => event.connector?.fixedLeftPx !== undefined);
  if (fixedAnchorEvent) return fixedAnchorEvent.connector.fixedLeftPx;

  const fallbackEvent = activeEvents[0];
  return (fallbackEvent.leftPercent / 100) * containerWidth;
};
