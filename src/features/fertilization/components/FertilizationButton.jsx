import { useEffect, useMemo, useRef, useState } from "react";
import fertilizationPlanRows from "../../../data/fertilizationPlanRows.json";
import { ProductionPotentialPeriodPanel } from "../../productionPotential";
import { PERIOD_PANEL_TYPES } from "../config/panelTypes";
import FertilizationPeriodPanel from "./FertilizationPeriodPanel";
import "../styles/FertilizationButton.css";

const TITLE_DOCK_ANIMATION_MS = 260;
const CLOSED_HEIGHT_PX = 64;
const MIN_RAISED_HEIGHT_PX = 280;
const PANEL_TOP_OFFSET_PX = 70;
const PANEL_BOTTOM_OFFSET_PX = 16;
const TABLE_HEADER_HEIGHT_PX = 42;
const TABLE_ROW_HEIGHT_PX = 40;
const ACTIONS_BLOCK_HEIGHT_PX = 66;
const PANEL_EXTRA_GAP_PX = 12;
const PRODUCTION_POTENTIAL_BLOCK_HEIGHT_PX = 425;
const PANEL_BASE_HEIGHT_BY_TYPE = {
  [PERIOD_PANEL_TYPES.FERTILIZATION]: null,
  [PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL]: PRODUCTION_POTENTIAL_BLOCK_HEIGHT_PX,
};

const FertilizationButton = ({
  period,
  onClick,
  isRaised = false,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  onRequestForeground,
}) => {
  const panelType = period?.panelType;
  const isProductionPotentialPeriod = panelType === PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL;
  const [isTitleDocked, setIsTitleDocked] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const panelTimeoutRef = useRef(null);
  const frameRef = useRef(null);

  const normalizedSelectedCuartel = useMemo(
    () => String(selectedCuartel ?? "").trim().toUpperCase(),
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
      return <ProductionPotentialPeriodPanel selectedCuartel={selectedCuartel} selectedYears={selectedYears} />;
    }

    return (
      <FertilizationPeriodPanel
        selectedHuerto={selectedHuerto}
        selectedCuartel={selectedCuartel}
        selectedYears={selectedYears}
      />
    );
  };

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
            }`}
          >
            {period.label}
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
