import foliarAnalysisRows from "../../data/foliarAnalysisRows.json";
import budAnalysisRows from "../../data/budAnalysisRows.json";
import postPruningCountRows from "../../data/postPruningCountRows.json";
import prePruningCountRows from "../../data/prePruningCountRows.json";
import { useMemo } from "react";
import DataRecordsSection from "../dataRecordsSection/DataRecordsSection";
import FoliarAnalysisTableCard from "./FoliarAnalysisTableCard";
import { FOLIAR_COLUMNS, FOLIAR_SCORE_FIELDS, mapFoliarRow } from "./foliarAnalysisConfig";
import { BUD_COLUMNS, BUD_SCORE_FIELDS, mapBudRow, sortBudRows } from "./budAnalysisConfig";
import {
  BUD_ANALYSIS_EVENT_ID,
  FOLIAR_ANALYSIS_EVENT_ID,
  POST_PRUNING_COUNT_EVENT_ID,
  PRE_PRUNING_COUNT_EVENT_ID,
} from "../../features/timelineEvents";
import { BUD_ANALYSIS_EVENT } from "../../features/timelineEvents/budAnalysis/event";
import { FOLIAR_ANALYSIS_EVENT } from "../../features/timelineEvents/foliarAnalysis/event";
import { POST_PRUNING_COUNT_EVENT } from "../../features/timelineEvents/postPruningCount/event";
import { PRE_PRUNING_COUNT_EVENT } from "../../features/timelineEvents/prePruningCount/event";
import {
  PRE_PRUNING_COUNT_COLUMNS,
  PRE_PRUNING_COUNT_SCORE_FIELDS,
  mapPrePruningCountRow,
  sortPrePruningCountRows,
} from "./prePruningCountConfig";

const FOLIAR_MAPPED_ROWS = foliarAnalysisRows.map(mapFoliarRow);
const BUD_MAPPED_ROWS = budAnalysisRows.map(mapBudRow);
const POST_PRUNING_MAPPED_ROWS = postPruningCountRows.map(mapPrePruningCountRow);
const PRE_PRUNING_MAPPED_ROWS = prePruningCountRows.map(mapPrePruningCountRow);

const EVENT_DEFINITION_BY_ID = {
  [FOLIAR_ANALYSIS_EVENT_ID]: FOLIAR_ANALYSIS_EVENT,
  [BUD_ANALYSIS_EVENT_ID]: BUD_ANALYSIS_EVENT,
  [PRE_PRUNING_COUNT_EVENT_ID]: PRE_PRUNING_COUNT_EVENT,
  [POST_PRUNING_COUNT_EVENT_ID]: POST_PRUNING_COUNT_EVENT,
};

const mapYearSelectorRow = (row) => row;

const TONE_BY_DATASET_ID = {
  foliar: "fertilization",
  bud: "bud-analysis",
  "pre-pruning-count": "count",
  "post-pruning-count": "count-post",
};

const countDataPoints = (row, fields) =>
  fields.reduce((total, field) => {
    const value = row[field];
    return value === "" || value === null || value === undefined ? total : total + 1;
  }, 0);

const buildTableRows = ({
  selectedCuartel,
  selectedYears,
  mappedRows,
  scoreFields,
  keepAllRowsPerYear = false,
  sortRows,
}) => {
  const normalizedSelectedCuartel = String(selectedCuartel ?? "").trim().toUpperCase();
  if (!normalizedSelectedCuartel || !selectedYears?.length) return [];

  const selectedYearsSet = new Set(selectedYears);
  const rowsForCuartel = [];

  for (const row of mappedRows) {
    const rowCuartel = String(row.cuartel ?? "").trim().toUpperCase();
    if (rowCuartel !== normalizedSelectedCuartel) continue;
    if (!selectedYearsSet.has(row.year)) continue;
    rowsForCuartel.push(row);
  }

  const defaultSortRows = (a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const variedadComparison = String(a.variedad ?? "").localeCompare(String(b.variedad ?? ""));
    if (variedadComparison !== 0) return variedadComparison;
    return String(a.cuartel).localeCompare(String(b.cuartel));
  };

  if (keepAllRowsPerYear) return [...rowsForCuartel].sort(sortRows ?? defaultSortRows);

  return [...rowsForCuartel
    .reduce((rowsByYear, row) => {
      const current = rowsByYear.get(row.year);
      if (!current || countDataPoints(row, scoreFields) > countDataPoints(current, scoreFields)) {
        rowsByYear.set(row.year, row);
      }
      return rowsByYear;
    }, new Map())
    .values()].sort(sortRows ?? defaultSortRows);
};

