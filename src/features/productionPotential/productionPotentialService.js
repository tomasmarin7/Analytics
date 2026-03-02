const SERIES_BASE_YEAR = 2017;
const VARIETY_COLORS = [
  { strong: "#4E0000", soft: "#7A1E1E", text: "#FFF4F3" },
  { strong: "#8F1D2C", soft: "#B24A5D", text: "#FFF6F6" },
  { strong: "#FFB3B1", soft: "#FFD2D0", text: "#4E0000" },
  { strong: "#6E0F1F", soft: "#9C4154", text: "#FFF5F5" },
  { strong: "#C44A57", soft: "#E49AA0", text: "#2C090B" },
  { strong: "#7D0C16", soft: "#A93C49", text: "#FFF4F4" },
  { strong: "#D86C74", soft: "#F0B8BC", text: "#3F0A0D" },
  { strong: "#5A0A0A", soft: "#874343", text: "#FFF5F4" },
];

const normalizeText = (value) => String(value ?? "").trim().toUpperCase();

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const toPercent = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const normalized = String(value).trim().replace("%", "").replace(",", ".");
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const round = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const hashText = (value) => {
  const text = String(value ?? "").trim().toUpperCase();
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const resolveVarietyColorPair = (variedad) => VARIETY_COLORS[hashText(variedad) % VARIETY_COLORS.length];

export const buildVarietyColorPair = (variedad) => {
  const colors = resolveVarietyColorPair(variedad);
  return { strong: colors.strong, soft: colors.soft, text: colors.text };
};

const pickSeriesValueForYear = (series, year) => {
  if (!Array.isArray(series) || series.length === 0 || !Number.isFinite(year)) return null;

  const offset = year - SERIES_BASE_YEAR;
  const normalizedIndex = ((offset % series.length) + series.length) % series.length;
  return toNumber(series[normalizedIndex]);
};

const resolveProfileMap = (profiles = []) => {
  const map = new Map();

  for (const profile of profiles) {
    const key = `${normalizeText(profile.cuartel)}::${normalizeText(profile.variedad)}`;
    map.set(key, profile);
  }

  return map;
};

const resolveProfile = (profileMap, cuartel, variedad) => {
  const byVarietyKey = `${normalizeText(cuartel)}::${normalizeText(variedad)}`;
  if (profileMap.has(byVarietyKey)) return profileMap.get(byVarietyKey);

  const byCuartelFallbackKey = `${normalizeText(cuartel)}::ALL`;
  if (profileMap.has(byCuartelFallbackKey)) return profileMap.get(byCuartelFallbackKey);

  return null;
};

const calculateProductionKgHa = ({
  dardosPlanta,
  floresDardo,
  danoPercent,
  cuajaPercent,
  plantasHaProductivas,
  calibreGr,
}) => {
  const parsedDardosPlanta = toNumber(dardosPlanta);
  const parsedFloresDardo = toNumber(floresDardo);
  const parsedDanoPercent = toPercent(danoPercent);
  const parsedCuajaPercent = toPercent(cuajaPercent);
  const parsedPlantasHaProductivas = toNumber(plantasHaProductivas);
  const parsedCalibreGr = toNumber(calibreGr);

  if (
    parsedDardosPlanta === null ||
    parsedFloresDardo === null ||
    parsedDanoPercent === null ||
    parsedCuajaPercent === null ||
    parsedPlantasHaProductivas === null ||
    parsedCalibreGr === null
  ) {
    return null;
  }

  const frutosPlanta =
    parsedDardosPlanta * parsedFloresDardo * (1 - parsedDanoPercent / 100) * (parsedCuajaPercent / 100);

  return round((frutosPlanta * parsedPlantasHaProductivas * parsedCalibreGr) / 1000, 2);
};

const buildRowKey = (row) => `${row.year ?? ""}::${normalizeText(row.variedad)}`;

export const getAvailableVarietiesForCuartel = ({ selectedCuartel, budRows = [], prePruningRows = [] }) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  if (!normalizedSelectedCuartel) return [];

  const varieties = new Set();

  for (const row of [...budRows, ...prePruningRows]) {
    if (normalizeText(row.cuartel) !== normalizedSelectedCuartel) continue;
    const variedad = String(row.variedad ?? "").trim();
    if (!variedad) continue;
    varieties.add(variedad);
  }

  return [...varieties].sort((a, b) => a.localeCompare(b));
};

