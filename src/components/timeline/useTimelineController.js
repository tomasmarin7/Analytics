import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DAY_MS, HANDLE_EDGE_OFFSET_PX, MIN_VISIBLE_DAYS } from "./constants";
import { createDefaultPeriods } from "../decisionButtons/periods";
import {
  clamp,
  getDayLines,
  getLineVisualLevel,
  getMonthMarkers,
  getVisiblePeriods,
  getYearDomain,
} from "./timelineMath";

const DEFAULT_RATIOS = {
  leftRatio: 0,
  rightRatio: 1,
  minRangeRatio: 0,
  totalDays: 365,
};

export const useTimelineController = ({ periods } = {}) => {
  const sliderRef = useRef(null);
  const dragRef = useRef(null);
  const ratiosRef = useRef(DEFAULT_RATIOS);

  const now = new Date();
  const year = now.getFullYear();
  const todayMs = Date.UTC(year, now.getMonth(), now.getDate());

  const { yearStartMs, yearEndMs, totalDays } = useMemo(() => getYearDomain(year), [year]);

  const [leftRatio, setLeftRatio] = useState(0);
  const [rightRatio, setRightRatio] = useState(1);

  const minRangeRatio = useMemo(() => {
    if (totalDays <= 1) return 1;
    return (MIN_VISIBLE_DAYS - 1) / (totalDays - 1);
  }, [totalDays]);

  useEffect(() => {
    ratiosRef.current = { leftRatio, rightRatio, minRangeRatio, totalDays };
  }, [leftRatio, rightRatio, minRangeRatio, totalDays]);

  const viewStartMs = yearStartMs + leftRatio * (yearEndMs - yearStartMs);
  const viewEndMs = yearStartMs + rightRatio * (yearEndMs - yearStartMs);
  const viewSpanMs = viewEndMs - viewStartMs + DAY_MS;

  const visibleDays = useMemo(
    () => Math.max(1, Math.round((viewEndMs - viewStartMs) / DAY_MS) + 1),
    [viewStartMs, viewEndMs],
  );

  const monthMarkers = useMemo(
    () => getMonthMarkers({ year, startMs: viewStartMs, endMs: viewEndMs }),
    [year, viewStartMs, viewEndMs],
  );

  const periodItems = useMemo(() => periods ?? createDefaultPeriods(year), [periods, year]);

  const visiblePeriods = useMemo(
    () =>
      getVisiblePeriods({
        periods: periodItems,
        viewStartMs,
        viewEndMs,
        viewSpanMs,
      }),
    [periodItems, viewStartMs, viewEndMs, viewSpanMs],
  );

  const dayLines = useMemo(() => getDayLines({ visibleDays, viewStartMs }), [visibleDays, viewStartMs]);
  const lineVisualLevel = useMemo(
    () => getLineVisualLevel({ leftRatio, rightRatio, minRangeRatio }),
    [leftRatio, rightRatio, minRangeRatio],
  );

  const isTodayVisible = todayMs >= viewStartMs && todayMs <= viewEndMs;
  const todayLeftPercent = ((todayMs - viewStartMs) / viewSpanMs) * 100;

  const setRatios = useCallback((nextLeft, nextRight) => {
    const { minRangeRatio: minGap } = ratiosRef.current;
    const spread = nextRight - nextLeft;

    if (spread < minGap) return;

    const clampedLeft = clamp(nextLeft, 0, 1 - minGap);
    const clampedRight = clamp(nextRight, minGap, 1);

    if (clampedRight - clampedLeft < minGap) return;

    ratiosRef.current.leftRatio = clampedLeft;
    ratiosRef.current.rightRatio = clampedRight;

    setLeftRatio(clampedLeft);
    setRightRatio(clampedRight);
  }, []);

  const getRatioFromClientX = useCallback((clientX) => {
    const slider = sliderRef.current;
    if (!slider) return null;

    const rect = slider.getBoundingClientRect();
    const usableWidth = rect.width - HANDLE_EDGE_OFFSET_PX * 2;
    if (usableWidth <= 0) return null;

    const raw = (clientX - rect.left - HANDLE_EDGE_OFFSET_PX) / usableWidth;
    return clamp(raw, 0, 1);
  }, []);

  const onPointerMove = useCallback(
    (event) => {
      const drag = dragRef.current;
      if (!drag) return;

      const currentRatio = getRatioFromClientX(event.clientX);
      if (currentRatio === null) return;

      const {
        leftRatio: currentLeft,
        rightRatio: currentRight,
        minRangeRatio: minGap,
      } = ratiosRef.current;

      if (drag.mode === "left") {
        const nextLeft = clamp(currentRatio, 0, currentRight - minGap);
        setRatios(nextLeft, currentRight);
        return;
      }

      if (drag.mode === "right") {
        const nextRight = clamp(currentRatio, currentLeft + minGap, 1);
        setRatios(currentLeft, nextRight);
        return;
      }

      const spread = drag.startRight - drag.startLeft;
      const delta = currentRatio - drag.startRatio;
      const nextLeft = clamp(drag.startLeft + delta, 0, 1 - spread);
      setRatios(nextLeft, nextLeft + spread);
    },
    [getRatioFromClientX, setRatios],
  );

  const stopDrag = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopDrag);
  }, [onPointerMove]);

  useEffect(() => {
    return () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
    };
  }, [onPointerMove, stopDrag]);

  const startDrag =
    (mode) =>
    (event) => {
      event.preventDefault();

      const startRatio = getRatioFromClientX(event.clientX);
      if (startRatio === null) return;

      const { leftRatio: currentLeft, rightRatio: currentRight } = ratiosRef.current;

      dragRef.current = {
        mode,
        startRatio,
        startLeft: currentLeft,
        startRight: currentRight,
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopDrag);

      if (mode === "left") {
        const { minRangeRatio: minGap } = ratiosRef.current;
        setRatios(clamp(startRatio, 0, currentRight - minGap), currentRight);
        return;
      }

      if (mode === "right") {
        const { minRangeRatio: minGap } = ratiosRef.current;
        setRatios(currentLeft, clamp(startRatio, currentLeft + minGap, 1));
      }
    };

  const onHandleKeyDown =
    (handle) =>
    (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      event.preventDefault();

      const {
        leftRatio: currentLeft,
        rightRatio: currentRight,
        totalDays: days,
        minRangeRatio: minGap,
      } = ratiosRef.current;

      const dayRatio = 1 / (days - 1);
      const step = event.shiftKey ? dayRatio * 7 : dayRatio;
      const delta = event.key === "ArrowLeft" ? -step : step;

      if (handle === "left") {
        setRatios(clamp(currentLeft + delta, 0, currentRight - minGap), currentRight);
        return;
      }

      setRatios(currentLeft, clamp(currentRight + delta, currentLeft + minGap, 1));
    };

  const leftHandleExpr = `calc(${HANDLE_EDGE_OFFSET_PX}px + (100% - ${HANDLE_EDGE_OFFSET_PX * 2}px) * ${leftRatio})`;
  const rightHandleExpr = `calc(${HANDLE_EDGE_OFFSET_PX}px + (100% - ${HANDLE_EDGE_OFFSET_PX * 2}px) * ${rightRatio})`;

  return {
    sliderRef,
    dayLines,
    lineVisualLevel,
    monthMarkers,
    visiblePeriods,
    isTodayVisible,
    todayLeftPercent,
    leftHandleExpr,
    rightHandleExpr,
    visibleDays,
    startDrag,
    onHandleKeyDown,
  };
};
