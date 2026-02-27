import { DATA_RECORDS_EVENT_CONNECTOR } from "../shared/connectors";

export const POST_PRUNING_COUNT_EVENT_ID = "post-pruning-count";

export const POST_PRUNING_COUNT_EVENT = {
  id: POST_PRUNING_COUNT_EVENT_ID,
  label: "Conteo Post Poda",
  labelLines: ["Conteo", "Post Poda"],
  month: 7,
  day: 1,
  connector: DATA_RECORDS_EVENT_CONNECTOR,
};
