import budAnalysisRows from "../../../../data/budAnalysisRows.json";
import postPruningCountRows from "../../../../data/postPruningCountRows.json";
import fruitSetAndCaliberProfiles from "../../../../data/fruitSetAndCaliberProfiles.json";
import { mapBudRow } from "../../../../components/foliarAnalysis/budAnalysisConfig";
import { mapPrePruningCountRow } from "../../../../components/foliarAnalysis/prePruningCountConfig";

export const DRAFT_YEAR = 2026;
export const OBJECTIVE_FACTOR = 0.93;

const SERIES_BASE_YEAR = 2017;
const BUD_MAPPED_ROWS = budAnalysisRows.map(mapBudRow);
const POST_PRUNING_MAPPED_ROWS = postPruningCountRows.map(mapPrePruningCountRow);

export const normalizeText = (value) => String(value ?? "").trim().toUpperCase();

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

export const formatCellValue = (value) => (value === null || value === undefined || value === "" ? "" : value);

const buildRowKey = (row) => `${row.year ?? ""}::${normalizeText(row.variedad)}`;

const pickSeriesValueForYear = (series, year) => {
  if (!Array.isArray(series) || series.length === 0 || !Number.isFinite(year)) return null;
  const offset = year - SERIES_BASE_YEAR;
  const index = ((offset % series.length) + series.length) % series.length;
  return toNumber(series[index]);
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

const calculateFruitPerTree = ({ dardosPlanta, floresDardo, danoPercent, cuajaPercent }) => {
  const parsedDardosPlanta = toNumber(dardosPlanta);
  const parsedFloresDardo = toNumber(floresDardo);
  const parsedDanoPercent = toPercent(danoPercent);
  const parsedCuajaPercent = toPercent(cuajaPercent);

  if (
    !Number.isFinite(parsedDardosPlanta) ||
    !Number.isFinite(parsedFloresDardo) ||
    !Number.isFinite(parsedDanoPercent) ||
    !Number.isFinite(parsedCuajaPercent)
  ) {
    return null;
  }

  return round(
    parsedDardosPlanta * parsedFloresDardo * (1 - parsedDanoPercent / 100) * (parsedCuajaPercent / 100),
    2,
  );
};

const calculateObjectiveFruitPerTree = ({ productionObjectiveKgHa, plantasHaProductivas, calibreGr }) => {
  const parsedProductionObjectiveKgHa = toNumber(productionObjectiveKgHa);
  const parsedPlantasHaProductivas = toNumber(plantasHaProductivas);
  const parsedCalibreGr = toNumber(calibreGr);

  if (
    !Number.isFinite(parsedProductionObjectiveKgHa) ||
    !Number.isFinite(parsedPlantasHaProductivas) ||
    !Number.isFinite(parsedCalibreGr) ||
    parsedPlantasHaProductivas <= 0 ||
    parsedCalibreGr <= 0
  ) {
    return null;
  }

  return round((parsedProductionObjectiveKgHa * 1000) / (parsedPlantasHaProductivas * parsedCalibreGr), 2);
};

const calculateThinningFruitPerTree = ({ fruitPerTree, objectiveFruitPerTree }) => {
  const parsedFruitPerTree = toNumber(fruitPerTree);
  const parsedObjectiveFruitPerTree = toNumber(objectiveFruitPerTree);

  if (!Number.isFinite(parsedFruitPerTree) || !Number.isFinite(parsedObjectiveFruitPerTree)) return null;
  return round(Math.max(0, parsedFruitPerTree - parsedObjectiveFruitPerTree), 2);
};

const addPercentagePoints = (value, delta) => {
  const parsedValue = toNumber(value);
  if (!Number.isFinite(parsedValue)) return null;
  return round(parsedValue + delta, 2);
};

export const buildHistoricalRaleoRows = ({ selectedCuartel, selectedYears = [] }) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  if (!normalizedSelectedCuartel) return [];

  const selectedYearSet = new Set((selectedYears ?? []).map((year) => Number(year)).filter(Number.isFinite));
  const shouldFilterByYear = selectedYearSet.size > 0;
  const profileMap = resolveProfileMap(fruitSetAndCaliberProfiles);

  const postRows = POST_PRUNING_MAPPED_ROWS.filter((row) => normalizeText(row.cuartel) === normalizedSelectedCuartel);
  const budRows = BUD_MAPPED_ROWS.filter((row) => normalizeText(row.cuartel) === normalizedSelectedCuartel);
  const budByKey = new Map(budRows.map((row) => [buildRowKey(row), row]));
  const rows = [];

  for (const postRow of postRows) {
    const year = Number(postRow.year);
    if (!Number.isFinite(year) || year >= DRAFT_YEAR) continue;
    if (shouldFilterByYear && !selectedYearSet.has(year)) continue;

    const budRow = budByKey.get(buildRowKey(postRow));
    if (!budRow) continue;

    const profile = resolveProfile(profileMap, postRow.cuartel, postRow.variedad);
    const cuajaEstimada = round(pickSeriesValueForYear(profile?.cuajaEstimadaPct, year), 2);
    const cuajaReal = round(pickSeriesValueForYear(profile?.cuajaRealPct, year), 2);
    const frutosEstimadosPorArbol = calculateFruitPerTree({
      dardosPlanta: postRow.dardosPlanta,
      floresDardo: budRow.floresDardo,
      danoPercent: budRow.dano,
      cuajaPercent: cuajaEstimada,
    });
    const frutosPorArbol = calculateFruitPerTree({
      dardosPlanta: postRow.dardosPlanta,
      floresDardo: budRow.floresDardo,
      danoPercent: budRow.dano,
      cuajaPercent: cuajaReal,
    });
    const frutosObjetivoPorArbol = Number.isFinite(frutosEstimadosPorArbol)
      ? round(frutosEstimadosPorArbol * OBJECTIVE_FACTOR, 2)
      : null;

    rows.push({
      year,
      variedad: postRow.variedad,
      cuajaEstimada,
      cuajaReal,
      frutosPorArbol,
      frutosObjetivoPorArbol,
      raleoFrutosPorArbol: calculateThinningFruitPerTree({
        fruitPerTree: frutosPorArbol,
        objectiveFruitPerTree: frutosObjetivoPorArbol,
      }),
    });
  }

  return rows.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return String(a.variedad ?? "").localeCompare(String(b.variedad ?? ""));
  });
};

