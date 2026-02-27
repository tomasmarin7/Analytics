import { useEffect, useMemo, useRef, useState } from "react";

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
  const previousCuartelRef = useRef(normalizedSelectedCuartel);

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
  const availableYearsSet = useMemo(() => new Set(availableYears), [availableYears]);

  const selectedYearsForCuartel = useMemo(
    () => selectedYears.filter((year) => availableYearsSet.has(year)).sort((a, b) => a - b),
    [selectedYears, availableYearsSet]
  );
  const selectedYearsSet = useMemo(() => new Set(selectedYearsForCuartel), [selectedYearsForCuartel]);

  useEffect(() => {
    if (previousCuartelRef.current === normalizedSelectedCuartel) return;
    previousCuartelRef.current = normalizedSelectedCuartel;
    setSelectedYears((current) => (current.length ? [] : current));
  }, [normalizedSelectedCuartel, setSelectedYears]);

  const filteredRows = useMemo(
    () => cuartelRows.filter((row) => selectedYearsSet.has(row.year)),
    [cuartelRows, selectedYearsSet]
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
    selectedYearsForCuartel,
    rowData,
    displayYears,
    toggleYear,
  };
};
