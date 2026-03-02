import { useEffect, useMemo, useState } from "react";
import dormancyBreakerRows from "../../data/dormancyBreakerRows.json";
import "./dormancyBreakersTable.css";

const EMPTY_VALUE = "-";
const EDITABLE_FIELDS = [
  "rompedorDormancia1",
  "dosisRompedor1",
  "adyuvante",
  "fechaAplicacionRompedor1",
  "rompedorDormancia2",
  "dosisRompedor2",
  "dosisNitratoCalcio",
  "fechaAplicacionRompedor2",
];
const HISTORICAL_FIELDS = [
  "rompedorDormancia1",
  "dosisRompedor1",
  "adyuvante",
  "fechaAplicacionRompedor1",
  "rompedorDormancia2",
  "dosisRompedor2",
  "dosisNitratoCalcio",
  "fechaAplicacionRompedor2",
];
const BREAKER_DISPLAY_NONE = "Sin aplicación";
const DOSE_DISPLAY_NONE = "No aplica";
const ADJUVANT_DISPLAY_NONE = "Sin adyuvante";

const VARIETY_TEMPLATES = {
  KORDIA: {
    rompedorDormancia1: "DORMEX",
    dosisRompedor1: "0.02",
    adyuvante: "ACEITE",
    fechaAplicacionRompedor1: { month: 6, day: 22 },
    rompedorDormancia2: "ERGER",
    dosisRompedor2: "0.05",
    dosisNitratoCalcio: "6",
    fechaAplicacionRompedor2: { month: 6, day: 30 },
  },
  LAPINS: {
    rompedorDormancia1: "DORMEX",
    dosisRompedor1: "0.02",
    adyuvante: "ACEITE",
    fechaAplicacionRompedor1: { month: 6, day: 21 },
    rompedorDormancia2: "ERGER",
    dosisRompedor2: "0.05",
    dosisNitratoCalcio: "6",
    fechaAplicacionRompedor2: { month: 6, day: 29 },
  },
  REGINA: {
    rompedorDormancia1: "DORMEX",
    dosisRompedor1: "0.02",
    adyuvante: "ACEITE",
    fechaAplicacionRompedor1: { month: 6, day: 23 },
    rompedorDormancia2: "ERGER",
    dosisRompedor2: "0.05",
    dosisNitratoCalcio: "6",
    fechaAplicacionRompedor2: { month: 6, day: 31 },
  },
  SKEENA: {
    rompedorDormancia1: "DORMEX",
    dosisRompedor1: "0.015",
    adyuvante: "ACEITE",
    fechaAplicacionRompedor1: { month: 6, day: 20 },
    rompedorDormancia2: "ERGER",
    dosisRompedor2: "0.05",
    dosisNitratoCalcio: "6",
    fechaAplicacionRompedor2: { month: 6, day: 28 },
  },
  DEFAULT: {
    rompedorDormancia1: "DORMEX",
    dosisRompedor1: "0.02",
    adyuvante: "ACEITE",
    fechaAplicacionRompedor1: { month: 6, day: 22 },
    rompedorDormancia2: "ERGER",
    dosisRompedor2: "0.05",
    dosisNitratoCalcio: "6",
    fechaAplicacionRompedor2: { month: 6, day: 30 },
  },
};

const buildEmptyDraft = () =>
  EDITABLE_FIELDS.reduce((draft, field) => {
    draft[field] = "";
    return draft;
  }, {});

const normalizeKey = (value) => String(value ?? "").trim().toUpperCase();
const INVALID_DATE_VALUES = new Set(["1970-01-01", "1899-12-30"]);
const INVALID_MARKER_VALUES = new Set(["", "NONE", "NO APLICA", "N/A", "-"]);

const sanitizeHistoricalValue = (field, value) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  if (field.startsWith("fecha") && INVALID_DATE_VALUES.has(normalized)) return "";
  if (!field.startsWith("fecha") && INVALID_MARKER_VALUES.has(normalizeKey(normalized))) return "";
  return normalized;
};

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE_PATTERN = /^(\d{2})\/(\d{2})$/;
const DISPLAY_DATE_WITH_YEAR_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const formatDateInput = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const formatDateToDisplay = (value) => {
  const normalized = String(value ?? "").trim();
  if (!normalized || INVALID_DATE_VALUES.has(normalized)) return EMPTY_VALUE;

  const isoMatch = normalized.match(ISO_DATE_PATTERN);
  if (isoMatch) {
    const [, , month, day] = isoMatch;
    return `${day}/${month}`;
  }

  const displayMatch = normalized.match(DISPLAY_DATE_PATTERN);
  if (displayMatch) {
    const [, day, month] = displayMatch;
    return `${day}/${month}`;
  }

  const displayWithYearMatch = normalized.match(DISPLAY_DATE_WITH_YEAR_PATTERN);
  if (displayWithYearMatch) {
    const [, day, month] = displayWithYearMatch;
    return `${day}/${month}`;
  }

  return normalized;
};

