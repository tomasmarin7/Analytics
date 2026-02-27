import { useCallback, useState } from "react";
import { DAY_MS } from "../../../components/timeline/constants";
import { getFallbackFocusRange } from "../config/periods";

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
      const fallbackYear = new Date().getFullYear();
      const fallbackRange = getFallbackFocusRange(fallbackYear);
      const nextStartMs = period?.focusStartMs ?? fallbackRange.startMs;
      const nextEndMs = period?.focusEndMs ?? fallbackRange.endMs;

      const isFocusedOnPeriod =
        Math.abs(viewStartMs - nextStartMs) < DAY_MS && Math.abs(viewEndMs - nextEndMs) < DAY_MS;

      const nextRaisedPeriodId = isFocusedOnPeriod ? null : period?.id ?? null;

      if (isFocusedOnPeriod) {
        setRaisedPeriodId(null);
        setVisibleRangeByDates({
          startMs: yearStartMs,
          endMs: yearEndMs,
          animate: true,
        });
        return;
      }

      setRaisedPeriodId(nextRaisedPeriodId);
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