export const buildHistoricalProductionRows = ({
  selectedCuartel,
  budRows = [],
  prePruningRows = [],
  profiles = [],
  selectedYears = [],
}) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  if (!normalizedSelectedCuartel) return [];

  const selectedYearsSet = new Set(selectedYears);
  const shouldFilterByYear = selectedYearsSet.size > 0;
  const profileMap = resolveProfileMap(profiles);

  const budByKey = new Map();
  for (const row of budRows) {
    if (normalizeText(row.cuartel) !== normalizedSelectedCuartel) continue;
    if (shouldFilterByYear && !selectedYearsSet.has(row.year)) continue;
    budByKey.set(buildRowKey(row), row);
  }

  const preByKey = new Map();
  for (const row of prePruningRows) {
    if (normalizeText(row.cuartel) !== normalizedSelectedCuartel) continue;
    if (shouldFilterByYear && !selectedYearsSet.has(row.year)) continue;
    preByKey.set(buildRowKey(row), row);
  }

  const rows = [];

  for (const [key, preRow] of preByKey.entries()) {
    const budRow = budByKey.get(key);
    if (!budRow) continue;

    const year = preRow.year;
    const variedad = preRow.variedad;

    const profile = resolveProfile(profileMap, preRow.cuartel, variedad);

    const cuajaEsperada = pickSeriesValueForYear(profile?.cuajaEstimadaPct, year);
    const cuajaReal = pickSeriesValueForYear(profile?.cuajaRealPct, year);
    const calibreEsperado = pickSeriesValueForYear(profile?.calibreEstimado, year);
    const calibreReal = pickSeriesValueForYear(profile?.calibreReal, year);

    const baseArgs = {
      dardosPlanta: preRow.dardosPlanta,
      floresDardo: budRow.floresDardo,
      danoPercent: budRow.dano,
      plantasHaProductivas: preRow.plantasHaProductivas,
    };

    rows.push({
      year,
      variedad,
      cuajaEsperada: round(cuajaEsperada, 2),
      cuajaReal: round(cuajaReal, 2),
      calibreEsperado: round(calibreEsperado, 2),
      calibreReal: round(calibreReal, 2),
      produccionEsperadaKgHa: calculateProductionKgHa({ ...baseArgs, cuajaPercent: cuajaEsperada, calibreGr: calibreEsperado }),
      produccionRealKgHa: calculateProductionKgHa({ ...baseArgs, cuajaPercent: cuajaReal, calibreGr: calibreReal }),
    });
  }

  return rows.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return String(a.variedad ?? "").localeCompare(String(b.variedad ?? ""));
  });
};

export const buildDraftProductionRow = ({
  selectedCuartel,
  variedad,
  draftYear = 2026,
  budRows = [],
  prePruningRows = [],
  cuajaEsperada,
  calibreEsperado,
}) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  const normalizedVariedad = normalizeText(variedad);
  if (!normalizedSelectedCuartel || !normalizedVariedad) return null;

  const baseBudRows = budRows
    .filter(
      (row) =>
        normalizeText(row.cuartel) === normalizedSelectedCuartel &&
        normalizeText(row.variedad) === normalizedVariedad,
    )
    .sort((a, b) => b.year - a.year);

  const basePreRows = prePruningRows
    .filter(
      (row) =>
        normalizeText(row.cuartel) === normalizedSelectedCuartel &&
        normalizeText(row.variedad) === normalizedVariedad,
    )
    .sort((a, b) => b.year - a.year);

  const budBase = baseBudRows[0];
  const preBase = basePreRows[0];

  const produccionEsperadaKgHa =
    budBase && preBase
      ? calculateProductionKgHa({
          dardosPlanta: preBase.dardosPlanta,
          floresDardo: budBase.floresDardo,
          danoPercent: budBase.dano,
          plantasHaProductivas: preBase.plantasHaProductivas,
          cuajaPercent: cuajaEsperada,
          calibreGr: calibreEsperado,
        })
      : null;

  return {
    year: draftYear,
    variedad,
    cuajaEsperada: toPercent(cuajaEsperada),
    cuajaReal: null,
    calibreEsperado: toNumber(calibreEsperado),
    calibreReal: null,
    produccionEsperadaKgHa,
    produccionRealKgHa: null,
    isDraft: true,
  };
};

