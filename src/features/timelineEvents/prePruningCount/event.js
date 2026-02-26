import { DATA_RECORDS_EVENT_CONNECTOR } from "../shared/connectors";

export const PRE_PRUNING_COUNT_EVENT_ID = "pre-pruning-count";

export const PRE_PRUNING_COUNT_EVENT = {
  id: PRE_PRUNING_COUNT_EVENT_ID,
  label: "Conteo Pre Poda",
  labelLines: ["Conteo", "Pre Poda"],
  month: 5,
  day: 15,
  connector: DATA_RECORDS_EVENT_CONNECTOR,
};
