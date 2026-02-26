import { DATA_RECORDS_EVENT_CONNECTOR } from "../shared/connectors";

export const FOLIAR_ANALYSIS_EVENT_ID = "foliar-analysis";

export const FOLIAR_ANALYSIS_EVENT = {
  id: FOLIAR_ANALYSIS_EVENT_ID,
  label: "Análisis Foliar",
  labelLines: ["Análisis", "Foliar"],
  month: 0,
  day: 13,
  connector: DATA_RECORDS_EVENT_CONNECTOR,
};
