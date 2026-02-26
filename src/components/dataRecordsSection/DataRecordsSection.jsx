import "./DataRecordsSection.css";
import { useEffect, useRef, useState } from "react";
import { useDataRecordsSectionData } from "./useDataRecordsSectionData";

const DataRecordsSection = ({
  selectedCuartel,
  rawRows,
  mapRow,
  scoreFields,
  keepAllRowsPerYear,
  groupDisplayYears,
  sortRows,
  yearHeaderLabel,
  layoutVariant,
  selectedYears: controlledSelectedYears,
  onSelectedYearsChange,
  children,
}) => {
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const yearPickerRef = useRef(null);
  const tablesScrollRef = useRef(null);
  const [syncedTableMetrics, setSyncedTableMetrics] = useState({
    headerHeightPx: null,
    rowHeightPx: null,
  });

  const {
    normalizedSelectedCuartel,
    availableYears,
    selectedYears,
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

  useEffect(() => {
    setIsYearMenuOpen(false);
  }, [normalizedSelectedCuartel]);

  useEffect(() => {
    if (!isYearMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (yearPickerRef.current?.contains(event.target)) return;
      setIsYearMenuOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isYearMenuOpen]);

  useEffect(() => {
    const element = tablesScrollRef.current;
    if (!element) return undefined;

    const handleWheel = (event) => {
      const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;
      if (!hasHorizontalOverflow) return;

      const horizontalDelta = Math.abs(event.deltaX);
      const verticalDelta = Math.abs(event.deltaY);
      if (verticalDelta <= horizontalDelta) return;

      event.preventDefault();
      element.scrollLeft += event.deltaY;
    };

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const scrollElement = tablesScrollRef.current;
    if (!scrollElement) return undefined;

    const updateMetrics = () => {
      const headerCell = scrollElement.querySelector(".foliar-analysis-table-card__table thead th");
      const bodyCell = scrollElement.querySelector(".foliar-analysis-table-card__table tbody td");
      if (!headerCell || !bodyCell) return;

      const nextHeaderHeight = Math.round(headerCell.getBoundingClientRect().height);
      const nextRowHeight = Math.round(bodyCell.getBoundingClientRect().height);

      setSyncedTableMetrics((current) => {
        if (current.headerHeightPx === nextHeaderHeight && current.rowHeightPx === nextRowHeight) return current;
        return { headerHeightPx: nextHeaderHeight, rowHeightPx: nextRowHeight };
      });
    };

    updateMetrics();
    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(scrollElement);
    window.addEventListener("resize", updateMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, [rowData.length]);

  return (
    <div
      className={`data-records-section${layoutVariant ? ` data-records-section--${layoutVariant}` : ""}`}
      style={{
        ...(syncedTableMetrics.headerHeightPx
          ? { "--data-records-table-header-h": `${syncedTableMetrics.headerHeightPx}px` }
          : null),
        ...(syncedTableMetrics.rowHeightPx ? { "--data-records-table-row-h": `${syncedTableMetrics.rowHeightPx}px` } : null),
      }}
    >
      <div
        className={`data-records-section__tables-area${
          isYearMenuOpen ? " data-records-section__tables-area--menu-open" : ""
        }`}
      >
        <div ref={tablesScrollRef} className="data-records-section__tables-scroll">
          <div className="data-records-section__tables-track">
            {children({
              rowData,
              selectedYearsCount: selectedYears.length,
              yearSelectorProps: {
                yearPickerRef,
                availableYears,
                selectedYears,
                isYearMenuOpen,
                onToggleMenu: () => setIsYearMenuOpen((current) => !current),
                onToggleYear: toggleYear,
                triggerLabel: yearHeaderLabel,
              },
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataRecordsSection;