export const buildRegisteredProductionVisual = ({ draftRows = [] } = {}) => {
  const varietiesByName = draftRows.reduce((accumulator, row) => {
      const totalKgHa = toNumber(row?.produccionEsperadaKgHa);
      if (!Number.isFinite(totalKgHa) || totalKgHa <= 0) return accumulator;

      const variedad = String(row?.variedad ?? "").trim();
      if (!variedad) return accumulator;

      const current = accumulator.get(variedad);
      const nextTotalKgHa = round((current?.totalKgHa ?? 0) + totalKgHa, 2);

      accumulator.set(variedad, {
        variedad,
        totalKgHa: nextTotalKgHa,
        colors: current?.colors ?? buildVarietyColorPair(variedad),
      });

      return accumulator;
    }, new Map());

  const varieties = Array.from(varietiesByName.values());

  const totalKgHa = round(
    varieties.reduce((accumulator, current) => accumulator + (toNumber(current.totalKgHa) ?? 0), 0),
    2,
  );

  const segments = varieties.map((variety) => ({
    variedad: variety.variedad,
    kgHa: variety.totalKgHa,
    sharePercent: totalKgHa > 0 ? (variety.totalKgHa / totalKgHa) * 100 : 0,
    color: variety.colors.strong,
    textColor: variety.colors.text,
  }));

  return {
    totalKgHa,
    varietyCount: varieties.length,
    varieties,
    segments,
  };
};

export const normalizeRegisteredProductionVisual = (registeredProduction) => {
  const registeredRows = Array.isArray(registeredProduction?.rows) ? registeredProduction.rows : [];
  if (registeredRows.length > 0) {
    return buildRegisteredProductionVisual({ draftRows: registeredRows });
  }

  const rawSegments = Array.isArray(registeredProduction?.visual?.segments)
    ? registeredProduction.visual.segments
    : [];
  if (rawSegments.length === 0) {
    return registeredProduction?.visual ?? null;
  }

  const varietiesByName = rawSegments.reduce((accumulator, segment) => {
    const variedad = String(segment?.variedad ?? "").trim();
    const kgHa = toNumber(segment?.kgHa);
    if (!variedad || !Number.isFinite(kgHa) || kgHa <= 0) return accumulator;

    const current = accumulator.get(variedad);
      accumulator.set(variedad, {
        variedad,
        totalKgHa: round((current?.totalKgHa ?? 0) + kgHa, 2),
        colors: {
          strong: current?.colors?.strong ?? segment?.color ?? buildVarietyColorPair(variedad).strong,
          text: current?.colors?.text ?? segment?.textColor ?? buildVarietyColorPair(variedad).text,
        },
      });
    return accumulator;
  }, new Map());

  const varieties = Array.from(varietiesByName.values()).map((variety) => ({
    variedad: variety.variedad,
    totalKgHa: variety.totalKgHa,
    colors: { strong: variety.colors.strong },
  }));

  const totalKgHa = round(
    varieties.reduce((accumulator, current) => accumulator + (toNumber(current.totalKgHa) ?? 0), 0),
    2,
  );

  return {
    totalKgHa,
    varietyCount: varieties.length,
    varieties,
    segments: varieties.map((variety) => ({
      variedad: variety.variedad,
      kgHa: variety.totalKgHa,
      sharePercent: totalKgHa > 0 ? (variety.totalKgHa / totalKgHa) * 100 : 0,
      color: variety.colors.strong,
      textColor: variety.colors.text,
    })),
  };
};
