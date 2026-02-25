import { useMemo, useState } from "react";
import fertilizationPlanRows from "../../data/fertilizationPlanRows.json";
import "./FertilizationPlanTable.css";

const FERTILIZATION_COLUMNS = [
  { field: "temp", header: "Temp." },
  { field: "boro", header: "Boro" },
  { field: "calcio", header: "Calcio" },
  { field: "cobre", header: "Cobre" },
  { field: "fosforo", header: "Fósforo" },
  { field: "hierro", header: "Hierro" },
  { field: "magnesio", header: "Magnesio" },
  { field: "manganeso", header: "Manganeso" },
  { field: "nitrogeno", header: "Nitrógeno" },
  { field: "potasio", header: "Potasio" },
  { field: "zinc", header: "Zinc" },
];

const renderCellValue = (value) => (value === "" || value === null || value === undefined ? "-" : value);

const FertilizationPlanTable = ({ selectedHuerto, selectedCuartel, selectedYears = [] }) => {
  const currentYear = new Date().getFullYear();
  const normalizedSelectedCuartel = String(selectedCuartel ?? "").trim().toUpperCase();
  const selectedYearSet = useMemo(() => new Set(selectedYears), [selectedYears]);
  const editableFields = useMemo(
    () => FERTILIZATION_COLUMNS.map((column) => column.field).filter((field) => field !== "temp"),
    [],
  );
  const [draftRow, setDraftRow] = useState(() =>
    editableFields.reduce((acc, field) => {
      acc[field] = "";
      return acc;
    }, {}),
  );

  const filteredRows = useMemo(() => {
    if (!normalizedSelectedCuartel) return [];
    if (selectedYearSet.size === 0) return [];

    return fertilizationPlanRows
      .filter((row) => String(row.cuartel ?? "").trim().toUpperCase() === normalizedSelectedCuartel)
      .filter((row) => selectedYearSet.has(Number(row.temp)))
      .sort((a, b) => Number(a.temp) - Number(b.temp));
  }, [normalizedSelectedCuartel, selectedYearSet]);

  if (!normalizedSelectedCuartel) {
    return (
      <div className="fertilization-plan-table__empty">
        Selecciona un cuartel en el mapa para ver el plan de fertilización.
      </div>
    );
  }

  const showNoRecordsMessage = selectedYearSet.size > 0 && filteredRows.length === 0;

  return (
    <div className="fertilization-plan-table__content">
      {showNoRecordsMessage ? (
        <div className="fertilization-plan-table__hint">
          No hay registros del plan de fertilización para {selectedHuerto} {normalizedSelectedCuartel} y los años elegidos.
        </div>
      ) : null}

      <div className="fertilization-plan-table__scroll">
        <table className="fertilization-plan-table" role="table" aria-label="Tabla de plan de fertilización">
          <thead>
            <tr>
              {FERTILIZATION_COLUMNS.map((column) => (
                <th key={column.field} scope="col">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={`${row.cuartel}-${row.temp}`}>
                {FERTILIZATION_COLUMNS.map((column) => (
                  <td key={`${row.cuartel}-${row.temp}-${column.field}`}>{renderCellValue(row[column.field])}</td>
                ))}
              </tr>
            ))}

            <tr className="fertilization-plan-table__draft-row">
              <td>{currentYear}</td>
              {editableFields.map((field) => (
                <td key={`draft-${field}`}>
                  <input
                    className="fertilization-plan-table__input"
                    type="text"
                    inputMode="decimal"
                    value={draftRow[field]}
                    onChange={(event) =>
                      setDraftRow((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                    aria-label={`Ingresar valor de ${field}`}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="fertilization-plan-table__actions">
        <button type="button" className="fertilization-plan-table__register-button">
          Registrar
        </button>
      </div>
    </div>
  );
};

export default FertilizationPlanTable;
