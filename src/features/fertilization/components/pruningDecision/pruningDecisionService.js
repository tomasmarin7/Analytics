import budAnalysisRows from "../../../../data/budAnalysisRows.json";
import prePruningCountRows from "../../../../data/prePruningCountRows.json";
import postPruningCountRows from "../../../../data/postPruningCountRows.json";
import fruitSetAndCaliberProfiles from "../../../../data/fruitSetAndCaliberProfiles.json";
import { mapBudRow } from "../../../../components/foliarAnalysis/budAnalysisConfig";
import { mapPrePruningCountRow } from "../../../../components/foliarAnalysis/prePruningCountConfig";

export const DRAFT_YEAR = 2026;
const SERIES_BASE_YEAR = 2017;
export const OBJECTIVE_FACTOR = 0.93;
export const EMPTY_DRAFT_VALUES = {
  produccionObjetivo: "",
};

const BUD_MAPPED_ROWS = budAnalysisRows.map(mapBudRow);
const PRE_PRUNING_MAPPED_ROWS = prePruningCountRows.map(mapPrePruningCountRow);
const POST_PRUNING_MAPPED_ROWS = postPruningCountRows.map(mapPrePruningCountRow);

export const normalizeText = (value) => String(value ?? "").trim().toUpperCase();
const buildRowKey = (row) => `${row.year ?? ""}::${normalizeText(row.variedad)}`;

export const toNumber = (value) => {
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

const buildDeterministicSpread = (value, min, max) => {
  const normalized = (hashText(value) % 1000) / 1000;
  return min + normalized * (max - min);
};

const pickSeriesValueForYear = (series, year) => {
  if (!Array.isArray(series) || series.length === 0 || !Number.isFinite(year)) return null;
  const offset = year - SERIES_BASE_YEAR;
  const index = ((offset % series.length) + series.length) % series.length;
  return toNumber(series[index]);
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

const resolveProfileMap = (profiles = []) => {
  const map = new Map();
  for (const profile of profiles) {
    map.set(`${normalizeText(profile.cuartel)}::${normalizeText(profile.variedad)}`, profile);
  }
  return map;
};

const resolveProfile = (profileMap, cuartel, variedad) => {
  const exact = `${normalizeText(cuartel)}::${normalizeText(variedad)}`;
  if (profileMap.has(exact)) return profileMap.get(exact);

  const fallback = `${normalizeText(cuartel)}::ALL`;
  if (profileMap.has(fallback)) return profileMap.get(fallback);

  return null;
};

export const formatCellValue = (value) => (value === null || value === undefined || value === "" ? "" : value);

export const buildHistoricalRows = ({ selectedCuartel, selectedYears = [] }) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  if (!normalizedSelectedCuartel) return [];

  const selectedYearSet = new Set((selectedYears ?? []).map((year) => Number(year)).filter(Number.isFinite));
  const shouldFilterByYear = selectedYearSet.size > 0;
  const profileMap = resolveProfileMap(fruitSetAndCaliberProfiles);

  const preRows = PRE_PRUNING_MAPPED_ROWS.filter((row) => normalizeText(row.cuartel) === normalizedSelectedCuartel);
  const postRows = POST_PRUNING_MAPPED_ROWS.filter((row) => normalizeText(row.cuartel) === normalizedSelectedCuartel);
  const budRows = BUD_MAPPED_ROWS.filter((row) => normalizeText(row.cuartel) === normalizedSelectedCuartel);

  const postByKey = new Map(postRows.map((row) => [buildRowKey(row), row]));
  const budByKey = new Map(budRows.map((row) => [buildRowKey(row), row]));
  const rows = [];

  for (const preRow of preRows) {
    const year = Number(preRow.year);
    if (!Number.isFinite(year) || year >= DRAFT_YEAR) continue;
    if (shouldFilterByYear && !selectedYearSet.has(year)) continue;

    const key = buildRowKey(preRow);
    const postRow = postByKey.get(key);
    const budRow = budByKey.get(key);
    if (!postRow || !budRow) continue;

    const profile = resolveProfile(profileMap, preRow.cuartel, preRow.variedad);
    const cuajaEstimada = pickSeriesValueForYear(profile?.cuajaEstimadaPct, year);
    const cuajaReal = pickSeriesValueForYear(profile?.cuajaRealPct, year);
    const calibreEstimado = pickSeriesValueForYear(profile?.calibreEstimado, year);
    const calibreReal = pickSeriesValueForYear(profile?.calibreReal, year);

    const produccionPosible = calculateProductionKgHa({
      dardosPlanta: preRow.dardosPlanta,
      floresDardo: budRow.floresDardo,
      danoPercent: budRow.dano,
      cuajaPercent: cuajaEstimada,
      plantasHaProductivas: preRow.plantasHaProductivas,
      calibreGr: calibreEstimado,
    });

    const produccionObjetivo = Number.isFinite(produccionPosible)
      ? round(produccionPosible * OBJECTIVE_FACTOR, 2)
      : null;

    const produccionReal = calculateProductionKgHa({
      dardosPlanta: postRow.dardosPlanta,
      floresDardo: budRow.floresDardo,
      danoPercent: budRow.dano,
      cuajaPercent: cuajaReal,
      plantasHaProductivas: postRow.plantasHaProductivas,
      calibreGr: calibreReal,
    });

    const preDardos = toNumber(preRow.dardosPlanta);
    const postDardos = toNumber(postRow.dardosPlanta);
    const dardosEliminar = Number.isFinite(preDardos) && Number.isFinite(postDardos)
      ? Math.max(0, preDardos - postDardos)
      : null;

    rows.push({
      year,
      variedad: preRow.variedad,
      cuajaEstimada: round(cuajaEstimada, 2),
      cuajaReal: round(cuajaReal, 2),
      produccionObjetivo,
      produccionReal: round(produccionReal, 2),
      dardosEliminar: round(dardosEliminar, 2),
    });
  }

  return rows.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return String(a.variedad ?? "").localeCompare(String(b.variedad ?? ""));
  });
};

