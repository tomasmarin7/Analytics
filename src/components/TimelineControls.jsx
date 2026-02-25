import { TIMELINE_ARIA_LABEL } from "./timeline/constants";
import { DAY_MS } from "./timeline/constants";
import { useCallback, useEffect, useRef, useState } from "react";
import RangeSlider from "./rangeSlider/RangeSlider";
import TimelineTrack from "./timeline/TimelineTrack";
import { useTimelineController } from "./timeline/useTimelineController";

const ZOOM_ANIMATION_MS = 380;

const TimelineControls = ({
  activeEventId,
  onTimelineEventToggle,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
}) => {
  const [raisedPeriodId, setRaisedPeriodId] = useState(null);
  const animationTimeoutRef = useRef(null);
  const {
    sliderRef,
    dayLines,
    lineVisualLevel,
    monthMarkers,
    visiblePeriods,
    timelineEvents,
    viewStartMs,
    viewEndMs,
    yearStartMs,
    yearEndMs,
    isTodayVisible,
    todayLeftPercent,
    leftHandleExpr,
    rightHandleExpr,
    visibleDays,
    startDrag,
    onHandleKeyDown,
    setVisibleRangeByDates,
  } = useTimelineController();

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

  const handleFertilizationClick = (period) => {
    const fallbackYear = new Date().getFullYear();
    const defaultStartMs = Date.UTC(fallbackYear, 0, 1);
    const defaultEndMs = Date.UTC(fallbackYear, 3, 1);
    const nextStartMs = period?.focusStartMs ?? defaultStartMs;
    const nextEndMs = period?.focusEndMs ?? defaultEndMs;

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
  };

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

  return (
    <section className="lower-dots-bridge" aria-label={TIMELINE_ARIA_LABEL}>
      <TimelineTrack
        dayLines={dayLines}
        lineVisualLevel={lineVisualLevel}
        visibleDays={visibleDays}
        monthMarkers={monthMarkers}
        visiblePeriods={visiblePeriods}
        onFertilizationClick={handleFertilizationClick}
        raisedPeriodId={raisedPeriodId}
        isTodayVisible={isTodayVisible}
        todayLeftPercent={todayLeftPercent}
        timelineEvents={timelineEvents}
        activeEventId={activeEventId}
        onTimelineEventToggle={onTimelineEventToggle}
        selectedHuerto={selectedHuerto}
        selectedCuartel={selectedCuartel}
        selectedYears={selectedYears}
        onSelectedYearsChange={onSelectedYearsChange}
      />

      <RangeSlider
        sliderRef={sliderRef}
        leftHandleExpr={leftHandleExpr}
        rightHandleExpr={rightHandleExpr}
        startDrag={handleStartDrag}
        onHandleKeyDown={handleHandleKeyDown}
      />
    </section>
  );
};

export default TimelineControls;
