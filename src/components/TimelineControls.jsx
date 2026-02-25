import { TIMELINE_ARIA_LABEL } from "./timeline/constants";
import { DAY_MS } from "./timeline/constants";
import RangeSlider from "./rangeSlider/RangeSlider";
import TimelineTrack from "./timeline/TimelineTrack";
import { useTimelineController } from "./timeline/useTimelineController";

const TimelineControls = ({ activeEventId, onTimelineEventToggle, selectedHuerto, selectedCuartel }) => {
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

  const handleFertilizationClick = (period) => {
    const fallbackYear = new Date().getFullYear();
    const defaultStartMs = Date.UTC(fallbackYear, 0, 1);
    const defaultEndMs = Date.UTC(fallbackYear, 3, 1);
    const nextStartMs = period?.focusStartMs ?? defaultStartMs;
    const nextEndMs = period?.focusEndMs ?? defaultEndMs;

    const isFocusedOnPeriod =
      Math.abs(viewStartMs - nextStartMs) < DAY_MS && Math.abs(viewEndMs - nextEndMs) < DAY_MS;

    setVisibleRangeByDates({
      startMs: isFocusedOnPeriod ? yearStartMs : nextStartMs,
      endMs: isFocusedOnPeriod ? yearEndMs : nextEndMs,
      animate: true,
    });
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
        isTodayVisible={isTodayVisible}
        todayLeftPercent={todayLeftPercent}
        timelineEvents={timelineEvents}
        activeEventId={activeEventId}
        onTimelineEventToggle={onTimelineEventToggle}
        selectedHuerto={selectedHuerto}
        selectedCuartel={selectedCuartel}
      />

      <RangeSlider
        sliderRef={sliderRef}
        leftHandleExpr={leftHandleExpr}
        rightHandleExpr={rightHandleExpr}
        startDrag={startDrag}
        onHandleKeyDown={onHandleKeyDown}
      />
    </section>
  );
};

export default TimelineControls;
