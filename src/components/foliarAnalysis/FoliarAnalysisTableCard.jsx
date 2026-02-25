import "./FoliarAnalysisTableCard.css";
import { FOLIAR_COLUMNS } from "./foliarAnalysisConfig";

const renderCellValue = (value) => (value === "" || value === null || value === undefined ? "-" : value);

const FoliarAnalysisTableCard = ({ tabItems = [], rowData, selectedYearsCount }) => (
  <div className="foliar-analysis-table-card">
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
    <div className="foliar-analysis-table-card__inner">
      <div className="foliar-analysis-table-card__grid">
        {selectedYearsCount === 0 ? (
          <div className="foliar-analysis-table-card__empty-message">Selecciona al menos un año para formar la tabla.</div>
        ) : rowData.length === 0 ? (
          <div className="foliar-analysis-table-card__empty-message">No hay registros para los años seleccionados.</div>
        ) : (
          <div className="foliar-analysis-table-card__table-scroll">
            <table className="foliar-analysis-table-card__table" role="table" aria-label="Tabla de análisis foliar">
              <thead>
                <tr>
                  {FOLIAR_COLUMNS.map((column) => (
                    <th key={column.field} scope="col">
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowData.map((row) => (
                  <tr key={`${row.cuartel}-${row.year}`}>
                    {FOLIAR_COLUMNS.map((column) => (
                      <td key={`${row.cuartel}-${row.year}-${column.field}`}>{renderCellValue(row[column.field])}</td>
                    ))}
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

export default FoliarAnalysisTableCard;
