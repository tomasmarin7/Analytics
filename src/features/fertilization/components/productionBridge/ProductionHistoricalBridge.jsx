import { useMemo } from "react";
import budAnalysisRows from "../../../../data/budAnalysisRows.json";
import prePruningCountRows from "../../../../data/prePruningCountRows.json";
import fruitSetAndCaliberProfiles from "../../../../data/fruitSetAndCaliberProfiles.json";
import { mapBudRow } from "../../../../components/foliarAnalysis/budAnalysisConfig";
import { mapPrePruningCountRow } from "../../../../components/foliarAnalysis/prePruningCountConfig";
import { POST_PRUNING_COUNT_EVENT_ID } from "../../../timelineEvents";
import "./productionBridge.css";

const PRODUCTION_POTENTIAL_DARDO_PERIOD_ID = "periodo-produccion-posible-variedad-dardo";
const PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX = 425;
const normalizeText = (value) => String(value ?? "").trim().toUpperCase();
const BUD_MAPPED_ROWS = budAnalysisRows.map(mapBudRow);
const PRE_PRUNING_MAPPED_ROWS = prePruningCountRows.map(mapPrePruningCountRow);
const SERIES_BASE_YEAR = 2017;

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

const pickSeriesValueForYear = (series, year) => {
  if (!Array.isArray(series) || series.length === 0 || !Number.isFinite(year)) return null;
  const offset = year - SERIES_BASE_YEAR;
  const normalizedIndex = ((offset % series.length) + series.length) % series.length;
  return toNumber(series[normalizedIndex]);
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
  const kgHa = (frutosPlanta * parsedPlantasHaProductivas * parsedCalibreGr) / 1000;
  return Number.isFinite(kgHa) ? kgHa : null;
};

const buildRowKey = (row) => `${row.year ?? ""}::${normalizeText(row.variedad)}`;

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

