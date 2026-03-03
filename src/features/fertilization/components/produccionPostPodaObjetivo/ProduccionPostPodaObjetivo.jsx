import { useEffect, useMemo } from "react";
import {
  buildVarietyColorPair,
  normalizeRegisteredProductionVisual,
  ProductionPotentialShapePreview,
} from "../../../productionPotential";
import { createDefaultPeriods } from "../../config/periods";
import "./produccionPostPodaObjetivo.css";

const PRODUCTION_POTENTIAL_DARDO_PERIOD_ID = "periodo-produccion-posible-variedad-dardo";
const PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX = 425;
const DAY_MS = 86400000;
const POST_PRUNING_COUNT_MONTH_INDEX = 6;
const POST_PRUNING_COUNT_DAY = 15;
const normalizeText = (value) => String(value ?? "").trim().toUpperCase();

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const round = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const buildRegisteredPruningVisual = (registeredPruning) => {
  const rows = Array.isArray(registeredPruning?.rows) ? registeredPruning.rows : [];
  if (rows.length === 0) return null;

  const varietiesByName = rows.reduce((accumulator, row) => {
    const variedad = String(row?.variedad ?? "").trim();
    const kgHa = toNumber(row?.produccionObjetivo);
    if (!variedad || !Number.isFinite(kgHa) || kgHa <= 0) return accumulator;

    const current = accumulator.get(variedad);
    accumulator.set(variedad, {
      variedad,
      totalKgHa: round((current?.totalKgHa ?? 0) + kgHa, 2),
      colors: current?.colors ?? buildVarietyColorPair(variedad),
    });
    return accumulator;
  }, new Map());

  const varieties = Array.from(varietiesByName.values());
  const totalKgHa = round(
    varieties.reduce((accumulator, current) => accumulator + (toNumber(current.totalKgHa) ?? 0), 0),
    2,
  );
  if (!Number.isFinite(totalKgHa) || totalKgHa <= 0) return null;

  return {
    totalKgHa,
    segments: varieties.map((variety) => ({
      variedad: variety.variedad,
      kgHa: variety.totalKgHa,
      sharePercent: totalKgHa > 0 ? (variety.totalKgHa / totalKgHa) * 100 : 0,
      color: variety.colors.strong,
      textColor: variety.colors.text,
    })),
  };
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const resolveGeometry = ({ viewStartMs, viewEndMs, viewSpanMs }) => {
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
  const dardoRightBoundaryMs = dardoPeriod.endMs + DAY_MS;
  const postPruningCenterMs = Date.UTC(referenceYear, POST_PRUNING_COUNT_MONTH_INDEX, POST_PRUNING_COUNT_DAY) + (DAY_MS / 2);
  const clippedStartMs = Math.max(dardoRightBoundaryMs, viewStartMs);
  const clippedEndMs = Math.min(postPruningCenterMs, viewportEndBoundaryMs);
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

const ProduccionPostPodaObjetivo = ({
  periods,
  timelineEvents,
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
  const registeredProductionVisual = useMemo(
    () =>
      normalizedSelectedCuartel
        ? normalizeRegisteredProductionVisual(registeredProductionByCuartel[normalizedSelectedCuartel])
        : null,
    [normalizedSelectedCuartel, registeredProductionByCuartel],
  );
  const registeredPruningVisual = useMemo(
    () =>
      normalizedSelectedCuartel
        ? buildRegisteredPruningVisual(registeredPruningByCuartel[normalizedSelectedCuartel])
        : null,
    [normalizedSelectedCuartel, registeredPruningByCuartel],
  );

  const heightPx = useMemo(() => {
    const referenceTotalKgHa = Number(registeredProductionVisual?.totalKgHa);
    const pruningTotalKgHa = Number(registeredPruningVisual?.totalKgHa);

    if (
      !Number.isFinite(referenceTotalKgHa) ||
      referenceTotalKgHa <= 0 ||
      !Number.isFinite(pruningTotalKgHa) ||
      pruningTotalKgHa <= 0
    ) {
      return 0;
    }

    return (pruningTotalKgHa / referenceTotalKgHa) * PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX;
  }, [registeredProductionVisual, registeredPruningVisual]);

  useEffect(() => {
    if (!geometry) {
      onMetricsChange?.(null);
      return;
    }

    onMetricsChange?.({
      geometry,
      heightPx: Number.isFinite(heightPx) ? heightPx : 0,
    });
  }, [geometry, heightPx, onMetricsChange]);

  if (!geometry || !registeredPruningVisual?.segments?.length || !(heightPx > 0)) {
    return null;
  }

  const handleActivate = () => {
    onClick?.();
  };

  return (
    <button
      type="button"
      className="lower-dots-bridge__produccion-post-poda-objetivo"
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
        visual={registeredPruningVisual}
        showLabels={showLabels}
        showBaseline={false}
        className="lower-dots-bridge__produccion-post-poda-objetivo-shape"
      />
    </button>
  );
};

export default ProduccionPostPodaObjetivo;
