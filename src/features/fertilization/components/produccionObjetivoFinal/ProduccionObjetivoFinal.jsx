import { useEffect, useMemo } from "react";
import {
  buildVarietyColorPair,
  normalizeRegisteredProductionVisual,
  ProductionPotentialShapePreview,
} from "../../../productionPotential";
import { createDefaultPeriods } from "../../config/periods";
import {
  buildDraftRaleoRows,
  getDraftPostPruningRowsForCuartel,
  normalizeText,
  toNumber,
} from "../raleoDecision/raleoDecisionService";
import "./produccionObjetivoFinal.css";

const PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX = 425;
const DAY_MS = 86400000;
const RALEO_PERIOD_ID = "periodo-raleo";

const round = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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

const calculateFinalObjectiveKgHa = ({
  fruitsPerTreeAfterThinning,
  treesPerHa,
  calibreGr,
}) => {
  const parsedFruitsPerTreeAfterThinning = toNumber(fruitsPerTreeAfterThinning);
  const parsedTreesPerHa = toNumber(treesPerHa);
  const parsedCalibreGr = toNumber(calibreGr);

  if (
    !Number.isFinite(parsedFruitsPerTreeAfterThinning) ||
    !Number.isFinite(parsedTreesPerHa) ||
    !Number.isFinite(parsedCalibreGr)
  ) {
    return null;
  }

  return round((parsedFruitsPerTreeAfterThinning * parsedTreesPerHa * parsedCalibreGr) / 1000, 2);
};

const resolveGeometry = ({ viewStartMs, viewEndMs, viewSpanMs }) => {
  if (!Number.isFinite(viewStartMs) || !Number.isFinite(viewEndMs) || !Number.isFinite(viewSpanMs) || viewSpanMs <= 0) {
    return null;
  }

  const referenceYear = new Date(viewStartMs).getUTCFullYear();
  const raleoPeriod = createDefaultPeriods(referenceYear).find((period) => period.id === RALEO_PERIOD_ID);
  if (!raleoPeriod) return null;

  const viewportEndBoundaryMs = viewEndMs + DAY_MS;
  const startBoundaryMs = raleoPeriod.endMs + DAY_MS;
  const targetEndMs = Date.UTC(referenceYear, 10, 30) + DAY_MS;
  const clippedStartMs = Math.max(startBoundaryMs, viewStartMs);
  const clippedEndMs = Math.min(targetEndMs, viewportEndBoundaryMs);
  if (clippedEndMs <= clippedStartMs) {
    return null;
  }

  const startPercent = ((clippedStartMs - viewStartMs) / viewSpanMs) * 100;
  const endPercent = ((clippedEndMs - viewStartMs) / viewSpanMs) * 100;

  return {
    left: clamp(startPercent, 0, 100),
    width: clamp(endPercent, 0, 100) - clamp(startPercent, 0, 100),
  };
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

    const fruitsPerTreeAfterThinning = calculateFinalFruitPerTree({
      fruitsPerTree: row.frutosPorArbol,
      thinningFruitPerTree: row.raleoFrutosPorArbol,
    });
    if (!Number.isFinite(fruitsPerTreeAfterThinning)) {
      return accumulator;
    }

    const kgHa = calculateFinalObjectiveKgHa({
      fruitsPerTreeAfterThinning,
      treesPerHa: postPruningRow.plantasHaProductivas,
      calibreGr: productionRow.calibreEsperado,
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

const ProduccionObjetivoFinal = ({
  viewStartMs,
  viewEndMs,
  viewSpanMs,
  selectedCuartel,
  registeredProductionByCuartel = {},
  registeredPruningByCuartel = {},
  showLabels = true,
  onMetricsChange,
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

  useEffect(() => {
    onMetricsChange?.({
      heightPx: Number.isFinite(heightPx) ? heightPx : 0,
    });
  }, [heightPx, onMetricsChange]);

  if (!geometry || !visual?.segments?.length || !(heightPx > 0)) {
    return null;
  }

  const handleActivate = () => {
    onClick?.();
  };

  return (
    <button
      type="button"
      className="lower-dots-bridge__produccion-objetivo-final"
      style={{
        left: `${geometry.left}%`,
        width: `${geometry.width}%`,
        height: `${heightPx}px`,
      }}
      aria-label="Produccion objetivo final"
      title="Produccion objetivo final"
      onClick={handleActivate}
      onPointerDown={onPointerDown}
    >
      <ProductionPotentialShapePreview
        visual={visual}
        showLabels={showLabels}
        showBaseline={false}
        className="lower-dots-bridge__produccion-objetivo-final-shape"
      />
    </button>
  );
};

export default ProduccionObjetivoFinal;