const formatKgHa = (value) =>
  new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const ProductionHistoricalBridge = ({
  periods,
  timelineEvents,
  selectedCuartel,
  selectedYears,
  currentDate,
  registeredProductionByCuartel,
  showProductionPotentialTitle = true,
  showProductionPotentialValue = true,
}) => {
  const safeCurrentDate =
    currentDate instanceof Date && !Number.isNaN(currentDate.getTime()) ? currentDate : new Date();

  const referenceYear = useMemo(() => {
    const currentYear = safeCurrentDate.getFullYear();
    const candidates = (Array.isArray(selectedYears) ? selectedYears : [])
      .map((year) => Number(year))
      .filter((year) => Number.isFinite(year) && year < currentYear)
      .sort((a, b) => b - a);
    return candidates[0] ?? null;
  }, [safeCurrentDate, selectedYears]);

  const bridgeGeometry = useMemo(() => {
    const dardoPeriod = periods.find((period) => period.id === PRODUCTION_POTENTIAL_DARDO_PERIOD_ID);
    const postPruningEvent = timelineEvents.find((event) => event.id === POST_PRUNING_COUNT_EVENT_ID);
    if (!dardoPeriod || !postPruningEvent) return null;

    const startPercent = Number(dardoPeriod.left) + Number(dardoPeriod.width);
    const endPercent = Number(postPruningEvent.leftPercent);
    if (!Number.isFinite(startPercent) || !Number.isFinite(endPercent)) return null;

    const clampedStart = Math.max(0, Math.min(100, startPercent));
    const clampedEnd = Math.max(0, Math.min(100, endPercent));
    const width = clampedEnd - clampedStart;
    if (width <= 0.05) return null;

    return { left: clampedStart, width };
  }, [periods, timelineEvents]);

  const bridgeData = useMemo(() => {
    const normalizedSelectedCuartel = normalizeText(selectedCuartel);
    if (!normalizedSelectedCuartel || !Number.isFinite(referenceYear)) {
      return { heightPx: 0, kgHa: 0, year: null };
    }

    const currentYear = safeCurrentDate.getFullYear();
    const registeredCurrentTotal = Number(
      registeredProductionByCuartel[normalizedSelectedCuartel]?.visual?.totalKgHa,
    );
    const registeredRows = Array.isArray(registeredProductionByCuartel[normalizedSelectedCuartel]?.rows)
      ? registeredProductionByCuartel[normalizedSelectedCuartel].rows
      : [];
    const registeredByVariety = new Map(registeredRows.map((row) => [normalizeText(row?.variedad), row]));

    const profileMap = resolveProfileMap(fruitSetAndCaliberProfiles);

    const computePreTotalForYearUsingCurrentParams = (targetYear) => {
      const preRows = PRE_PRUNING_MAPPED_ROWS.filter(
        (row) => normalizeText(row.cuartel) === normalizedSelectedCuartel && row.year === targetYear,
      );
      const budByKey = new Map(
        BUD_MAPPED_ROWS
          .filter(
            (row) => normalizeText(row.cuartel) === normalizedSelectedCuartel && row.year === targetYear,
          )
          .map((row) => [buildRowKey(row), row]),
      );

      return preRows.reduce((total, preRow) => {
        const budRow = budByKey.get(buildRowKey(preRow));
        if (!budRow) return total;

        const registeredVarietyRow = registeredByVariety.get(normalizeText(preRow.variedad));
        const profile = resolveProfile(profileMap, preRow.cuartel, preRow.variedad);
        const cuajaPercent =
          toPercent(registeredVarietyRow?.cuajaEsperada) ??
          pickSeriesValueForYear(profile?.cuajaEstimadaPct, currentYear);
        const calibreGr =
          toNumber(registeredVarietyRow?.calibreEsperado) ??
          pickSeriesValueForYear(profile?.calibreEstimado, currentYear);

        const kgHa = calculateProductionKgHa({
          dardosPlanta: preRow.dardosPlanta,
          floresDardo: budRow.floresDardo,
          danoPercent: budRow.dano,
          cuajaPercent,
          plantasHaProductivas: preRow.plantasHaProductivas,
          calibreGr,
        });
        return total + (Number(kgHa) || 0);
      }, 0);
    };

    const fallbackCurrentPre = computePreTotalForYearUsingCurrentParams(currentYear);
    const grayBlockKgHa =
      Number.isFinite(registeredCurrentTotal) && registeredCurrentTotal > 0
        ? registeredCurrentTotal
        : fallbackCurrentPre;
    if (!(grayBlockKgHa > 0)) return { heightPx: 0, kgHa: 0, year: referenceYear };

    const preReferenceUsingCurrentParams = computePreTotalForYearUsingCurrentParams(referenceYear);
    if (!(preReferenceUsingCurrentParams > 0)) {
      return { heightPx: 0, kgHa: 0, year: referenceYear };
    }

    return {
      heightPx: (preReferenceUsingCurrentParams / grayBlockKgHa) * PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX,
      kgHa: preReferenceUsingCurrentParams,
      year: referenceYear,
    };
  }, [referenceYear, registeredProductionByCuartel, safeCurrentDate, selectedCuartel]);

  if (!bridgeGeometry || bridgeData.year === null) return null;

  return (
    <span
      className="lower-dots-bridge__production-bridge"
      style={{
        left: `${bridgeGeometry.left}%`,
        width: `${bridgeGeometry.width}%`,
        height: `${bridgeData.heightPx}px`,
      }}
      aria-hidden="true"
    >
      {bridgeData.kgHa > 0 ? (
        <span className="lower-dots-bridge__production-bridge-content">
          <span
            className={`lower-dots-bridge__production-bridge-title${
              showProductionPotentialTitle ? "" : " lower-dots-bridge__production-bridge-title--hidden"
            }`}
          >
            {bridgeData.year}
          </span>
          <span
            className={`lower-dots-bridge__production-bridge-value${
              showProductionPotentialValue ? "" : " lower-dots-bridge__production-bridge-value--hidden"
            }`}
          >
            {formatKgHa(bridgeData.kgHa)} kg/ha
          </span>
        </span>
      ) : null}
    </span>
  );
};

export default ProductionHistoricalBridge;