export const buildDraftDardosEliminar = ({ preRow, budRow, registeredRow, productionObjectiveKgHa }) => {
  const targetProduction = toNumber(productionObjectiveKgHa);
  if (!Number.isFinite(targetProduction) || targetProduction <= 0) return null;

  const plantasHaProductivas = toNumber(preRow?.plantasHaProductivas);
  const pesoFruto = toNumber(registeredRow?.calibreEsperado);
  const floresDardo = toNumber(budRow?.floresDardo);
  const danoPercent = toPercent(budRow?.dano);
  const cuajaEstimadaPercent = toPercent(registeredRow?.cuajaEsperada);
  const dardosPlanta = toNumber(preRow?.dardosPlanta);

  if (
    !Number.isFinite(plantasHaProductivas) ||
    !Number.isFinite(pesoFruto) ||
    !Number.isFinite(floresDardo) ||
    !Number.isFinite(danoPercent) ||
    !Number.isFinite(cuajaEstimadaPercent) ||
    !Number.isFinite(dardosPlanta)
  ) {
    return null;
  }

  const frutosObjetivoPlanta = (targetProduction * 1000) / (plantasHaProductivas * pesoFruto);
  const frutosPorDardo = floresDardo * (1 - danoPercent / 100) * (cuajaEstimadaPercent / 100);
  if (!Number.isFinite(frutosObjetivoPlanta) || !Number.isFinite(frutosPorDardo) || frutosPorDardo <= 0) {
    return null;
  }

  const dardosMeta = frutosObjetivoPlanta / frutosPorDardo;
  const dardosEliminar = dardosPlanta - dardosMeta;

  return {
    dardosEliminar: round(dardosEliminar, 2),
  };
};

