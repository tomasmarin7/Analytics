export const FOLIAR_ANALYSIS_EVENT_ID = "foliar-analysis";

export const TIMELINE_EVENT_CONNECTOR_FOLIAR_ANALYSIS = {
  viewBox: "0 0 4000 1040",
  width: 4000,
  height: 1040,
  offsetX: -2000,
  offsetY: -912,
  fixedLeftPx: -46,
};

export const TIMELINE_EVENT_DEFINITIONS = [
  {
    id: FOLIAR_ANALYSIS_EVENT_ID,
    label: "Análisis Foliar",
    month: 0,
    day: 13,
    connector: TIMELINE_EVENT_CONNECTOR_FOLIAR_ANALYSIS,
  },
];
