const CONNECTOR_START_X = 2000;
const CONNECTOR_INNER_GAP = 16;
const CONNECTOR_START_Y = 952;
const CONNECTOR_HORIZONTAL_Y = 1068;
const CONNECTOR_INNER_START_X = CONNECTOR_START_X - 12;
const CONNECTOR_ANCHOR_UPTURN_Y = 1016;

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

  return `M${CONNECTOR_START_X} ${CONNECTOR_START_Y} V${CONNECTOR_HORIZONTAL_Y - 12} Q${CONNECTOR_START_X} ${CONNECTOR_HORIZONTAL_Y} ${CONNECTOR_INNER_START_X} ${CONNECTOR_HORIZONTAL_Y} H${innerLeftX} Q${targetLeftX} ${CONNECTOR_HORIZONTAL_Y} ${targetLeftX} ${CONNECTOR_ANCHOR_UPTURN_Y}`;
};

export const buildDynamicConnectorPathWithoutStem = (anchorLocalX: number) => {
  const targetLeftX = CONNECTOR_START_X + anchorLocalX;
  const innerLeftX = targetLeftX + CONNECTOR_INNER_GAP;

  return `M${CONNECTOR_INNER_START_X} ${CONNECTOR_HORIZONTAL_Y} H${innerLeftX} Q${targetLeftX} ${CONNECTOR_HORIZONTAL_Y} ${targetLeftX} ${CONNECTOR_ANCHOR_UPTURN_Y}`;
};
