const CONNECTOR_START_X = 2000;
const CONNECTOR_INNER_GAP = 16;

export const resolveFixedAnchorLocalX = ({
  fixedLeftPx,
  markerLeftPx,
}: {
  fixedLeftPx: number;
  markerLeftPx: number;
}) => fixedLeftPx - markerLeftPx;

export const buildDynamicConnectorPath = (anchorLocalX: number) => {
  const targetLeftX = CONNECTOR_START_X + anchorLocalX;
  const innerLeftX = targetLeftX + CONNECTOR_INNER_GAP;

  return `M${CONNECTOR_START_X} 952 V1022 Q${CONNECTOR_START_X} 1034 ${CONNECTOR_START_X - 12} 1034 H${innerLeftX} Q${targetLeftX} 1034 ${targetLeftX} 1016`;
};

export const buildDynamicConnectorPathWithoutStem = (anchorLocalX: number) => {
  const targetLeftX = CONNECTOR_START_X + anchorLocalX;
  const innerLeftX = targetLeftX + CONNECTOR_INNER_GAP;
  const horizontalStartX = CONNECTOR_START_X - 12;

  return `M${horizontalStartX} 1034 H${innerLeftX} Q${targetLeftX} 1034 ${targetLeftX} 1016`;
};