const filterRowsByTimelineMoment = ({ rows, eventId, currentDate }) => {
  if (!Array.isArray(rows) || rows.length === 0) return [];

  const safeCurrentDate =
    currentDate instanceof Date && !Number.isNaN(currentDate.getTime()) ? currentDate : new Date();
  const currentYear = safeCurrentDate.getFullYear();
  const eventDefinition = EVENT_DEFINITION_BY_ID[eventId];
  if (!eventDefinition) {
    return rows.filter((row) => Number.isFinite(row.year) && row.year <= currentYear);
  }

  const eventDateMs = Date.UTC(currentYear, eventDefinition.month, eventDefinition.day);
  const currentDateMs = Date.UTC(
    currentYear,
    safeCurrentDate.getMonth(),
    safeCurrentDate.getDate(),
  );
  const hasCurrentYearDataEnabled = currentDateMs >= eventDateMs;

  return rows.filter((row) => {
    if (!Number.isFinite(row.year)) return false;
    if (row.year < currentYear) return true;
    if (row.year > currentYear) return false;
    return hasCurrentYearDataEnabled;
  });
};

const FoliarAnalysisPanel = ({
  activeEvents = [],
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
  currentDate,
}) => {
  const activeEventIds = useMemo(() => new Set(activeEvents.map((event) => event.id)), [activeEvents]);

  const activeDatasets = useMemo(
    () =>
      [
        activeEventIds.has(FOLIAR_ANALYSIS_EVENT_ID)
          ? {
              id: "foliar",
              eventId: FOLIAR_ANALYSIS_EVENT_ID,
              label: "Foliar",
              columns: FOLIAR_COLUMNS,
              mappedRows: FOLIAR_MAPPED_ROWS,
              scoreFields: FOLIAR_SCORE_FIELDS,
              tone: "fertilization",
            }
          : null,
        activeEventIds.has(BUD_ANALYSIS_EVENT_ID)
          ? {
              id: "bud",
              eventId: BUD_ANALYSIS_EVENT_ID,
              label: "Yemas",
              columns: BUD_COLUMNS,
              mappedRows: BUD_MAPPED_ROWS,
              scoreFields: BUD_SCORE_FIELDS,
              keepAllRowsPerYear: true,
              sortRows: sortBudRows,
              tone: "bud-analysis",
            }
          : null,
        activeEventIds.has(PRE_PRUNING_COUNT_EVENT_ID)
          ? {
              id: "pre-pruning-count",
              eventId: PRE_PRUNING_COUNT_EVENT_ID,
              label: "Pre poda",
              columns: PRE_PRUNING_COUNT_COLUMNS,
              mappedRows: PRE_PRUNING_MAPPED_ROWS,
              scoreFields: PRE_PRUNING_COUNT_SCORE_FIELDS,
              keepAllRowsPerYear: true,
              sortRows: sortPrePruningCountRows,
              tone: "count",
            }
          : null,
        activeEventIds.has(POST_PRUNING_COUNT_EVENT_ID)
          ? {
              id: "post-pruning-count",
              eventId: POST_PRUNING_COUNT_EVENT_ID,
              label: "Post poda",
              columns: PRE_PRUNING_COUNT_COLUMNS,
              mappedRows: POST_PRUNING_MAPPED_ROWS,
              scoreFields: PRE_PRUNING_COUNT_SCORE_FIELDS,
              keepAllRowsPerYear: true,
              sortRows: sortPrePruningCountRows,
              tone: "count-post",
            }
          : null,
      ].filter(Boolean),
    [activeEventIds],
  );

  const hasDataTable = activeDatasets.length > 0;
  const isCountPairOnly = useMemo(() => {
    if (activeDatasets.length !== 2) return false;
    const ids = new Set(activeDatasets.map((dataset) => dataset.id));
    return ids.has("pre-pruning-count") && ids.has("post-pruning-count");
  }, [activeDatasets]);

  const yearSelectorRowsMapped = useMemo(
    () =>
      activeDatasets.flatMap((dataset) =>
        filterRowsByTimelineMoment({
          rows: dataset.mappedRows,
          eventId: dataset.eventId,
          currentDate,
        }).map((row) => ({
          year: row.year,
          cuartel: row.cuartel,
        })),
      ),
    [activeDatasets, currentDate],
  );

  const rowsByDataset = useMemo(
    () =>
      Object.fromEntries(
        activeDatasets.map((dataset) => [
          dataset.id,
          buildTableRows({
            selectedCuartel,
            selectedYears,
            mappedRows: filterRowsByTimelineMoment({
              rows: dataset.mappedRows,
              eventId: dataset.eventId,
              currentDate,
            }),
            scoreFields: dataset.scoreFields,
            keepAllRowsPerYear: dataset.keepAllRowsPerYear,
            sortRows: dataset.sortRows,
          }),
        ]),
      ),
    [activeDatasets, currentDate, selectedCuartel, selectedYears],
  );

  const unifiedColumns = useMemo(
    () => [
      { field: "year", header: "Temp." },
      { field: "variedad", header: "Variedad" },
      ...activeDatasets.flatMap((dataset) =>
        dataset.columns
          .filter((column) => column.field !== "variedad")
          .map((column) => ({
            field: `${dataset.id}::${column.field}`,
            header: column.header,
            tone: TONE_BY_DATASET_ID[dataset.id] ?? null,
          }))
      ),
    ],
    [activeDatasets],
  );

  const unifiedRowData = useMemo(() => {
    if (!hasDataTable) return [];

    const varietiesByYear = new Map();
    const preferredVarietyByYear = new Map();
    activeDatasets.forEach((dataset) => {
      const datasetRows = rowsByDataset[dataset.id] ?? [];
      const datasetVarietiesByYear = datasetRows.reduce((acc, row) => {
        const year = row.year;
        const normalizedVariety = String(row.variedad ?? "").trim();
        if (!normalizedVariety) return acc;
        const varietiesForYear = acc.get(year) ?? new Map();
        const normalizedKey = normalizedVariety.toLowerCase();
        if (!varietiesForYear.has(normalizedKey)) {
          varietiesForYear.set(normalizedKey, normalizedVariety);
        }
        acc.set(year, varietiesForYear);
        return acc;
      }, new Map());

      datasetVarietiesByYear.forEach((datasetVarieties, year) => {
        const sharedVarieties = varietiesByYear.get(year) ?? new Map();
        datasetVarieties.forEach((label, normalized) => {
          if (!sharedVarieties.has(normalized)) sharedVarieties.set(normalized, label);
        });
        varietiesByYear.set(year, sharedVarieties);
      });
    });

    varietiesByYear.forEach((varieties, year) => {
      if (varieties.size !== 1) return;
      const [onlyVariety] = varieties.keys();
      const current = preferredVarietyByYear.get(year);
      if (!current) preferredVarietyByYear.set(year, onlyVariety);
    });

    const rowsByKey = new Map();

    activeDatasets.forEach((dataset) => {
      const datasetRows = rowsByDataset[dataset.id] ?? [];
      datasetRows.forEach((row) => {
        const normalizedVariedad = String(row.variedad ?? "").trim().toLowerCase();
        const mergeIntoRow = (resolvedVariedad, varietyLabel) => {
          const key = `${row.year ?? ""}::${resolvedVariedad}`;
          const currentRow = rowsByKey.get(key) ?? {
            year: row.year,
            variedad: varietyLabel ?? row.variedad,
          };

          if ((!currentRow.variedad || currentRow.variedad === "-") && row.variedad) {
            currentRow.variedad = row.variedad;
          }

          dataset.columns.forEach((column) => {
            if (column.field === "variedad") return;
            currentRow[`${dataset.id}::${column.field}`] = row[column.field];
          });

          rowsByKey.set(key, currentRow);
        };

        if (normalizedVariedad) {
          const yearVarieties = varietiesByYear.get(row.year);
          const label = yearVarieties?.get(normalizedVariedad) ?? row.variedad;
          mergeIntoRow(normalizedVariedad, label);
          return;
        }

        const yearVarieties = varietiesByYear.get(row.year);
        if (yearVarieties && yearVarieties.size > 1) {
          yearVarieties.forEach((label, normalized) => {
            mergeIntoRow(normalized, label);
          });
          return;
        }

        const resolvedVariedad = preferredVarietyByYear.get(row.year) || "";
        const varietyLabel = resolvedVariedad ? yearVarieties?.get(resolvedVariedad) : row.variedad;
        mergeIntoRow(resolvedVariedad, varietyLabel);
      });
    });

    return [...rowsByKey.values()].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return String(a.variedad ?? "").localeCompare(String(b.variedad ?? ""));
    });
  }, [activeDatasets, hasDataTable, rowsByDataset]);

  return (
    <DataRecordsSection
      selectedCuartel={selectedCuartel}
      rawRows={yearSelectorRowsMapped}
      mapRow={mapYearSelectorRow}
      scoreFields={[]}
      keepAllRowsPerYear
      selectedYears={selectedYears}
      onSelectedYearsChange={onSelectedYearsChange}
    >
      {({ selectedYearsCount }) =>
        hasDataTable ? (
          isCountPairOnly ? (
            <div className="foliar-analysis-table-card-stack foliar-analysis-table-card-stack--count-only">
              {activeDatasets.map((dataset) => {
                const columns = [
                  { field: "year", header: "Temp." },
                  ...dataset.columns.map((column) => ({
                    ...column,
                    tone: dataset.tone,
                  })),
                ];

                return (
                  <FoliarAnalysisTableCard
                    key={dataset.id}
                    hasDataTable
                    rowData={rowsByDataset[dataset.id] ?? []}
                    selectedYearsCount={selectedYearsCount}
                    columns={columns}
                    tableTone={dataset.tone}
                    tableAriaLabel={`Tabla ${dataset.label}`}
                  />
                );
              })}
            </div>
          ) : (
            <FoliarAnalysisTableCard
              hasDataTable
              rowData={unifiedRowData}
              selectedYearsCount={selectedYearsCount}
              columns={unifiedColumns}
              tableAriaLabel="Tabla unificada de análisis"
            />
          )
        ) : (
          <FoliarAnalysisTableCard
            hasDataTable={false}
            rowData={[]}
            selectedYearsCount={selectedYearsCount}
            columns={[]}
            tableAriaLabel="Tabla de análisis"
          />
        )
      }
    </DataRecordsSection>
  );
};

export default FoliarAnalysisPanel;
