import "./FoliarAnalysisTableCard.css";

const renderCellValue = (value) => (value === "" || value === null || value === undefined ? "-" : value);

const buildRowKey = (row, rowIndex) =>
  `${row.cuartel ?? "cuartel"}-${row.year ?? "year"}-${row.variedad ?? "variedad"}-${rowIndex}`;

const BUD_FALLBACK_COLUMNS = [
  { field: "variedad", header: "Variedad" },
  { field: "yemasDardo", header: "Yemas/Dardo" },
  { field: "floresYemaDardo", header: "Flores/Yema/Dardo" },
  { field: "floresDardo", header: "Flores/Dardo" },
  { field: "dano", header: "Daño (%)" },
];

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
  const effectiveColumns = tableType === "bud" ? BUD_FALLBACK_COLUMNS : columns;
  const isBudTable = tableType === "bud";

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
                    {isBudTable ? (
                      <>
                        <th scope="col">Variedad</th>
                        <th scope="col">Yemas/Dardo</th>
                        <th scope="col">Flores/Yema/Dardo</th>
                        <th scope="col">Flores/Dardo</th>
                        <th scope="col">Daño (%)</th>
                      </>
                    ) : (
                      effectiveColumns.map((column) => (
                        <th key={column.field} scope="col">
                          {column.header}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rowData.map((row, rowIndex) => (
                    <tr key={buildRowKey(row, rowIndex)}>
                      {isBudTable ? (
                        <>
                          <td>{renderCellValue(row.variedad)}</td>
                          <td>{renderCellValue(row.yemasDardo)}</td>
                          <td>{renderCellValue(row.floresYemaDardo)}</td>
                          <td>{renderCellValue(row.floresDardo)}</td>
                          <td>{renderCellValue(row.dano)}</td>
                        </>
                      ) : (
                        effectiveColumns.map((column) => (
                          <td key={`${buildRowKey(row, rowIndex)}-${column.field}`}>{renderCellValue(row[column.field])}</td>
                        ))
                      )}
                    </tr>
                  ))}
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
