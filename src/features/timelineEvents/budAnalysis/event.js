import { DATA_RECORDS_EVENT_CONNECTOR } from "../shared/connectors";

export const BUD_ANALYSIS_EVENT_ID = "bud-analysis";

export const BUD_ANALYSIS_EVENT = {
  id: BUD_ANALYSIS_EVENT_ID,
  label: "Análisis de Yemas",
  labelLines: ["Análisis", "Yemas"],
  month: 4,
  day: 25,
  connector: DATA_RECORDS_EVENT_CONNECTOR,
};
