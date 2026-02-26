import foliarAnalysisRows from "../../data/foliarAnalysisRows.json";
import budAnalysisRows from "../../data/budAnalysisRows.json";
import prePruningCountRows from "../../data/prePruningCountRows.json";
import { useMemo } from "react";
import DataRecordsSection from "../dataRecordsSection/DataRecordsSection";
import FoliarAnalysisTableCard from "./FoliarAnalysisTableCard";
import { FOLIAR_COLUMNS, FOLIAR_SCORE_FIELDS, mapFoliarRow } from "./foliarAnalysisConfig";
import { BUD_COLUMNS, BUD_SCORE_FIELDS, mapBudRow, sortBudRows } from "./budAnalysisConfig";
import {
  BUD_ANALYSIS_EVENT_ID,
  FOLIAR_ANALYSIS_EVENT_ID,
  PRE_PRUNING_COUNT_EVENT_ID,
} from "../../features/timelineEvents";
import {
  PRE_PRUNING_COUNT_COLUMNS,
  PRE_PRUNING_COUNT_SCORE_FIELDS,
  mapPrePruningCountRow,
  sortPrePruningCountRows,
} from "./prePruningCountConfig";

const YEAR_SELECTOR_RAW_ROWS = [
  ...foliarAnalysisRows,
  ...budAnalysisRows,
  ...prePruningCountRows,
];

const mapYearSelectorRow = (row) => ({
  year: Number(row["Temp."]),
  cuartel: row.Cuartel,
});

const TONE_BY_DATASET_ID = {
  foliar: "fertilization",
  bud: "bud-analysis",
  "pre-pruning-count": "count",
};

const countDataPoints = (row, fields) =>
  fields.reduce((total, field) => {
    const value = row[field];
    return value === "" || value === null || value === undefined ? total : total + 1;
  }, 0);

const buildTableRows = ({
  selectedCuartel,
  selectedYears,
  rawRows,
  mapRow,
  scoreFields,
  keepAllRowsPerYear = false,
  sortRows,
}) => {
  const normalizedSelectedCuartel = String(selectedCuartel ?? "").trim().toUpperCase();
  if (!normalizedSelectedCuartel) return [];

  const mappedRows = rawRows.map(mapRow);
  const rowsForCuartel = mappedRows.filter(
    (row) => String(row.cuartel ?? "").trim().toUpperCase() === normalizedSelectedCuartel
  );
  const selectedYearsSet = new Set(selectedYears ?? []);
  const filteredRows = rowsForCuartel.filter((row) => selectedYearsSet.has(row.year));

  const defaultSortRows = (a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    const variedadComparison = String(a.variedad ?? "").localeCompare(String(b.variedad ?? ""));
    if (variedadComparison !== 0) return variedadComparison;
    return String(a.cuartel).localeCompare(String(b.cuartel));
  };

  if (keepAllRowsPerYear) return [...filteredRows].sort(sortRows ?? defaultSortRows);

  return [...filteredRows
    .reduce((rowsByYear, row) => {
      const current = rowsByYear.get(row.year);
      if (!current || countDataPoints(row, scoreFields) > countDataPoints(current, scoreFields)) {
        rowsByYear.set(row.year, row);
      }
      return rowsByYear;
    }, new Map())
    .values()].sort(sortRows ?? defaultSortRows);
};

const FoliarAnalysisPanel = ({
  activeEvents = [],
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
}) => {
  const prePruningEvent = activeEvents.find(
    (event) =>
      event.id === PRE_PRUNING_COUNT_EVENT_ID ||
      String(event.label ?? "")
        .trim()
        .toLowerCase()
        .includes("conteo")
  );

  const activeDatasets = [
    activeEvents.some((event) => event.id === FOLIAR_ANALYSIS_EVENT_ID)
      ? {
          id: "foliar",
          label: "Foliar",
          columns: FOLIAR_COLUMNS,
          rawRows: foliarAnalysisRows,
          mapRow: mapFoliarRow,
          scoreFields: FOLIAR_SCORE_FIELDS,
        }
      : null,
    activeEvents.some((event) => event.id === BUD_ANALYSIS_EVENT_ID)
      ? {
          id: "bud",
          label: "Yemas",
          columns: BUD_COLUMNS,
          rawRows: budAnalysisRows,
          mapRow: mapBudRow,
          scoreFields: BUD_SCORE_FIELDS,
          keepAllRowsPerYear: true,
          sortRows: sortBudRows,
        }
      : null,
    prePruningEvent
      ? {
          id: "pre-pruning-count",
          label: "Pre poda",
          columns: PRE_PRUNING_COUNT_COLUMNS,
          rawRows: prePruningCountRows,
          mapRow: mapPrePruningCountRow,
          scoreFields: PRE_PRUNING_COUNT_SCORE_FIELDS,
          keepAllRowsPerYear: true,
          sortRows: sortPrePruningCountRows,
        }
      : null,
  ].filter(Boolean);

  const hasDataTable = activeDatasets.length > 0;
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
    [activeDatasets]
  );

  const rowsByDataset = useMemo(
    () =>
      Object.fromEntries(
        activeDatasets.map((dataset) => [
          dataset.id,
          buildTableRows({
            selectedCuartel,
            selectedYears,
            rawRows: dataset.rawRows,
            mapRow: dataset.mapRow,
            scoreFields: dataset.scoreFields,
            keepAllRowsPerYear: dataset.keepAllRowsPerYear,
            sortRows: dataset.sortRows,
          }),
        ])
      ),
    [activeDatasets, selectedCuartel, selectedYears]
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
      rawRows={YEAR_SELECTOR_RAW_ROWS}
      mapRow={mapYearSelectorRow}
      scoreFields={[]}
      keepAllRowsPerYear
      selectedYears={selectedYears}
      onSelectedYearsChange={onSelectedYearsChange}
    >
      {({ selectedYearsCount }) => (
        <FoliarAnalysisTableCard
          hasDataTable={hasDataTable}
          rowData={unifiedRowData}
          selectedYearsCount={selectedYearsCount}
          columns={unifiedColumns}
          tableAriaLabel="Tabla unificada de análisis"
        />
      )}
    </DataRecordsSection>
  );
};

export default FoliarAnalysisPanel;
