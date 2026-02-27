const SERIES_BASE_YEAR = 2017;
const VARIETY_HUES = [352, 9, 24, 340, 356, 16, 332, 40];

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

const resolveVarietyHue = (variedad) => VARIETY_HUES[hashText(variedad) % VARIETY_HUES.length];

const buildVarietyColorPair = (variedad) => {
  const hue = resolveVarietyHue(variedad);
  return {
    strong: `hsl(${hue} 66% 31%)`,
    soft: `hsl(${hue} 32% 63%)`,
  };
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

export const buildRegisteredProductionVisual = ({ draftRows = [], lateralShare = 0.35 } = {}) => {
  const normalizedLateralShare = Math.min(0.9, Math.max(0.1, toNumber(lateralShare) ?? 0.35));

  const varieties = draftRows
    .map((row) => {
      const totalKgHa = toNumber(row?.produccionEsperadaKgHa);
      if (!Number.isFinite(totalKgHa) || totalKgHa <= 0) return null;

      const variedad = String(row?.variedad ?? "").trim();
      if (!variedad) return null;

      const lateralKgHa = round(totalKgHa * normalizedLateralShare, 2);
      const plantaKgHa = round(totalKgHa - lateralKgHa, 2);
      const colors = buildVarietyColorPair(variedad);

      return {
        variedad,
        totalKgHa: round(totalKgHa, 2),
        lateralKgHa,
        plantaKgHa,
        colors,
      };
    })
    .filter(Boolean);

  const totalKgHa = round(
    varieties.reduce((accumulator, current) => accumulator + (toNumber(current.totalKgHa) ?? 0), 0),
    2,
  );

  const segments = varieties.flatMap((variety) => {
    const lateralSharePercent = totalKgHa > 0 ? (variety.lateralKgHa / totalKgHa) * 100 : 0;
    const plantaSharePercent = totalKgHa > 0 ? (variety.plantaKgHa / totalKgHa) * 100 : 0;

    return [
      {
        variedad: variety.variedad,
        part: "planta",
        kgHa: variety.plantaKgHa,
        sharePercent: plantaSharePercent,
        color: variety.colors.strong,
      },
      {
        variedad: variety.variedad,
        part: "laterales",
        kgHa: variety.lateralKgHa,
        sharePercent: lateralSharePercent,
        color: variety.colors.soft,
      },
    ];
  });

  return {
    totalKgHa,
    varietyCount: varieties.length,
    varieties,
    segments,
  };
};
