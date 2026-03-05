import { useMemo } from "react";
import budAnalysisRows from "../../../../data/budAnalysisRows.json";
import { mapBudRow } from "../../../../components/foliarAnalysis/budAnalysisConfig";
import {
  buildVarietyColorPair,
  normalizeRegisteredProductionVisual,
  ProductionPotentialShapePreview,
} from "../../../productionPotential";
import { createDefaultPeriods } from "../../config/periods";
import { getDraftPostPruningRowsForCuartel } from "../raleoDecision/raleoDecisionService";
import "./produccionPosibleConteoPostPoda.css";

const PRODUCTION_POTENTIAL_DARDO_PERIOD_ID = "periodo-produccion-posible-variedad-dardo";
const PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX = 425;
const DAY_MS = 86400000;
const POST_PRUNING_COUNT_MONTH_INDEX = 6;
const POST_PRUNING_COUNT_DAY = 15;
const POST_PRUNING_COUNT_END_MONTH_INDEX = 9;
const POST_PRUNING_COUNT_END_DAY = 25;
const BUD_MAPPED_ROWS = budAnalysisRows.map(mapBudRow);

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

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const resolveGeometry = ({
  viewStartMs,
  viewEndMs,
  viewSpanMs,
}) => {
  if (!Number.isFinite(viewStartMs) || !Number.isFinite(viewEndMs) || !Number.isFinite(viewSpanMs) || viewSpanMs <= 0) {
    return null;
  }

  const referenceYear = new Date(viewStartMs).getUTCFullYear();
  const dardoPeriod = createDefaultPeriods(referenceYear).find(
    (period) => period.id === PRODUCTION_POTENTIAL_DARDO_PERIOD_ID,
  );
  if (!dardoPeriod) {
    return null;
  }

  const viewportEndBoundaryMs = viewEndMs + DAY_MS;
  const postPruningCenterMs = Date.UTC(referenceYear, POST_PRUNING_COUNT_MONTH_INDEX, POST_PRUNING_COUNT_DAY) + (DAY_MS / 2);
  const targetEndMs = Date.UTC(
    referenceYear,
    POST_PRUNING_COUNT_END_MONTH_INDEX,
    POST_PRUNING_COUNT_END_DAY,
  ) + DAY_MS;
  const clippedStartMs = Math.max(postPruningCenterMs, viewStartMs);
  const clippedEndMs = Math.min(targetEndMs, viewportEndBoundaryMs);
  if (clippedEndMs <= clippedStartMs) {
    return null;
  }

  const start = clamp(((clippedStartMs - viewStartMs) / viewSpanMs) * 100, 0, 100);
  const end = clamp(((clippedEndMs - viewStartMs) / viewSpanMs) * 100, 0, 100);
  const width = end - start;
  if (width <= 0.05) return null;

  return { left: start, width };
};