export const buildGeneratedPostPruningRows = ({ draftRows = [], draftByVariety = {} }) =>
  draftRows
    .map((row) => {
      const normalizedVariedad = normalizeText(row.variedad);
      const varietyDraft = draftByVariety[normalizedVariedad] ?? EMPTY_DRAFT_VALUES;
      const pruningMetrics = buildDraftDardosEliminar({
        preRow: row.preRow,
        budRow: row.budRow,
        registeredRow: row.registeredRow,
        productionObjectiveKgHa: varietyDraft.produccionObjetivo,
      });

      const preDardosPlanta = toNumber(row.preRow?.dardosPlanta);
      const dardosEliminar = toNumber(pruningMetrics?.dardosEliminar);
      if (!Number.isFinite(preDardosPlanta) || !Number.isFinite(dardosEliminar) || preDardosPlanta <= 0) {
        return null;
      }

      const targetRemainingDardos = Math.max(0, preDardosPlanta - dardosEliminar);
      const variationSeed = `${row.preRow?.year}-${row.preRow?.cuartel}-${row.variedad}`;
      const remainingFactor = buildDeterministicSpread(variationSeed, 0.96, 1.04);
      const productivePlantsFactor = buildDeterministicSpread(`${variationSeed}-productive`, 0.986, 0.998);
      const lateralFactor = buildDeterministicSpread(`${variationSeed}-lateral`, -0.018, 0.018);
      const ramillasFactor = buildDeterministicSpread(`${variationSeed}-ramillas`, -0.04, 0.04);
      const promRamillasFactor = buildDeterministicSpread(`${variationSeed}-prom-ramillas`, -0.04, 0.04);

      const postDardosPlanta = Math.min(preDardosPlanta, Math.max(0, targetRemainingDardos * remainingFactor));
      const dardosRatio = postDardosPlanta / preDardosPlanta;

      const prePlantasHaProductivas = toNumber(row.preRow?.plantasHaProductivas);
      const prePromDardosLateral = toNumber(row.preRow?.promDardosLateral);
      const preRamillasPlanta = toNumber(row.preRow?.ramillasPlanta);
      const prePromRamillasLateral = toNumber(row.preRow?.promRamillasLateral);

      return {
        year: Number(row.preRow?.year) || DRAFT_YEAR,
        temp: Number(row.preRow?.year) || DRAFT_YEAR,
        huerto: row.preRow?.huerto ?? "",
        cuartel: row.preRow?.cuartel ?? "",
        variedad: row.variedad,
        superficieCuartelHa: toNumber(row.preRow?.superficieCuartelHa),
        superficieVariedadHa: toNumber(row.preRow?.superficieVariedadHa),
        plantasHa: toNumber(row.preRow?.plantasHa),
        plantasHaProductivas: Number.isFinite(prePlantasHaProductivas)
          ? round(prePlantasHaProductivas * productivePlantsFactor, 0)
          : null,
        dardosPlanta: round(postDardosPlanta, 2),
        promDardosLateral: Number.isFinite(prePromDardosLateral)
          ? round(prePromDardosLateral * Math.max(0.8, Math.min(1, 0.76 + dardosRatio * 0.16 + lateralFactor)), 1)
          : null,
        ramillasPlanta: Number.isFinite(preRamillasPlanta)
          ? round(preRamillasPlanta * Math.max(0.34, Math.min(0.82, 0.3 + dardosRatio * 0.36 + ramillasFactor)), 0)
          : null,
        promRamillasLateral: Number.isFinite(prePromRamillasLateral)
          ? round(
              prePromRamillasLateral *
                Math.max(0.44, Math.min(0.9, 0.42 + dardosRatio * 0.3 + promRamillasFactor)),
              1,
            )
          : null,
      };
    })
    .filter(Boolean);

export const buildDraftRows = ({ selectedCuartel, registeredProductionForSelectedCuartel }) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  if (!normalizedSelectedCuartel) return [];

  const preRows = PRE_PRUNING_MAPPED_ROWS.filter(
    (row) => normalizeText(row.cuartel) === normalizedSelectedCuartel && Number(row.year) === DRAFT_YEAR,
  );
  const budByVariety = new Map(
    BUD_MAPPED_ROWS
      .filter((row) => normalizeText(row.cuartel) === normalizedSelectedCuartel && Number(row.year) === DRAFT_YEAR)
      .map((row) => [normalizeText(row.variedad), row]),
  );
  const registeredByVariety = new Map(
    (Array.isArray(registeredProductionForSelectedCuartel?.rows) ? registeredProductionForSelectedCuartel.rows : [])
      .map((row) => [normalizeText(row.variedad), row]),
  );

  return preRows
    .map((preRow) => {
      const normalizedVariedad = normalizeText(preRow.variedad);
      const budRow = budByVariety.get(normalizedVariedad);
      const registeredRow = registeredByVariety.get(normalizedVariedad);
      if (!budRow || !registeredRow) return null;

      return {
        year: DRAFT_YEAR,
        variedad: preRow.variedad,
        cuajaEstimada: toPercent(registeredRow.cuajaEsperada),
        produccionObjetivoDefault: toNumber(registeredRow.produccionEsperadaKgHa),
        preRow,
        budRow,
        registeredRow,
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(a.variedad ?? "").localeCompare(String(b.variedad ?? "")));
};
