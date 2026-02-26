import { useEffect, useMemo, useState } from "react";
import budAnalysisRows from "../../../data/budAnalysisRows.json";
import prePruningCountRows from "../../../data/prePruningCountRows.json";
import fruitSetAndCaliberProfiles from "../../../data/fruitSetAndCaliberProfiles.json";
import { mapBudRow } from "../../../components/foliarAnalysis/budAnalysisConfig";
import { mapPrePruningCountRow } from "../../../components/foliarAnalysis/prePruningCountConfig";
import {
  buildDraftProductionRow,
  buildHistoricalProductionRows,
  getAvailableVarietiesForCuartel,
} from "../productionPotentialService";
import "../styles/ProductionPotentialTable.css";

const BUD_MAPPED_ROWS = budAnalysisRows.map(mapBudRow);
const PRE_PRUNING_MAPPED_ROWS = prePruningCountRows.map(mapPrePruningCountRow);
const DRAFT_YEAR = 2026;

const formatCellValue = (value) => (value === null || value === undefined || value === "" ? "" : value);

const ProductionPotentialTable = ({ selectedCuartel, selectedYears = [] }) => {
  const normalizedSelectedCuartel = String(selectedCuartel ?? "").trim();
  const hasSelectedYears = selectedYears.length > 0;

  const historicalRows = useMemo(
    () =>
      buildHistoricalProductionRows({
        selectedCuartel,
        selectedYears,
        budRows: BUD_MAPPED_ROWS,
        prePruningRows: PRE_PRUNING_MAPPED_ROWS,
        profiles: fruitSetAndCaliberProfiles,
      }),
    [selectedCuartel, selectedYears],
  );

  const varieties = useMemo(
    () =>
      getAvailableVarietiesForCuartel({
        selectedCuartel,
        budRows: BUD_MAPPED_ROWS,
        prePruningRows: PRE_PRUNING_MAPPED_ROWS,
      }),
    [selectedCuartel],
  );

  const [draftByVariety, setDraftByVariety] = useState({});

  useEffect(() => {
    setDraftByVariety((current) => {
      const next = {};
      for (const variedad of varieties) {
        next[variedad] = current[variedad] ?? { cuajaEsperada: "", calibreEsperado: "" };
      }
      return next;
    });
  }, [varieties]);

  const draftRows = useMemo(
    () =>
      varieties.map((variedad) => {
        const draft = draftByVariety[variedad] ?? { cuajaEsperada: "", calibreEsperado: "" };

        const baseRow = buildDraftProductionRow({
          selectedCuartel,
          variedad,
          draftYear: DRAFT_YEAR,
          budRows: BUD_MAPPED_ROWS,
          prePruningRows: PRE_PRUNING_MAPPED_ROWS,
          cuajaEsperada: draft.cuajaEsperada,
          calibreEsperado: draft.calibreEsperado,
        });

        return {
          ...(baseRow ?? {
            year: DRAFT_YEAR,
            variedad,
            cuajaEsperada: null,
            cuajaReal: null,
            calibreEsperado: null,
            calibreReal: null,
            produccionEsperadaKgHa: null,
            produccionRealKgHa: null,
            isDraft: true,
          }),
          cuajaEsperadaInput: draft.cuajaEsperada,
          calibreEsperadoInput: draft.calibreEsperado,
          isDraft: true,
        };
      }),
    [draftByVariety, selectedCuartel, varieties],
  );

  if (!normalizedSelectedCuartel) {
    return (
      <div className="production-potential-table__empty">
        Selecciona un cuartel en el mapa para ver producción posible.
      </div>
    );
  }

  return (
    <div className="production-potential-table__content">
      <div className="production-potential-table__scroll">
        <table className="production-potential-table" role="table" aria-label="Tabla de producción posible">
          <thead>
            <tr>
              <th scope="col">Temp.</th>
              <th scope="col">Variedad</th>
              <th scope="col">% Cuaja Esperada</th>
              <th scope="col">% Cuaja Real</th>
              <th scope="col">Calibre Esperado (g)</th>
              <th scope="col">Calibre Real (g)</th>
              <th scope="col">Prod. Esperada (kg/ha)</th>
              <th scope="col">Prod. Real (kg/ha)</th>
            </tr>
          </thead>
          <tbody>
            {hasSelectedYears
              ? historicalRows.map((row) => (
                  <tr key={`hist-${row.year}-${row.variedad}`}>
                    <td>{row.year}</td>
                    <td>{row.variedad}</td>
                    <td>{formatCellValue(row.cuajaEsperada)}</td>
                    <td>{formatCellValue(row.cuajaReal)}</td>
                    <td>{formatCellValue(row.calibreEsperado)}</td>
                    <td>{formatCellValue(row.calibreReal)}</td>
                    <td>{formatCellValue(row.produccionEsperadaKgHa)}</td>
                    <td>{formatCellValue(row.produccionRealKgHa)}</td>
                  </tr>
                ))
              : null}

            {draftRows.map((row) => (
              <tr key={`draft-${row.variedad}`} className="production-potential-table__draft-row">
                <td>{row.year}</td>
                <td>{row.variedad}</td>
                <td>
                  <input
                    className="production-potential-table__input"
                    type="text"
                    inputMode="decimal"
                    value={row.cuajaEsperadaInput}
                    onChange={(event) =>
                      setDraftByVariety((current) => ({
                        ...current,
                        [row.variedad]: {
                          ...(current[row.variedad] ?? {}),
                          cuajaEsperada: event.target.value,
                        },
                      }))
                    }
                    aria-label={`% cuaja esperada ${row.variedad} ${DRAFT_YEAR}`}
                  />
                </td>
                <td />
                <td>
                  <input
                    className="production-potential-table__input"
                    type="text"
                    inputMode="decimal"
                    value={row.calibreEsperadoInput}
                    onChange={(event) =>
                      setDraftByVariety((current) => ({
                        ...current,
                        [row.variedad]: {
                          ...(current[row.variedad] ?? {}),
                          calibreEsperado: event.target.value,
                        },
                      }))
                    }
                    aria-label={`calibre esperado ${row.variedad} ${DRAFT_YEAR}`}
                  />
                </td>
                <td />
                <td>{formatCellValue(row.produccionEsperadaKgHa)}</td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="production-potential-table__actions">
        <button type="button" className="production-potential-table__register-button">
          Registrar
        </button>
      </div>
    </div>
  );
};

export default ProductionPotentialTable;
