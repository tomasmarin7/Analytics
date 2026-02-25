import "./DataRecordsSection.css";
import { useEffect, useRef, useState } from "react";
import { useDataRecordsSectionData } from "./useDataRecordsSectionData";
import YearSelector from "./YearSelector/YearSelector";
import YearIndexColumn from "./YearIndexColumn/YearIndexColumn";

const DataRecordsSection = ({
  selectedCuartel,
  rawRows,
  mapRow,
  scoreFields,
  selectedYears: controlledSelectedYears,
  onSelectedYearsChange,
  children,
}) => {
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const yearPickerRef = useRef(null);

  const {
    normalizedSelectedCuartel,
    availableYears,
    selectedYears,
    rowData,
    displayYears,
    toggleYear,
  } = useDataRecordsSectionData({
    selectedCuartel,
    rawRows,
    mapRow,
    scoreFields,
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

  return (
    <div className="data-records-section">
      <aside
        className={`data-records-section__context${
          isYearMenuOpen ? " data-records-section__context--menu-open" : ""
        }`}
      >
        <YearSelector
          yearPickerRef={yearPickerRef}
          availableYears={availableYears}
          selectedYears={selectedYears}
          isYearMenuOpen={isYearMenuOpen}
          onToggleMenu={() => setIsYearMenuOpen((current) => !current)}
          onToggleYear={toggleYear}
        />
        <YearIndexColumn years={displayYears} />
      </aside>

      {children({ rowData, selectedYearsCount: selectedYears.length })}
    </div>
  );
};

export default DataRecordsSection;
