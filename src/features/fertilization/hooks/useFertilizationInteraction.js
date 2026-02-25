import { useCallback, useEffect, useRef, useState } from "react";
import { DAY_MS } from "../../../components/timeline/constants";
import { getFallbackFocusRange } from "../config/periods";

const ZOOM_ANIMATION_MS = 380;

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
  const animationTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (!animationTimeoutRef.current) return;
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    };
  }, []);

  const clearRaisedPeriod = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
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

      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }

      if (isFocusedOnPeriod) {
        setRaisedPeriodId(null);

        animationTimeoutRef.current = setTimeout(() => {
          setVisibleRangeByDates({
            startMs: yearStartMs,
            endMs: yearEndMs,
            animate: true,
          });
          animationTimeoutRef.current = null;
        }, ZOOM_ANIMATION_MS);
        return;
      }

      setVisibleRangeByDates({
        startMs: nextStartMs,
        endMs: nextEndMs,
        animate: true,
      });

      animationTimeoutRef.current = setTimeout(() => {
        setRaisedPeriodId(nextRaisedPeriodId);
        animationTimeoutRef.current = null;
      }, ZOOM_ANIMATION_MS);
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

  return {
    raisedPeriodId,
    handleFertilizationClick,
    handleStartDrag,
    handleHandleKeyDown,
  };
};
