export const resolveEventAnchorPx = ({ activeEvent, containerWidth }) => {
  if (!activeEvent) return null;
  if (activeEvent.connector?.fixedLeftPx !== undefined) return activeEvent.connector.fixedLeftPx;
  return (activeEvent.leftPercent / 100) * containerWidth;
};