const buildVisual = ({
  draftPostPruningRows = [],
  registeredProduction,
  selectedCuartel,
}) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  if (!normalizedSelectedCuartel || !Array.isArray(draftPostPruningRows) || draftPostPruningRows.length === 0) {
    return null;
  }

  const registeredRows = Array.isArray(registeredProduction?.rows) ? registeredProduction.rows : [];
  const registeredByVariety = new Map(
    registeredRows.map((row) => [normalizeText(row?.variedad), row]),
  );
  const budByVariety = new Map(
    BUD_MAPPED_ROWS
      .filter(
        (row) => normalizeText(row.cuartel) === normalizedSelectedCuartel,
      )
      .map((row) => [`${row.year}::${normalizeText(row.variedad)}`, row]),
  );

  const varieties = draftPostPruningRows.reduce((accumulator, row) => {
    if (normalizeText(row?.cuartel) !== normalizedSelectedCuartel) return accumulator;

    const varietyKey = normalizeText(row.variedad);
    const registeredRow = registeredByVariety.get(varietyKey);
    const budRow = budByVariety.get(`${row.year}::${varietyKey}`);
    const kgHa = calculateProductionKgHa({
      dardosPlanta: row.dardosPlanta,
      floresDardo: budRow?.floresDardo,
      danoPercent: budRow?.dano,
      cuajaPercent: registeredRow?.cuajaEsperada,
      plantasHaProductivas: row.plantasHaProductivas,
      calibreGr: registeredRow?.calibreEsperado,
    });
    if (!Number.isFinite(kgHa) || kgHa <= 0) return accumulator;

    const variedad = String(row.variedad ?? "").trim();
    const current = accumulator.get(variedad);
    accumulator.set(variedad, {
      variedad,
      totalKgHa: round((current?.totalKgHa ?? 0) + kgHa, 2),
      colors: current?.colors ?? buildVarietyColorPair(variedad),
    });
    return accumulator;
  }, new Map());

  const varietyList = Array.from(varieties.values());
  const totalKgHa = round(
    varietyList.reduce((accumulator, current) => accumulator + (toNumber(current.totalKgHa) ?? 0), 0),
    2,
  );
  if (!Number.isFinite(totalKgHa) || totalKgHa <= 0) return null;

  return {
    totalKgHa,
    segments: varietyList.map((variety) => ({
      variedad: variety.variedad,
      kgHa: variety.totalKgHa,
      sharePercent: totalKgHa > 0 ? (variety.totalKgHa / totalKgHa) * 100 : 0,
      color: variety.colors.strong,
      textColor: variety.colors.text,
    })),
  };
};

const ProduccionPosibleConteoPostPoda = ({
  viewStartMs,
  viewEndMs,
  viewSpanMs,
  selectedCuartel,
  registeredProductionByCuartel = {},
  registeredPruningByCuartel = {},
  showLabels = true,
  onClick,
  onPointerDown,
}) => {
  const geometry = useMemo(
    () => resolveGeometry({ viewStartMs, viewEndMs, viewSpanMs }),
    [viewEndMs, viewSpanMs, viewStartMs],
  );

  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  const registeredProduction = normalizedSelectedCuartel
    ? registeredProductionByCuartel[normalizedSelectedCuartel]
    : null;
  const draftPostPruningRows = useMemo(
    () => getDraftPostPruningRowsForCuartel(selectedCuartel),
    [selectedCuartel],
  );
  const normalizedProductionVisual = useMemo(
    () => normalizeRegisteredProductionVisual(registeredProduction),
    [registeredProduction],
  );

  const visual = useMemo(
    () =>
      buildVisual({
        draftPostPruningRows,
        registeredProduction,
        selectedCuartel,
      }),
    [draftPostPruningRows, registeredProduction, selectedCuartel],
  );

  const heightPx = useMemo(() => {
    const referenceTotalKgHa = Number(normalizedProductionVisual?.totalKgHa);
    const totalKgHa = Number(visual?.totalKgHa);
    if (
      !Number.isFinite(referenceTotalKgHa) ||
      referenceTotalKgHa <= 0 ||
      !Number.isFinite(totalKgHa) ||
      totalKgHa <= 0
    ) {
      return 0;
    }

    return (totalKgHa / referenceTotalKgHa) * PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX;
  }, [normalizedProductionVisual, visual]);

  if (!geometry || !visual?.segments?.length || !(heightPx > 0)) {
    return null;
  }

  const handleActivate = () => {
    onClick?.();
  };

  return (
    <button
      type="button"
      className="lower-dots-bridge__produccion-posible-conteo-post-poda"
      style={{
        left: `${geometry.left}%`,
        width: `${geometry.width}%`,
        height: `${heightPx}px`,
      }}
      aria-label="Zoom a produccion posible variedad dardo"
      title="Zoom a produccion posible variedad dardo"
      onClick={handleActivate}
      onPointerDown={onPointerDown}
    >
      <ProductionPotentialShapePreview
        visual={visual}
        showLabels={showLabels}
        showBaseline={false}
        className="lower-dots-bridge__produccion-posible-conteo-post-poda-shape"
      />
    </button>
  );
};

export default ProduccionPosibleConteoPostPoda;