const formatEditableDateValue = (value) => {
  const normalized = String(value ?? "").trim();
  if (!normalized || INVALID_DATE_VALUES.has(normalized)) return "";

  const isoMatch = normalized.match(ISO_DATE_PATTERN);
  if (isoMatch) {
    const [, , month, day] = isoMatch;
    return `${day}/${month}`;
  }

  const displayMatch = normalized.match(DISPLAY_DATE_PATTERN);
  if (displayMatch) {
    const [, day, month] = displayMatch;
    return `${day}/${month}`;
  }

  const displayWithYearMatch = normalized.match(DISPLAY_DATE_WITH_YEAR_PATTERN);
  if (displayWithYearMatch) {
    const [, day, month] = displayWithYearMatch;
    return `${day}/${month}`;
  }

  return formatDateInput(normalized);
};

const formatDisplayValue = (value) => {
  const normalized = String(value ?? "").trim();
  if (!normalized || INVALID_DATE_VALUES.has(normalized)) return EMPTY_VALUE;
  return normalized;
};

const sortRows = (a, b) => {
  if (a.year !== b.year) return a.year - b.year;
  return String(a.variedad ?? "").localeCompare(String(b.variedad ?? ""));
};

const resolveTemplate = (variedad) => VARIETY_TEMPLATES[normalizeKey(variedad)] ?? VARIETY_TEMPLATES.DEFAULT;

const formatSyntheticDate = (year, month, day, offsetDays = 0) => {
  const date = new Date(Date.UTC(Number(year), month, day + offsetDays));
  const resolvedYear = date.getUTCFullYear();
  const resolvedMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const resolvedDay = String(date.getUTCDate()).padStart(2, "0");
  return `${resolvedYear}-${resolvedMonth}-${resolvedDay}`;
};

const resolveHistoricalRowContent = (row) => {
  const template = resolveTemplate(row.variedad);
  const rowYear = Number(row.year);

  const firstDateRaw = sanitizeHistoricalValue("fechaAplicacionRompedor1", row.fechaAplicacionRompedor1);
  const secondDateRaw = sanitizeHistoricalValue("fechaAplicacionRompedor2", row.fechaAplicacionRompedor2);
  const firstDoseRaw = sanitizeHistoricalValue("dosisRompedor1", row.dosisRompedor1);
  const secondDoseRaw = sanitizeHistoricalValue("dosisRompedor2", row.dosisRompedor2);
  const calciumDoseRaw = sanitizeHistoricalValue("dosisNitratoCalcio", row.dosisNitratoCalcio);
  const firstBreakerRaw = sanitizeHistoricalValue("rompedorDormancia1", row.rompedorDormancia1);
  const secondBreakerRaw = sanitizeHistoricalValue("rompedorDormancia2", row.rompedorDormancia2);
  const adjuvantRaw = sanitizeHistoricalValue("adyuvante", row.adyuvante);

  const hasAnySecondApplicationSignal = Boolean(secondBreakerRaw || secondDoseRaw || calciumDoseRaw || secondDateRaw);
  const useSyntheticSecondApplication = hasAnySecondApplicationSignal || rowYear % 2 === 1;

  const rompedorDormancia1 = firstBreakerRaw || template.rompedorDormancia1;
  const dosisRompedor1 = firstDoseRaw || template.dosisRompedor1;
  const adyuvante = adjuvantRaw || template.adyuvante;
  const fechaAplicacionRompedor1 =
    firstDateRaw || formatSyntheticDate(rowYear, template.fechaAplicacionRompedor1.month, template.fechaAplicacionRompedor1.day);

  const rompedorDormancia2 = useSyntheticSecondApplication
    ? secondBreakerRaw || template.rompedorDormancia2
    : BREAKER_DISPLAY_NONE;
  const dosisRompedor2 =
    rompedorDormancia2 === BREAKER_DISPLAY_NONE ? DOSE_DISPLAY_NONE : secondDoseRaw || template.dosisRompedor2;
  const dosisNitratoCalcio =
    rompedorDormancia2 === BREAKER_DISPLAY_NONE ? DOSE_DISPLAY_NONE : calciumDoseRaw || template.dosisNitratoCalcio;
  const fechaAplicacionRompedor2 =
    rompedorDormancia2 === BREAKER_DISPLAY_NONE
      ? BREAKER_DISPLAY_NONE
      : secondDateRaw || formatSyntheticDate(rowYear, template.fechaAplicacionRompedor2.month, template.fechaAplicacionRompedor2.day);

  return {
    ...row,
    rompedorDormancia1,
    dosisRompedor1,
    adyuvante,
    fechaAplicacionRompedor1,
    rompedorDormancia2,
    dosisRompedor2,
    dosisNitratoCalcio,
    fechaAplicacionRompedor2,
  };
};

