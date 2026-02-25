import foliarAnalysisRows from "../../data/foliarAnalysisRows.json";
import budAnalysisRows from "../../data/budAnalysisRows.json";
import { useMemo } from "react";
import DataRecordsSection from "../dataRecordsSection/DataRecordsSection";
import FoliarAnalysisTableCard from "./FoliarAnalysisTableCard";
import { FOLIAR_COLUMNS, FOLIAR_SCORE_FIELDS, mapFoliarRow } from "./foliarAnalysisConfig";
import { BUD_COLUMNS, BUD_SCORE_FIELDS, mapBudRow, sortBudRows } from "./budAnalysisConfig";
import { BUD_ANALYSIS_EVENT_ID, FOLIAR_ANALYSIS_EVENT_ID } from "../../features/timelineEvents";
import "../../features/timelineEvents/budAnalysis/tab.css";
import "../../features/timelineEvents/prePruningCount/tab.css";

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

const alignRowsToYearLayout = (rows, layoutRows, { showOnlyFirstRowPerYear = false } = {}) => {
  if (!layoutRows.length) return [];

  const firstRowByYear = rows.reduce((acc, row) => {
    if (!acc.has(row.year)) acc.set(row.year, row);
    return acc;
  }, new Map());

  const renderedYears = new Set();
  return layoutRows.map((layoutRow) => {
    const sourceRow = firstRowByYear.get(layoutRow.year);
    if (!sourceRow) return { year: layoutRow.year };

    if (!showOnlyFirstRowPerYear) return sourceRow;

    if (renderedYears.has(layoutRow.year)) return { year: layoutRow.year };
    renderedYears.add(layoutRow.year);
    return sourceRow;
  });
};

const FoliarAnalysisPanel = ({
  activeEvents = [],
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
}) => {
  const tabByEventId = Object.fromEntries(activeEvents.map((event) => [event.id, { id: event.id, label: event.label }]));
  const hasFoliarAnalysis = activeEvents.some((event) => event.id === FOLIAR_ANALYSIS_EVENT_ID);
  const hasBudAnalysis = activeEvents.some((event) => event.id === BUD_ANALYSIS_EVENT_ID);
  const hasDataTable = hasFoliarAnalysis || hasBudAnalysis;
  const primaryTableType = hasBudAnalysis ? "bud" : hasFoliarAnalysis ? "foliar" : null;

  const foliarRowData = useMemo(
    () =>
      buildTableRows({
        selectedCuartel,
        selectedYears,
        rawRows: foliarAnalysisRows,
        mapRow: mapFoliarRow,
        scoreFields: FOLIAR_SCORE_FIELDS,
      }),
    [selectedCuartel, selectedYears]
  );

  const tableItems = [
    hasFoliarAnalysis
      ? {
          id: "foliar",
          type: "foliar",
          tabItem: tabByEventId[FOLIAR_ANALYSIS_EVENT_ID] ?? null,
          columns: FOLIAR_COLUMNS,
          ariaLabel: "Tabla de análisis foliar",
        }
      : null,
    hasBudAnalysis
      ? {
          id: "bud",
          type: "bud",
          tabItem: tabByEventId[BUD_ANALYSIS_EVENT_ID] ?? null,
          columns: BUD_COLUMNS,
          ariaLabel: "Tabla de análisis de yemas",
        }
      : null,
  ].filter(Boolean);
  const tablesToRender =
    tableItems.length > 0
      ? tableItems
      : [{ id: "no-data-table", type: null, tabItem: null, columns: [], rowData: [], ariaLabel: "Tabla de análisis" }];

  const primaryTableConfig =
    primaryTableType === "foliar"
      ? { rawRows: foliarAnalysisRows, mapRow: mapFoliarRow, scoreFields: FOLIAR_SCORE_FIELDS }
      : primaryTableType === "bud"
        ? {
            rawRows: budAnalysisRows,
            mapRow: mapBudRow,
            scoreFields: BUD_SCORE_FIELDS,
            keepAllRowsPerYear: true,
            groupDisplayYears: true,
            sortRows: sortBudRows,
          }
        : { rawRows: foliarAnalysisRows, mapRow: mapFoliarRow, scoreFields: FOLIAR_SCORE_FIELDS };

  return (
    <DataRecordsSection
      selectedCuartel={selectedCuartel}
      rawRows={primaryTableConfig.rawRows}
      mapRow={primaryTableConfig.mapRow}
      scoreFields={primaryTableConfig.scoreFields}
      keepAllRowsPerYear={primaryTableConfig.keepAllRowsPerYear}
      groupDisplayYears={primaryTableConfig.groupDisplayYears}
      sortRows={primaryTableConfig.sortRows}
      yearHeaderLabel="Temp."
      layoutVariant={primaryTableType === "bud" ? "bud-analysis" : undefined}
      selectedYears={selectedYears}
      onSelectedYearsChange={onSelectedYearsChange}
    >
      {({ selectedYearsCount, rowData: sectionRowData }) => {
        const rowsByTableType = {
          bud: hasBudAnalysis ? sectionRowData : [],
          foliar: hasBudAnalysis
            ? alignRowsToYearLayout(foliarRowData, sectionRowData, { showOnlyFirstRowPerYear: true })
            : foliarRowData,
        };

        return tablesToRender.map((table) => (
          <FoliarAnalysisTableCard
            key={table.id}
            tabItems={table.tabItem ? [table.tabItem] : []}
            hasDataTable={hasDataTable}
            rowData={rowsByTableType[table.type] ?? []}
            selectedYearsCount={selectedYearsCount}
            columns={table.columns}
            tableAriaLabel={table.ariaLabel}
            tableType={table.type}
          />
        ));
      }}
    </DataRecordsSection>
  );
};

export default FoliarAnalysisPanel;
