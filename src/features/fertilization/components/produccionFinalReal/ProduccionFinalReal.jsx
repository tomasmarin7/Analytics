import { useMemo } from "react";
import {
  buildVarietyColorPair,
  normalizeRegisteredProductionVisual,
  ProductionPotentialShapePreview,
} from "../../../productionPotential";
import {
  buildDraftRaleoRows,
  getDraftPostPruningRowsForCuartel,
  normalizeText,
  toNumber,
} from "../raleoDecision/raleoDecisionService";
import "./produccionFinalReal.css";

const PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX = 425;
const DAY_MS = 86400000;
const DECEMBER_MONTH_INDEX = 11;
const DECEMBER_LAST_DAY = 31;

const round = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const hashText = (value) => {
  const text = String(value ?? "").trim().toUpperCase();
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const buildDeterministicSpread = (seed, min, max) => {
  const normalized = (hashText(seed) % 1000) / 1000;
  return min + normalized * (max - min);
};

const calculateFinalFruitPerTree = ({
  fruitsPerTree,
  thinningFruitPerTree,
}) => {
  const parsedFruitsPerTree = toNumber(fruitsPerTree);
  const parsedThinningFruitPerTree = toNumber(thinningFruitPerTree);

  if (!Number.isFinite(parsedFruitsPerTree) || !Number.isFinite(parsedThinningFruitPerTree)) {
    return null;
  }

  return round(Math.max(0, parsedFruitsPerTree - parsedThinningFruitPerTree), 2);
};

const calculateProductionKgHa = ({
  fruitsPerTree,
  treesPerHa,
  calibreGr,
}) => {
  const parsedFruitsPerTree = toNumber(fruitsPerTree);
  const parsedTreesPerHa = toNumber(treesPerHa);
  const parsedCalibreGr = toNumber(calibreGr);

  if (
    !Number.isFinite(parsedFruitsPerTree) ||
    !Number.isFinite(parsedTreesPerHa) ||
    !Number.isFinite(parsedCalibreGr)
  ) {
    return null;
  }

  return round((parsedFruitsPerTree * parsedTreesPerHa * parsedCalibreGr) / 1000, 2);
};

const resolveGeometry = ({ viewStartMs, viewEndMs, viewSpanMs }) => {
  if (!Number.isFinite(viewStartMs) || !Number.isFinite(viewEndMs) || !Number.isFinite(viewSpanMs) || viewSpanMs <= 0) {
    return null;
  }

  const referenceYear = new Date(viewStartMs).getUTCFullYear();
  const viewportEndBoundaryMs = viewEndMs + DAY_MS;
  const decemberStartMs = Date.UTC(referenceYear, DECEMBER_MONTH_INDEX, 1);
  const decemberEndMs = Date.UTC(referenceYear, DECEMBER_MONTH_INDEX, DECEMBER_LAST_DAY) + DAY_MS;
  const clippedStartMs = Math.max(decemberStartMs, viewStartMs);
  const clippedEndMs = Math.min(decemberEndMs, viewportEndBoundaryMs);
  if (clippedEndMs <= clippedStartMs) {
    return null;
  }

  const startPercent = ((clippedStartMs - viewStartMs) / viewSpanMs) * 100;
  const endPercent = ((clippedEndMs - viewStartMs) / viewSpanMs) * 100;

  const left = clamp(startPercent, 0, 100);
  const width = clamp(endPercent, 0, 100) - left;
  if (width <= 0.05) {
    return null;
  }

  return { left, width };
};

const buildVisual = ({
  selectedCuartel,
  registeredProduction,
  registeredPruning,
}) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  if (!normalizedSelectedCuartel) return null;

  const draftRaleoRows = buildDraftRaleoRows({
    selectedCuartel,
    registeredProductionForSelectedCuartel: registeredProduction,
    registeredPruningForSelectedCuartel: registeredPruning,
  });
  if (draftRaleoRows.length === 0) return null;

  const productionRows = Array.isArray(registeredProduction?.rows) ? registeredProduction.rows : [];
  const draftPostPruningRows = getDraftPostPruningRowsForCuartel(selectedCuartel);
  const productionByVariety = new Map(
    productionRows.map((row) => [normalizeText(row?.variedad), row]),
  );
  const postPruningByVariety = new Map(
    draftPostPruningRows.map((row) => [normalizeText(row?.variedad), row]),
  );

  const varieties = draftRaleoRows.reduce((accumulator, row) => {
    const normalizedVariety = normalizeText(row?.variedad);
    const productionRow = productionByVariety.get(normalizedVariety);
    const postPruningRow = postPruningByVariety.get(normalizedVariety);
    if (!productionRow || !postPruningRow) return accumulator;

    const fruitsPerTreeBase = calculateFinalFruitPerTree({
      fruitsPerTree: row.frutosPorArbol,
      thinningFruitPerTree: row.raleoFrutosPorArbol,
    });
    if (!Number.isFinite(fruitsPerTreeBase) || fruitsPerTreeBase <= 0) {
      return accumulator;
    }

    const productiveTreesPerHa = toNumber(postPruningRow.plantasHaProductivas);
    const calibreEsperado = toNumber(productionRow.calibreEsperado);
    if (!Number.isFinite(productiveTreesPerHa) || !Number.isFinite(calibreEsperado)) {
      return accumulator;
    }

    const seedBase = `${normalizedSelectedCuartel}-${normalizedVariety}-${row.year}-produccion-final-real`;
    const fruitsPerTree = round(
      fruitsPerTreeBase * buildDeterministicSpread(`${seedBase}-carga`, 0.93, 1.04),
      2,
    );
    const treesPerHa = round(
      productiveTreesPerHa * buildDeterministicSpread(`${seedBase}-plantas`, 0.992, 1.006),
      0,
    );
    const calibreRealGr = round(
      calibreEsperado * buildDeterministicSpread(`${seedBase}-calibre`, 0.95, 1.07),
      2,
    );

    const kgHa = calculateProductionKgHa({
      fruitsPerTree,
      treesPerHa,
      calibreGr: calibreRealGr,
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

const ProduccionFinalReal = ({
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
  const registeredPruning = normalizedSelectedCuartel
    ? registeredPruningByCuartel[normalizedSelectedCuartel]
    : null;
  const normalizedProductionVisual = useMemo(
    () => normalizeRegisteredProductionVisual(registeredProduction),
    [registeredProduction],
  );
  const visual = useMemo(
    () =>
      buildVisual({
        selectedCuartel,
        registeredProduction,
        registeredPruning,
      }),
    [registeredProduction, registeredPruning, selectedCuartel],
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
      className="lower-dots-bridge__produccion-final-real"
      style={{
        left: `${geometry.left}%`,
        width: `${geometry.width}%`,
        height: `${heightPx}px`,
      }}
      aria-label="Produccion final real"
      title="Produccion final real"
      onClick={handleActivate}
      onPointerDown={onPointerDown}
    >
      <ProductionPotentialShapePreview
        visual={visual}
        showLabels={showLabels}
        showBaseline={false}
        className="lower-dots-bridge__produccion-final-real-shape"
      />
    </button>
  );
};

export default ProduccionFinalReal;
