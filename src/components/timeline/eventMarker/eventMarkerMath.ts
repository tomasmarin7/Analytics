const CONNECTOR_START_X = 2000;
const CONNECTOR_MIN_LEFT_X = -300;
const CONNECTOR_RIGHT_PADDING = 20;
const CONNECTOR_INNER_GAP = 16;

export const resolveFixedAnchorLocalX = ({
  fixedLeftPx,
  leftPercent,
  containerWidth,
}: {
  fixedLeftPx: number;
  leftPercent: number;
  containerWidth: number;
}) => fixedLeftPx - (leftPercent / 100) * containerWidth;

export const buildDynamicConnectorPath = (anchorLocalX: number) => {
  const rawLeftX = CONNECTOR_START_X + anchorLocalX;
  const clampedLeftX = Math.min(
    CONNECTOR_START_X - CONNECTOR_RIGHT_PADDING,
    Math.max(CONNECTOR_MIN_LEFT_X, rawLeftX),
  );
  const innerLeftX = clampedLeftX + CONNECTOR_INNER_GAP;

  return `M${CONNECTOR_START_X} 952 V1022 Q${CONNECTOR_START_X} 1034 ${CONNECTOR_START_X - 12} 1034 H${innerLeftX} Q${clampedLeftX} 1034 ${clampedLeftX} 1016`;
};
