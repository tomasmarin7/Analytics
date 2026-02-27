import { useEffect, useMemo, useState } from "react";
import {
  buildDraftDardosEliminar,
  buildDraftRows,
  buildHistoricalRows,
  DRAFT_YEAR,
  EMPTY_DRAFT_VALUES,
  formatCellValue,
  normalizeText,
  OBJECTIVE_FACTOR,
  toNumber,
} from "./pruningDecisionService";
import "./pruningDecisionTable.css";

const PruningDecisionTable = ({
  selectedCuartel,
  selectedYears = [],
  registeredProductionByCuartel = {},
  registeredPruningByCuartel = {},
  onRegisterPruning,
}) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  const hasSelectedYears = Array.isArray(selectedYears) && selectedYears.length > 0;

  const historicalRows = useMemo(
    () => buildHistoricalRows({ selectedCuartel, selectedYears }),
    [selectedCuartel, selectedYears],
  );

  const registeredProductionForSelectedCuartel = normalizedSelectedCuartel
    ? registeredProductionByCuartel[normalizedSelectedCuartel]
    : null;
  const registeredPruningForSelectedCuartel = normalizedSelectedCuartel
    ? registeredPruningByCuartel[normalizedSelectedCuartel]
    : null;

  const draftRows = useMemo(
    () =>
      buildDraftRows({
        selectedCuartel,
        registeredProductionForSelectedCuartel,
      }),
    [registeredProductionForSelectedCuartel, selectedCuartel],
  );

  const [draftByCuartel, setDraftByCuartel] = useState({});

  useEffect(() => {
    if (!normalizedSelectedCuartel) return;

    setDraftByCuartel((current) => {
      if (current[normalizedSelectedCuartel]) return current;

      const defaultValues = Object.fromEntries(
        draftRows.map((row) => [
          normalizeText(row.variedad),
          {
            produccionObjetivo:
              String(
                registeredPruningForSelectedCuartel?.rows?.find(
                  (registeredRow) => normalizeText(registeredRow?.variedad) === normalizeText(row.variedad),
                )?.produccionObjetivo ?? "",
              ) ||
              (Number.isFinite(row.produccionObjetivoDefault)
                ? String(row.produccionObjetivoDefault * OBJECTIVE_FACTOR)
                : ""),
          },
        ]),
      );

      return {
        ...current,
        [normalizedSelectedCuartel]: defaultValues,
      };
    });
  }, [draftRows, normalizedSelectedCuartel, registeredPruningForSelectedCuartel]);

  if (!normalizedSelectedCuartel) {
    return <div className="pruning-decision-table__empty">Selecciona un cuartel en el mapa para ver la tabla de poda.</div>;
  }

  if (!hasSelectedYears) {
    return <div className="pruning-decision-table__empty">Selecciona uno o más años para ver la tabla de poda.</div>;
  }

  const draftByVariety = draftByCuartel[normalizedSelectedCuartel] ?? {};

  const setDraftField = (variedad, field, value) => {
    setDraftByCuartel((current) => ({
      ...current,
      [normalizedSelectedCuartel]: {
        ...(current[normalizedSelectedCuartel] ?? {}),
        [normalizeText(variedad)]: {
          ...(current[normalizedSelectedCuartel]?.[normalizeText(variedad)] ?? EMPTY_DRAFT_VALUES),
          [field]: value,
        },
      },
    }));
  };

  const handleRegister = () => {
    if (!normalizedSelectedCuartel) return;

    onRegisterPruning?.({
      cuartel: normalizedSelectedCuartel,
      year: DRAFT_YEAR,
      generatedAtIso: new Date().toISOString(),
      rows: draftRows.map((row) => {
        const varietyDraft = draftByVariety[normalizeText(row.variedad)] ?? EMPTY_DRAFT_VALUES;
        return {
          year: DRAFT_YEAR,
          variedad: row.variedad,
          produccionObjetivo: toNumber(varietyDraft.produccionObjetivo),
        };
      }),
    });
  };

  return (
    <div className="pruning-decision-table__content">
      <div className="pruning-decision-table__scroll">
        <table className="pruning-decision-table" role="table" aria-label="Tabla de decisión de poda">
          <thead>
            <tr>
              <th scope="col">Temp.</th>
              <th scope="col">Variedad</th>
              <th scope="col">% Cuaja Estimada</th>
              <th scope="col">% Cuaja Real</th>
              <th scope="col">Producción Objetivo (kg/ha)</th>
              <th scope="col">Producción Real (kg/ha)</th>
              <th scope="col">Dardos a Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {historicalRows.map((row) => (
              <tr key={`hist-${row.year}-${row.variedad}`}>
                <td>{row.year}</td>
                <td>{row.variedad}</td>
                <td>{formatCellValue(row.cuajaEstimada)}</td>
                <td>{formatCellValue(row.cuajaReal)}</td>
                <td>{formatCellValue(row.produccionObjetivo)}</td>
                <td>{formatCellValue(row.produccionReal)}</td>
                <td>{formatCellValue(row.dardosEliminar)}</td>
              </tr>
            ))}

            {draftRows.map((row) => {
              const varietyDraft = draftByVariety[normalizeText(row.variedad)] ?? EMPTY_DRAFT_VALUES;
              const draftPruningMetrics = buildDraftDardosEliminar({
                preRow: row.preRow,
                budRow: row.budRow,
                registeredRow: row.registeredRow,
                productionObjectiveKgHa: varietyDraft.produccionObjetivo,
              });

              return (
                <tr key={`draft-${row.variedad}`} className="pruning-decision-table__draft-row">
                  <td>{DRAFT_YEAR}</td>
                  <td>{row.variedad}</td>
                  <td>{formatCellValue(row.cuajaEstimada)}</td>
                  <td className="pruning-decision-table__locked-cell" />
                  <td>
                    <input
                      className="pruning-decision-table__input"
                      type="text"
                      inputMode="decimal"
                      value={varietyDraft.produccionObjetivo}
                      onChange={(event) => setDraftField(row.variedad, "produccionObjetivo", event.target.value)}
                      aria-label={`producción objetivo ${row.variedad} ${DRAFT_YEAR}`}
                    />
                  </td>
                  <td className="pruning-decision-table__locked-cell" />
                  <td>{formatCellValue(draftPruningMetrics?.dardosEliminar)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pruning-decision-table__actions">
        <button type="button" className="pruning-decision-table__register-button" onClick={handleRegister}>
          Registrar
        </button>
      </div>
    </div>
  );
};

export default PruningDecisionTable;