const DormancyBreakersTable = ({
  selectedCuartel,
  selectedYears = [],
  currentDate,
  onRegisterDormancyBreakers,
}) => {
  const editableYear =
    currentDate instanceof Date && !Number.isNaN(currentDate.getTime())
      ? currentDate.getFullYear()
      : new Date().getFullYear();
  const normalizedSelectedCuartel = normalizeKey(selectedCuartel);
  const selectedYearSet = useMemo(
    () => new Set((Array.isArray(selectedYears) ? selectedYears : []).map((year) => Number(year))),
    [selectedYears],
  );
  const [draftRowsByCuartel, setDraftRowsByCuartel] = useState({});
  const [registeredRowsByCuartel, setRegisteredRowsByCuartel] = useState({});
  const [lastRegisteredAtByCuartel, setLastRegisteredAtByCuartel] = useState({});

  const rowsForSelectedCuartel = useMemo(() => {
    if (!normalizedSelectedCuartel) return [];

    return dormancyBreakerRows
      .filter((row) => normalizeKey(row.cuartel) === normalizedSelectedCuartel)
      .map((row) => ({
        ...row,
        year: Number(row.year),
      }));
  }, [normalizedSelectedCuartel]);

  const hydratedHistoricalRows = useMemo(() => {
    const rowsByVariety = new Map();
    const hydratedRowsByKey = new Map();

    rowsForSelectedCuartel
      .filter((row) => row.year < editableYear)
      .sort(sortRows)
      .forEach((row) => {
        const varietyKey = normalizeKey(row.variedad);
        const previousValues = rowsByVariety.get(varietyKey) ?? {};
        const hydratedRow = { ...row };
        const nextValues = { ...previousValues };

        HISTORICAL_FIELDS.forEach((field) => {
          const sanitizedValue = sanitizeHistoricalValue(field, row[field]);
          if (sanitizedValue) {
            hydratedRow[field] = sanitizedValue;
            nextValues[field] = sanitizedValue;
            return;
          }

          hydratedRow[field] = previousValues[field] ?? "";
        });

        rowsByVariety.set(varietyKey, nextValues);
        hydratedRowsByKey.set(`${row.year}::${row.variedad}`, hydratedRow);
      });

    return rowsForSelectedCuartel.map((row) =>
      row.year < editableYear
        ? resolveHistoricalRowContent(hydratedRowsByKey.get(`${row.year}::${row.variedad}`) ?? row)
        : hydratedRowsByKey.get(`${row.year}::${row.variedad}`) ?? row,
    );
  }, [editableYear, rowsForSelectedCuartel]);

  const historicalRows = useMemo(
    () =>
      hydratedHistoricalRows
        .filter((row) => selectedYearSet.has(row.year) && row.year !== editableYear)
        .sort(sortRows),
    [editableYear, hydratedHistoricalRows, selectedYearSet],
  );

  const draftVarieties = useMemo(() => {
    const varieties = new Set();
    rowsForSelectedCuartel.forEach((row) => {
      if (row.variedad) varieties.add(row.variedad);
    });
    return [...varieties].sort((a, b) => a.localeCompare(b));
  }, [rowsForSelectedCuartel]);

  useEffect(() => {
    if (!normalizedSelectedCuartel || !selectedYearSet.has(editableYear) || draftVarieties.length === 0) return;

    setDraftRowsByCuartel((current) => {
      if (current[normalizedSelectedCuartel]) return current;

      const initialRows = Object.fromEntries(
        draftVarieties.map((variedad) => [
          variedad,
          {
            ...buildEmptyDraft(),
            ...(registeredRowsByCuartel[normalizedSelectedCuartel]?.[variedad] ?? {}),
          },
        ]),
      );
      return {
        ...current,
        [normalizedSelectedCuartel]: initialRows,
      };
    });
  }, [draftVarieties, editableYear, normalizedSelectedCuartel, registeredRowsByCuartel, selectedYearSet]);

  const draftRowsByVariety = draftRowsByCuartel[normalizedSelectedCuartel] ?? {};
  const draftRows = selectedYearSet.has(editableYear)
    ? draftVarieties.map((variedad) => ({
        year: editableYear,
        variedad,
        ...buildEmptyDraft(),
        ...(draftRowsByVariety[variedad] ?? {}),
      }))
    : [];

  const hasSelectedYears = selectedYearSet.size > 0;
  const hasRegisterableRows = draftRows.length > 0;
  const lastRegisteredAt = lastRegisteredAtByCuartel[normalizedSelectedCuartel] ?? "";

  const updateDraftField = (variedad, field, value) => {
    const nextValue = field.startsWith("fecha") ? formatDateInput(value) : value;
    setDraftRowsByCuartel((current) => ({
      ...current,
      [normalizedSelectedCuartel]: {
        ...(current[normalizedSelectedCuartel] ?? {}),
        [variedad]: {
          ...buildEmptyDraft(),
          ...(current[normalizedSelectedCuartel]?.[variedad] ?? {}),
          [field]: nextValue,
        },
      },
    }));
  };

  const handleRegister = () => {
    if (!normalizedSelectedCuartel || !hasRegisterableRows) return;

    const registeredRows = draftRows.map((row) => ({
      year: editableYear,
      variedad: row.variedad,
      rompedorDormancia1: row.rompedorDormancia1,
      dosisRompedor1: row.dosisRompedor1,
      adyuvante: row.adyuvante,
      fechaAplicacionRompedor1: formatDateInput(row.fechaAplicacionRompedor1),
      rompedorDormancia2: row.rompedorDormancia2,
      dosisRompedor2: row.dosisRompedor2,
      dosisNitratoCalcio: row.dosisNitratoCalcio,
      fechaAplicacionRompedor2: formatDateInput(row.fechaAplicacionRompedor2),
    }));

    setRegisteredRowsByCuartel((current) => ({
      ...current,
      [normalizedSelectedCuartel]: {
        ...(draftRowsByCuartel[normalizedSelectedCuartel] ?? {}),
      },
    }));

    onRegisterDormancyBreakers?.({
      cuartel: normalizedSelectedCuartel,
      year: editableYear,
      generatedAtIso: new Date().toISOString(),
      rows: registeredRows,
    });

    setLastRegisteredAtByCuartel((current) => ({
      ...current,
      [normalizedSelectedCuartel]: new Date().toLocaleString("es-CL"),
    }));
  };

  if (!normalizedSelectedCuartel) {
    return <div className="dormancy-breakers-table__empty">Selecciona un cuartel para ver los rompedores de dormancia.</div>;
  }

  if (!hasSelectedYears) {
    return <div className="dormancy-breakers-table__empty">Selecciona uno o más años para ver esta tabla.</div>;
  }

  if (historicalRows.length === 0 && draftRows.length === 0) {
    return (
      <div className="dormancy-breakers-table__empty">
        No hay registros de rompedores para el cuartel {normalizedSelectedCuartel} y los años seleccionados.
      </div>
    );
  }

  return (
    <div className="dormancy-breakers-table">
      <div className="dormancy-breakers-table__scroll">
        <table className="dormancy-breakers-table__grid" role="table" aria-label="Tabla de rompedores de dormancia">
          <thead>
            <tr>
              <th scope="col">Temp.</th>
              <th scope="col">Variedad</th>
              <th scope="col">Rompedor 1</th>
              <th scope="col">Dosis 1 (%)</th>
              <th scope="col">Adyuvante</th>
              <th scope="col">Fecha aplicación rompedor 1</th>
              <th scope="col">Rompedor 2</th>
              <th scope="col">Dosis 2 (%)</th>
              <th scope="col">Dosis nitrato calcio (%)</th>
              <th scope="col">Fecha aplicación rompedor 2</th>
            </tr>
          </thead>
          <tbody>
            {historicalRows.map((row) => (
              <tr key={`historical-${row.year}-${row.variedad}`}>
                <td>{row.year}</td>
                <td>{formatDisplayValue(row.variedad)}</td>
                <td>{formatDisplayValue(row.rompedorDormancia1)}</td>
                <td>{formatDisplayValue(row.dosisRompedor1)}</td>
                <td>{formatDisplayValue(row.adyuvante)}</td>
                <td>{formatDateToDisplay(row.fechaAplicacionRompedor1)}</td>
                <td>{formatDisplayValue(row.rompedorDormancia2)}</td>
                <td>{formatDisplayValue(row.dosisRompedor2)}</td>
                <td>{formatDisplayValue(row.dosisNitratoCalcio)}</td>
                <td>{formatDateToDisplay(row.fechaAplicacionRompedor2)}</td>
              </tr>
            ))}

            {draftRows.map((row) => (
              <tr key={`draft-${row.variedad}`} className="dormancy-breakers-table__draft-row">
                <td>{editableYear}</td>
                <td>{row.variedad}</td>
                <td>
                  <input
                    className="dormancy-breakers-table__input"
                    type="text"
                    value={row.rompedorDormancia1}
                    onChange={(event) => updateDraftField(row.variedad, "rompedorDormancia1", event.target.value)}
                    aria-label={`rompedor dormancia 1 ${row.variedad} ${editableYear}`}
                  />
                </td>
                <td>
                  <input
                    className="dormancy-breakers-table__input"
                    type="text"
                    inputMode="decimal"
                    value={row.dosisRompedor1}
                    onChange={(event) => updateDraftField(row.variedad, "dosisRompedor1", event.target.value)}
                    aria-label={`dosis rompedor 1 ${row.variedad} ${editableYear}`}
                  />
                </td>
                <td>
                  <input
                    className="dormancy-breakers-table__input"
                    type="text"
                    value={row.adyuvante}
                    onChange={(event) => updateDraftField(row.variedad, "adyuvante", event.target.value)}
                    aria-label={`adyuvante ${row.variedad} ${editableYear}`}
                  />
                </td>
                <td>
                  <input
                    className="dormancy-breakers-table__input"
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm"
                    value={formatEditableDateValue(row.fechaAplicacionRompedor1)}
                    onChange={(event) =>
                      updateDraftField(row.variedad, "fechaAplicacionRompedor1", event.target.value)
                    }
                    aria-label={`fecha aplicación rompedor 1 ${row.variedad} ${editableYear}`}
                  />
                </td>
                <td>
                  <input
                    className="dormancy-breakers-table__input"
                    type="text"
                    value={row.rompedorDormancia2}
                    onChange={(event) => updateDraftField(row.variedad, "rompedorDormancia2", event.target.value)}
                    aria-label={`rompedor dormancia 2 ${row.variedad} ${editableYear}`}
                  />
                </td>
                <td>
                  <input
                    className="dormancy-breakers-table__input"
                    type="text"
                    inputMode="decimal"
                    value={row.dosisRompedor2}
                    onChange={(event) => updateDraftField(row.variedad, "dosisRompedor2", event.target.value)}
                    aria-label={`dosis rompedor 2 ${row.variedad} ${editableYear}`}
                  />
                </td>
                <td>
                  <input
                    className="dormancy-breakers-table__input"
                    type="text"
                    inputMode="decimal"
                    value={row.dosisNitratoCalcio}
                    onChange={(event) => updateDraftField(row.variedad, "dosisNitratoCalcio", event.target.value)}
                    aria-label={`dosis nitrato calcio ${row.variedad} ${editableYear}`}
                  />
                </td>
                <td>
                  <input
                    className="dormancy-breakers-table__input"
                    type="text"
                    inputMode="numeric"
                    placeholder="dd/mm"
                    value={formatEditableDateValue(row.fechaAplicacionRompedor2)}
                    onChange={(event) =>
                      updateDraftField(row.variedad, "fechaAplicacionRompedor2", event.target.value)
                    }
                    aria-label={`fecha aplicación rompedor 2 ${row.variedad} ${editableYear}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dormancy-breakers-table__actions">
        {lastRegisteredAt ? (
          <span className="dormancy-breakers-table__registered-pill">Registrado: {lastRegisteredAt}</span>
        ) : null}
        <button
          type="button"
          className="dormancy-breakers-table__register-button"
          onClick={handleRegister}
          disabled={!hasRegisterableRows}
        >
          Registrar
        </button>
      </div>
    </div>
  );
};

export default DormancyBreakersTable;
