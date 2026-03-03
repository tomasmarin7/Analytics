import { useEffect, useMemo } from "react";
import {
  buildVarietyColorPair,
  normalizeRegisteredProductionVisual,
  ProductionPotentialShapePreview,
} from "../../../productionPotential";
import { POST_PRUNING_COUNT_EVENT_ID } from "../../../timelineEvents";
import "./produccionPostPodaObjetivo.css";

const PRODUCTION_POTENTIAL_DARDO_PERIOD_ID = "periodo-produccion-posible-variedad-dardo";
const PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX = 425;
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

const resolveGeometry = ({ periods = [], timelineEvents = [] }) => {
  const dardoPeriod = periods.find((period) => period.id === PRODUCTION_POTENTIAL_DARDO_PERIOD_ID);
  const postPruningEvent = timelineEvents.find((event) => event.id === POST_PRUNING_COUNT_EVENT_ID);
  if (!dardoPeriod || !postPruningEvent) return null;

  const startPercent = Number(dardoPeriod.left) + Number(dardoPeriod.width);
  const endPercent = Number(postPruningEvent.leftPercent);
  if (!Number.isFinite(startPercent) || !Number.isFinite(endPercent) || endPercent <= startPercent) {
    return null;
  }

  return {
    left: Math.max(0, Math.min(100, startPercent)),
    width: Math.max(0, Math.min(100, endPercent) - Math.max(0, Math.min(100, startPercent))),
  };
};

const ProduccionPostPodaObjetivo = ({
  periods,
  timelineEvents,
  selectedCuartel,
  registeredProductionByCuartel = {},
  registeredPruningByCuartel = {},
  onMetricsChange,
}) => {
  const geometry = useMemo(
    () => resolveGeometry({ periods, timelineEvents }),
    [periods, timelineEvents],
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

  return (
    <span
      className="lower-dots-bridge__produccion-post-poda-objetivo"
      style={{
        left: `${geometry.left}%`,
        width: `${geometry.width}%`,
        height: `${heightPx}px`,
      }}
      aria-hidden="true"
    >
      <ProductionPotentialShapePreview
        visual={registeredPruningVisual}
        showLabels
        showBaseline={false}
        className="lower-dots-bridge__produccion-post-poda-objetivo-shape"
      />
    </span>
  );
};

export default ProduccionPostPodaObjetivo;
