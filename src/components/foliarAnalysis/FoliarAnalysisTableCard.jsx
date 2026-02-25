import "./FoliarAnalysisTableCard.css";

const renderCellValue = (value) => (value === "" || value === null || value === undefined ? "-" : value);

const buildRowKey = (row, rowIndex) =>
  `${row.cuartel ?? "cuartel"}-${row.year ?? "year"}-${row.variedad ?? "variedad"}-${rowIndex}`;

const FoliarAnalysisTableCard = ({
  tabItems = [],
  hasDataTable,
  rowData,
  selectedYearsCount,
  columns = [],
  tableAriaLabel = "Tabla de análisis",
  tableType = null,
}) => {
  const hasTabs = tabItems.length > 0;
  let previousYear = null;
  let previousVariedad = null;
  let yearBandIndex = -1;

  return (
    <div
      className={`foliar-analysis-table-card${
        tableType ? ` foliar-analysis-table-card--${tableType}` : ""
      }${hasTabs ? " foliar-analysis-table-card--with-tabs" : ""}`}
    >
      {hasTabs ? (
        <div className="foliar-analysis-table-card__tabs">
          {tabItems.map((tab) => (
            <span
              key={tab.id}
              className={`foliar-analysis-table-card__tab foliar-analysis-table-card__tab--${tab.id}`}
            >
              {tab.label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="foliar-analysis-table-card__inner">
        <div className="foliar-analysis-table-card__grid">
          {!hasDataTable ? (
            <div className="foliar-analysis-table-card__empty-message">
              No hay tabla disponible para los eventos seleccionados.
            </div>
          ) : selectedYearsCount === 0 ? (
            <div className="foliar-analysis-table-card__empty-message">Selecciona al menos un año para formar la tabla.</div>
          ) : rowData.length === 0 ? (
            <div className="foliar-analysis-table-card__empty-message">No hay registros para los años seleccionados.</div>
          ) : (
            <div className="foliar-analysis-table-card__table-scroll">
              <table
                className={`foliar-analysis-table-card__table${
                  tableType ? ` foliar-analysis-table-card__table--${tableType}` : ""
                }`}
                role="table"
                aria-label={tableAriaLabel}
              >
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
                  {rowData.map((row, rowIndex) => {
                    const isYearStart = rowIndex === 0 || row.year !== previousYear;
                    if (isYearStart) yearBandIndex += 1;
                    const hasVariedad = row.variedad !== "" && row.variedad !== null && row.variedad !== undefined;
                    const isVariedadStart =
                      hasVariedad &&
                      (isYearStart || rowIndex === 0 || String(row.variedad) !== String(previousVariedad ?? ""));
                    const rowClassName = [
                      "foliar-analysis-table-card__row",
                      yearBandIndex % 2 === 0
                        ? "foliar-analysis-table-card__row--year-band-a"
                        : "foliar-analysis-table-card__row--year-band-b",
                      isYearStart ? "foliar-analysis-table-card__row--year-start" : "",
                      isVariedadStart ? "foliar-analysis-table-card__row--variedad-start" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    previousYear = row.year;
                    previousVariedad = row.variedad;

                    return (
                      <tr key={buildRowKey(row, rowIndex)} className={rowClassName}>
                        {columns.map((column) => (
                          <td key={`${buildRowKey(row, rowIndex)}-${column.field}`}>{renderCellValue(row[column.field])}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoliarAnalysisTableCard;
