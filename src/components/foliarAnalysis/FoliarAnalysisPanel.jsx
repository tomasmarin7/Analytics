import "./FoliarAnalysisPanel.css";
import { useEffect, useMemo, useRef, useState } from "react";
import foliarAnalysisRows from "../../data/foliarAnalysisRows.json";

const ANALYSIS_FIELDS = [
  "nitrogenoTotal",
  "fosforo",
  "potasio",
  "calcio",
  "magnesio",
  "hierro",
  "manganeso",
  "zinc",
  "cobre",
  "boro",
  "sodio",
  "cloro",
  "clorofila",
];

const countDataPoints = (row) =>
  ANALYSIS_FIELDS.reduce((total, field) => {
    const value = row[field];
    return value === "" || value === null || value === undefined ? total : total + 1;
  }, 0);

const FoliarAnalysisPanel = ({ eventLabel, selectedCuartel }) => {
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const [selectedYears, setSelectedYears] = useState([]);
  const yearPickerRef = useRef(null);
  const normalizedSelectedCuartel = String(selectedCuartel ?? "").trim().toUpperCase();

  const mappedRows = useMemo(
    () =>
      foliarAnalysisRows.map((row) => ({
        year: Number(row["Temp."]),
        temp: row["Temp."],
        cuartel: row.Cuartel,
        nitrogenoTotal: row["Nitrógeno total"],
        fosforo: row.fosforo,
        potasio: row.potasio,
        calcio: row.calcio,
        magnesio: row.magnesio,
        hierro: row.hierro,
        manganeso: row.manganeso,
        zinc: row.ziinc,
        cobre: row.cobre,
        boro: row.boro,
        sodio: row.sodio,
        cloro: row.cloro,
        clorofila: row.clorofila,
      })),
    []
  );

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

  const selectedYearsForCuartel = useMemo(
    () => selectedYears.filter((year) => availableYears.includes(year)).sort((a, b) => a - b),
    [selectedYears, availableYears]
  );

  const filteredRows = useMemo(
    () =>
      cuartelRows
        .filter((row) => selectedYearsForCuartel.includes(row.year))
        .reduce((rowsByYear, row) => {
          const current = rowsByYear.get(row.year);
          if (!current || countDataPoints(row) > countDataPoints(current)) {
            rowsByYear.set(row.year, row);
          }
          return rowsByYear;
        }, new Map()),
    [cuartelRows, selectedYearsForCuartel]
  );

  const rowData = useMemo(
    () =>
      [...filteredRows.values()].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return String(a.cuartel).localeCompare(String(b.cuartel));
      }),
    [filteredRows]
  );
  const displayYears = useMemo(() => rowData.map((row) => row.year), [rowData]);

  const toggleYear = (year) => {
    setSelectedYears((current) =>
      current.includes(year) ? current.filter((value) => value !== year) : [...current, year].sort((a, b) => a - b)
    );
  };

  const columns = useMemo(
    () => [
      { field: "nitrogenoTotal", header: "Nitrógeno total (%)" },
      { field: "fosforo", header: "Fósforo (%)" },
      { field: "potasio", header: "Potasio (%)" },
      { field: "calcio", header: "Calcio (%)" },
      { field: "magnesio", header: "Magnesio (%)" },
      { field: "hierro", header: "Hierro (ppm)" },
      { field: "manganeso", header: "Manganeso (ppm)" },
      { field: "zinc", header: "Zinc (ppm)" },
      { field: "cobre", header: "Cobre (ppm)" },
      { field: "boro", header: "Boro (ppm)" },
      { field: "sodio", header: "Sodio (ppm)" },
      { field: "cloro", header: "Cloro (%)" },
      { field: "clorofila", header: "Clorofila (Spad)" },
    ],
    []
  );

  return (
    <div className="foliar-analysis-panel">
      <aside
        className={`foliar-analysis-panel__context${
          isYearMenuOpen ? " foliar-analysis-panel__context--menu-open" : ""
        }`}
      >
        <div ref={yearPickerRef} className="foliar-analysis-panel__year-picker">
          <button
            type="button"
            className="foliar-analysis-panel__year-trigger"
            onClick={() => setIsYearMenuOpen((current) => !current)}
            disabled={!availableYears.length}
            aria-label="Seleccionar años"
            title="Seleccionar años"
          />
          {isYearMenuOpen && availableYears.length > 0 && (
            <div className="foliar-analysis-panel__year-menu">
              {availableYears.map((year) => {
                const isSelected = selectedYears.includes(year);
                return (
                  <button
                    key={year}
                    type="button"
                    className={`foliar-analysis-panel__year-menu-item${
                      isSelected ? " foliar-analysis-panel__year-menu-item--selected" : ""
                    }`}
                    onClick={() => toggleYear(year)}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="foliar-analysis-panel__years">
          <table className="foliar-analysis-panel__years-table" role="presentation" aria-hidden="true">
            <thead>
              <tr>
                <th>Temp.</th>
              </tr>
            </thead>
            <tbody>
              {displayYears.map((year) => (
                <tr key={year}>
                  <td>{year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>

      <div className="foliar-analysis-panel__table-shell">
        <span className="foliar-analysis-panel__table-tab">{eventLabel}</span>
        <div className="foliar-analysis-panel__table-inner">
          <div className="foliar-analysis-panel__grid">
            {selectedYears.length === 0 ? (
              <div className="foliar-analysis-panel__empty-message">
                Selecciona al menos un año para formar la tabla.
              </div>
            ) : rowData.length === 0 ? (
              <div className="foliar-analysis-panel__empty-message">
                No hay registros para los años seleccionados.
              </div>
            ) : (
              <div className="foliar-analysis-panel__table-scroll">
                <table className="foliar-analysis-panel__table" role="table" aria-label="Tabla de análisis foliar">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th key={column.field} scope="col">
                          {column.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rowData.map((row) => (
                      <tr key={`${row.cuartel}-${row.year}`}>
                        {columns.map((column) => {
                          const value = row[column.field];
                          const text = value === "" || value === null || value === undefined ? "-" : value;
                          return <td key={`${row.cuartel}-${row.year}-${column.field}`}>{text}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoliarAnalysisPanel;
