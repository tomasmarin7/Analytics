import "./DataRecordsSection.css";
import { useRef } from "react";
import { useDataRecordsSectionData } from "./useDataRecordsSectionData";
import { useVerticalWheelToHorizontalScroll } from "../shared/useVerticalWheelToHorizontalScroll";
import { useSyncedTableMetrics } from "./useSyncedTableMetrics";
import YearChipsBar from "./YearChipsBar/YearChipsBar";

const DataRecordsSection = ({
  selectedCuartel,
  rawRows,
  mapRow,
  scoreFields,
  keepAllRowsPerYear,
  groupDisplayYears,
  sortRows,
  layoutVariant,
  selectedYears: controlledSelectedYears,
  onSelectedYearsChange,
  children,
}) => {
  const tablesScrollRef = useRef(null);

  const {
    normalizedSelectedCuartel,
    availableYears,
    selectedYearsForCuartel,
    rowData,
    toggleYear,
  } = useDataRecordsSectionData({
    selectedCuartel,
    rawRows,
    mapRow,
    scoreFields,
    keepAllRowsPerYear,
    groupDisplayYears,
    sortRows,
    selectedYears: controlledSelectedYears,
    onSelectedYearsChange,
  });

  useVerticalWheelToHorizontalScroll(tablesScrollRef);
  const syncedTableMetrics = useSyncedTableMetrics({
    tablesScrollRef,
    rowCount: rowData.length,
  });
  const hasSelectedCuartel = Boolean(normalizedSelectedCuartel);
  const hasSelectedYears = selectedYearsForCuartel.length > 0;

  return (
    <div className="data-records-layout">
      {!hasSelectedCuartel ? (
        <div className="data-records-layout__hint">Selecciona un cuartel para empezar</div>
      ) : (
        <YearChipsBar
          availableYears={availableYears}
          selectedYears={selectedYearsForCuartel}
          onToggleYear={toggleYear}
        />
      )}

      {hasSelectedCuartel && hasSelectedYears ? (
        <div
          className={`data-records-section${layoutVariant ? ` data-records-section--${layoutVariant}` : ""}`}
          style={{
            ...(syncedTableMetrics.headerHeightPx
              ? { "--data-records-table-header-h": `${syncedTableMetrics.headerHeightPx}px` }
              : null),
            ...(syncedTableMetrics.rowHeightPx
              ? { "--data-records-table-row-h": `${syncedTableMetrics.rowHeightPx}px` }
              : null),
          }}
        >
          <div className="data-records-section__tables-area">
            <div ref={tablesScrollRef} className="data-records-section__tables-scroll">
              <div className="data-records-section__tables-track">
                {children({
                  rowData,
                  selectedYearsCount: selectedYearsForCuartel.length,
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DataRecordsSection;
