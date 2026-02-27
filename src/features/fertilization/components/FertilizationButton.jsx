import { useEffect, useMemo, useRef, useState } from "react";
import fertilizationPlanRows from "../../../data/fertilizationPlanRows.json";
import { ProductionPotentialPeriodPanel, ProductionPotentialShapePreview } from "../../productionPotential";
import { PERIOD_PANEL_TYPES } from "../config/panelTypes";
import FertilizationPeriodPanel from "./FertilizationPeriodPanel";
import "../styles/FertilizationButton.css";

const TITLE_DOCK_ANIMATION_MS = 260;
const CLOSED_HEIGHT_PX = 46;
const MIN_RAISED_HEIGHT_PX = 200;
const PANEL_TOP_OFFSET_PX = 48;
const PANEL_BOTTOM_OFFSET_PX = 12;
const TABLE_HEADER_HEIGHT_PX = 38;
const TABLE_ROW_HEIGHT_PX = 36;
const ACTIONS_BLOCK_HEIGHT_PX = 56;
const PANEL_EXTRA_GAP_PX = 8;
const PRODUCTION_POTENTIAL_BLOCK_HEIGHT_PX = 425;
const PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX = PRODUCTION_POTENTIAL_BLOCK_HEIGHT_PX;
const PANEL_BASE_HEIGHT_BY_TYPE = {
  [PERIOD_PANEL_TYPES.FERTILIZATION]: null,
  [PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL]: PRODUCTION_POTENTIAL_BLOCK_HEIGHT_PX,
  [PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL_VARIETY_DARDO]: PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX,
};
const normalizeText = (value) => String(value ?? "").trim().toUpperCase();
const formatKgHa = (value) =>
  new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const FertilizationButton = ({
  period,
  onClick,
  isRaised = false,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  onRequestForeground,
  onRegisterProduction,
  registeredProductionByCuartel = {},
  showFertilizationTitle = true,
  showProductionPotentialTitle = true,
  showProductionPotentialValue = true,
}) => {
  const panelType = period?.panelType;
  const isFertilizationPeriod = panelType === PERIOD_PANEL_TYPES.FERTILIZATION;
  const isProductionPotentialPeriod = panelType === PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL;
  const isProductionPotentialDardoPeriod = panelType === PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL_VARIETY_DARDO;
  const [isTitleDocked, setIsTitleDocked] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const panelTimeoutRef = useRef(null);
  const frameRef = useRef(null);

  const normalizedSelectedCuartel = useMemo(
    () => normalizeText(selectedCuartel),
    [selectedCuartel],
  );
  const selectedYearSet = useMemo(() => new Set(selectedYears), [selectedYears]);

  const filteredRowsCount = useMemo(() => {
    if (!normalizedSelectedCuartel || selectedYearSet.size === 0) return 0;
    let count = 0;
    for (const row of fertilizationPlanRows) {
      const rowCuartel = String(row.cuartel ?? "").trim().toUpperCase();
      if (rowCuartel !== normalizedSelectedCuartel) continue;
      if (!selectedYearSet.has(Number(row.temp))) continue;
      count += 1;
    }
    return count;
  }, [normalizedSelectedCuartel, selectedYearSet]);

  const raisedHeight = useMemo(() => {
    const fixedHeight = PANEL_BASE_HEIGHT_BY_TYPE[panelType];
    if (fixedHeight) return fixedHeight;

    const visibleRows = Math.max(1, filteredRowsCount + 1);
    const tableHeight = TABLE_HEADER_HEIGHT_PX + visibleRows * TABLE_ROW_HEIGHT_PX;
    const panelContentHeight = tableHeight + ACTIONS_BLOCK_HEIGHT_PX + PANEL_EXTRA_GAP_PX;
    const calculatedHeight = PANEL_TOP_OFFSET_PX + PANEL_BOTTOM_OFFSET_PX + panelContentHeight;
    return Math.max(MIN_RAISED_HEIGHT_PX, calculatedHeight);
  }, [filteredRowsCount, panelType]);

  const slotGeometry = useMemo(
    () => ({
      left: Number(isRaised ? period?.raisedLeft ?? period?.left ?? 0 : period?.left ?? 0),
      width: Number(isRaised ? period?.raisedWidth ?? period?.width ?? 0 : period?.width ?? 0),
    }),
    [isRaised, period?.left, period?.raisedLeft, period?.raisedWidth, period?.width],
  );

  const registeredProductionForSelectedCuartel = normalizedSelectedCuartel
    ? registeredProductionByCuartel[normalizedSelectedCuartel]
    : null;
  const productionPotentialTotalKgHa = Number(registeredProductionForSelectedCuartel?.visual?.totalKgHa);
  const productionPotentialTotalLabel = Number.isFinite(productionPotentialTotalKgHa)
    ? `${formatKgHa(productionPotentialTotalKgHa)} kg/ha`
    : "-- kg/ha";
  const shouldShowTitle = isFertilizationPeriod
    ? showFertilizationTitle
    : isProductionPotentialPeriod
      ? showProductionPotentialTitle
      : true;

  useEffect(
    () => () => {
      if (panelTimeoutRef.current) clearTimeout(panelTimeoutRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  useEffect(() => {
    if (panelTimeoutRef.current) {
      clearTimeout(panelTimeoutRef.current);
      panelTimeoutRef.current = null;
    }
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (!isRaised) {
      setIsPanelVisible(false);
      setIsTitleDocked(false);
      return;
    }

    setIsPanelVisible(false);
    setIsTitleDocked(false);

    frameRef.current = requestAnimationFrame(() => {
      setIsTitleDocked(true);
      frameRef.current = null;
    });

    panelTimeoutRef.current = setTimeout(() => {
      setIsPanelVisible(true);
      panelTimeoutRef.current = null;
    }, TITLE_DOCK_ANIMATION_MS);
  }, [isRaised]);

  const renderPanelContent = () => {
    if (panelType === PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL) {
      return (
        <ProductionPotentialPeriodPanel
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
          onRegisterProduction={onRegisterProduction}
        />
      );
    }

    return (
      <FertilizationPeriodPanel
        selectedHuerto={selectedHuerto}
        selectedCuartel={selectedCuartel}
        selectedYears={selectedYears}
      />
    );
  };

  if (isProductionPotentialDardoPeriod) {
    return (
      <div
        className="lower-dots-bridge__fertilization-slot lower-dots-bridge__fertilization-slot--production-dardo"
        style={{
          left: `${slotGeometry.left}%`,
          width: `${slotGeometry.width}%`,
          "--fertilization-raised-height": `${PRODUCTION_POTENTIAL_DARDO_BLOCK_HEIGHT_PX}px`,
        }}
        aria-hidden="true"
      >
        <ProductionPotentialShapePreview
          visual={registeredProductionForSelectedCuartel?.visual}
          showLabels={showProductionPotentialTitle}
        />
      </div>
    );
  }

  return (
    <div
      className={`lower-dots-bridge__fertilization-slot ${
        isRaised ? "lower-dots-bridge__fertilization-slot--raised" : ""
      } ${isProductionPotentialPeriod ? "lower-dots-bridge__fertilization-slot--production-potential" : ""}`}
      style={{
        left: `${slotGeometry.left}%`,
        width: `${slotGeometry.width}%`,
        "--fertilization-raised-height": `${isRaised ? raisedHeight : CLOSED_HEIGHT_PX}px`,
      }}
      onPointerDown={onRequestForeground}
    >
      <button
        type="button"
        className={`lower-dots-bridge__fertilization-button ${
          isRaised ? "lower-dots-bridge__fertilization-button--raised" : ""
        } ${isProductionPotentialPeriod ? "lower-dots-bridge__fertilization-button--production-potential" : ""}`}
        title={period.label}
        aria-label={period.label}
        onClick={() => onClick?.(period)}
        onPointerDown={onRequestForeground}
      >
        <span className="lower-dots-bridge__fertilization-visual">
          <span
            className={`lower-dots-bridge__fertilization-title ${
              isTitleDocked ? "lower-dots-bridge__fertilization-title--docked" : ""
            } ${isProductionPotentialPeriod ? "lower-dots-bridge__fertilization-title--production-potential" : ""} ${
              shouldShowTitle ? "" : "lower-dots-bridge__fertilization-title--hidden"
            }`}
          >
            {isProductionPotentialPeriod ? (
              <>
                <span className="lower-dots-bridge__fertilization-title-main">{period.label}</span>
                <span
                  className={`lower-dots-bridge__fertilization-title-subtle ${
                    showProductionPotentialValue && !isRaised
                      ? ""
                      : "lower-dots-bridge__fertilization-title-subtle--hidden"
                  }`}
                >
                  {productionPotentialTotalLabel}
                </span>
              </>
            ) : (
              period.label
            )}
          </span>
          <span
            className={`lower-dots-bridge__fertilization-stain ${
              isProductionPotentialPeriod
                ? "lower-dots-bridge__fertilization-stain--production-potential"
                : "fx-grainy-green-surface"
            }`}
            aria-hidden="true"
          >
            <span className="lower-dots-bridge__fertilization-blur" />
          </span>
        </span>
      </button>

      {isRaised && isPanelVisible ? (
        <div
          className={`lower-dots-bridge__fertilization-panel ${
            isProductionPotentialPeriod ? "lower-dots-bridge__fertilization-panel--production-potential" : ""
          }`}
          onPointerDown={onRequestForeground}
        >
          {renderPanelContent()}
        </div>
      ) : null}
    </div>
  );
};

export default FertilizationButton;
