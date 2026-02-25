import { useMemo, useState } from "react";

const countDataPoints = (row, fields) =>
  fields.reduce((total, field) => {
    const value = row[field];
    return value === "" || value === null || value === undefined ? total : total + 1;
  }, 0);

export const useDataRecordsSectionData = ({
  selectedCuartel,
  rawRows,
  mapRow,
  scoreFields,
  keepAllRowsPerYear = false,
  groupDisplayYears = false,
  sortRows,
  selectedYears: controlledSelectedYears,
  onSelectedYearsChange,
}) => {
  const [internalSelectedYears, setInternalSelectedYears] = useState([]);
  const selectedYears = controlledSelectedYears ?? internalSelectedYears;
  const setSelectedYears = onSelectedYearsChange ?? setInternalSelectedYears;
  const normalizedSelectedCuartel = String(selectedCuartel ?? "").trim().toUpperCase();

  const mappedRows = useMemo(() => rawRows.map(mapRow), [rawRows, mapRow]);

  const cuartelRows = useMemo(
    () =>
      mappedRows.filter((row) =>
        normalizedSelectedCuartel
          ? String(row.cuartel ?? "").trim().toUpperCase() === normalizedSelectedCuartel
          : false
      ),
    [mappedRows, normalizedSelectedCuartel]
  );

  const availableYears = useMemo(
    () =>
      [...new Set(cuartelRows.map((row) => row.year).filter((year) => Number.isFinite(year)))].sort(
        (a, b) => a - b
      ),
    [cuartelRows]
  );

  const selectedYearsForCuartel = useMemo(
    () => selectedYears.filter((year) => availableYears.includes(year)).sort((a, b) => a - b),
    [selectedYears, availableYears]
  );

  const filteredRows = useMemo(
    () => cuartelRows.filter((row) => selectedYearsForCuartel.includes(row.year)),
    [cuartelRows, selectedYearsForCuartel]
  );

  const rowData = useMemo(
    () => {
      const defaultSortRows = (a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return String(a.cuartel).localeCompare(String(b.cuartel));
      };

      const rowsForTable = keepAllRowsPerYear
        ? filteredRows
        : filteredRows.reduce((rowsByYear, row) => {
            const current = rowsByYear.get(row.year);
            if (!current || countDataPoints(row, scoreFields) > countDataPoints(current, scoreFields)) {
              rowsByYear.set(row.year, row);
            }
            return rowsByYear;
          }, new Map()).values();

      return [...rowsForTable].sort(sortRows ?? defaultSortRows);
    },
    [filteredRows, keepAllRowsPerYear, scoreFields, sortRows]
  );

  const displayYears = useMemo(() => {
    if (!groupDisplayYears) return rowData.map((row) => row.year);

    let previousYear = null;
    return rowData.map((row) => {
      const currentYear = row.year;
      const shouldDisplayYear = currentYear !== previousYear;
      previousYear = currentYear;
      return shouldDisplayYear ? currentYear : "";
    });
  }, [rowData, groupDisplayYears]);

  const toggleYear = (year) => {
    setSelectedYears((current) =>
      current.includes(year) ? current.filter((value) => value !== year) : [...current, year].sort((a, b) => a - b)
    );
  };

  return {
    normalizedSelectedCuartel,
    availableYears,
    selectedYears,
    rowData,
    displayYears,
    toggleYear,
  };
};
