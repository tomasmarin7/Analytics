import { useCallback, useState } from "react";
import { DAY_MS } from "../../../components/timeline/constants";
import { PERIOD_PANEL_TYPES } from "../config/panelTypes";
import { createDefaultPeriods, getFallbackFocusRange } from "../config/periods";

export const useFertilizationInteraction = ({
  viewStartMs,
  viewEndMs,
  yearStartMs,
  yearEndMs,
  setVisibleRangeByDates,
  startDrag,
  onHandleKeyDown,
}) => {
  const [raisedPeriodId, setRaisedPeriodId] = useState(null);

  const clearRaisedPeriod = useCallback(() => {
    setRaisedPeriodId(null);
  }, []);

  const handleFertilizationClick = useCallback(
    (period) => {
      const fallbackYear = new Date(yearStartMs).getUTCFullYear();
      const fallbackRange = getFallbackFocusRange(fallbackYear);
      const defaultPeriods = createDefaultPeriods(fallbackYear);
      const productionPotentialDardoPeriod = defaultPeriods.find(
        (item) => item.panelType === PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL_VARIETY_DARDO,
      );
      const isPruningDecisionPeriod = period?.panelType === PERIOD_PANEL_TYPES.PRUNING_DECISION;
      const pruningCollapsedStartMs =
        productionPotentialDardoPeriod?.focusStartMs ?? fallbackRange.startMs;
      const pruningCollapsedEndMs =
        productionPotentialDardoPeriod?.focusEndMs ?? fallbackRange.endMs;
      const pruningStartMs = Date.UTC(fallbackYear, 5, 20);
      const pruningEndMs = Date.UTC(fallbackYear, 6, 15);
      const nextStartMs = isPruningDecisionPeriod
        ? pruningStartMs
        : period?.focusStartMs ?? fallbackRange.startMs;
      const nextEndMs = isPruningDecisionPeriod
        ? pruningEndMs
        : period?.focusEndMs ?? fallbackRange.endMs;

      const isFocusedOnPeriod =
        Math.abs(viewStartMs - nextStartMs) < DAY_MS && Math.abs(viewEndMs - nextEndMs) < DAY_MS;
      if (isFocusedOnPeriod) {
        setRaisedPeriodId(null);
        setVisibleRangeByDates({
          startMs: isPruningDecisionPeriod ? pruningCollapsedStartMs : yearStartMs,
          endMs: isPruningDecisionPeriod ? pruningCollapsedEndMs : yearEndMs,
          animate: true,
        });
        return;
      }

      setRaisedPeriodId(period?.id ?? null);
      setVisibleRangeByDates({
        startMs: nextStartMs,
        endMs: nextEndMs,
        animate: true,
      });
    },
    [setVisibleRangeByDates, viewEndMs, viewStartMs, yearEndMs, yearStartMs],
  );

  const handleStartDrag =
    (mode) =>
    (event) => {
      clearRaisedPeriod();
      startDrag(mode)(event);
    };

  const handleHandleKeyDown =
    (handle) =>
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        clearRaisedPeriod();
      }
      onHandleKeyDown(handle)(event);
    };

  const handleBandDoubleClick = useCallback(() => {
    clearRaisedPeriod();
    setVisibleRangeByDates({
      startMs: yearStartMs,
      endMs: yearEndMs,
      animate: true,
    });
  }, [clearRaisedPeriod, setVisibleRangeByDates, yearEndMs, yearStartMs]);

  return {
    raisedPeriodId,
    handleFertilizationClick,
    handleStartDrag,
    handleHandleKeyDown,
    handleBandDoubleClick,
  };
};