export const buildDraftRaleoRows = ({
  selectedCuartel,
  registeredProductionForSelectedCuartel,
  registeredPruningForSelectedCuartel,
}) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  if (!normalizedSelectedCuartel) return [];

  const registeredProductionRows = Array.isArray(registeredProductionForSelectedCuartel?.rows)
    ? registeredProductionForSelectedCuartel.rows
    : [];
  const registeredPruningRows = Array.isArray(registeredPruningForSelectedCuartel?.rows)
    ? registeredPruningForSelectedCuartel.rows
    : [];
  const generatedPostPruningRows = Array.isArray(registeredPruningForSelectedCuartel?.generatedPostPruningRows)
    ? registeredPruningForSelectedCuartel.generatedPostPruningRows
    : [];

  if (
    registeredProductionRows.length === 0 ||
    registeredPruningRows.length === 0 ||
    generatedPostPruningRows.length === 0
  ) {
    return [];
  }

  const budByVariety = new Map(
    BUD_MAPPED_ROWS
      .filter(
        (row) =>
          normalizeText(row.cuartel) === normalizedSelectedCuartel && Number(row.year) === DRAFT_YEAR,
      )
      .map((row) => [normalizeText(row.variedad), row]),
  );
  const productionByVariety = new Map(
    registeredProductionRows.map((row) => [normalizeText(row.variedad), row]),
  );
  const pruningByVariety = new Map(
    registeredPruningRows.map((row) => [normalizeText(row.variedad), row]),
  );

  return generatedPostPruningRows
    .map((postRow) => {
      const normalizedVariedad = normalizeText(postRow.variedad);
      const budRow = budByVariety.get(normalizedVariedad);
      const productionRow = productionByVariety.get(normalizedVariedad);
      const pruningRow = pruningByVariety.get(normalizedVariedad);
      if (!budRow || !productionRow || !pruningRow) return null;

      const cuajaEstimada = round(toPercent(productionRow.cuajaEsperada), 2);
      const cuajaReal = addPercentagePoints(cuajaEstimada, 5);
      const frutosPorArbol = calculateFruitPerTree({
        dardosPlanta: postRow.dardosPlanta,
        floresDardo: budRow.floresDardo,
        danoPercent: budRow.dano,
        cuajaPercent: cuajaReal,
      });
      const frutosObjetivoPorArbol =
        calculateObjectiveFruitPerTree({
          productionObjectiveKgHa: pruningRow.produccionObjetivo,
          plantasHaProductivas: postRow.plantasHaProductivas,
          calibreGr: productionRow.calibreEsperado,
        }) ??
        (Number.isFinite(frutosPorArbol) ? round(frutosPorArbol * OBJECTIVE_FACTOR, 2) : null);

      return {
        year: DRAFT_YEAR,
        variedad: postRow.variedad,
        cuajaEstimada,
        cuajaReal,
        frutosPorArbol,
        frutosObjetivoPorArbol,
        raleoFrutosPorArbol: calculateThinningFruitPerTree({
          fruitPerTree: frutosPorArbol,
          objectiveFruitPerTree: frutosObjetivoPorArbol,
        }),
        isDraft: true,
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(a.variedad ?? "").localeCompare(String(b.variedad ?? "")));
};
