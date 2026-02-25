import { TIMELINE_ARIA_LABEL } from "./timeline/constants";
import RangeSlider from "./rangeSlider/RangeSlider";
import TimelineTrack from "./timeline/TimelineTrack";
import { useTimelineController } from "./timeline/useTimelineController";
import { useFertilizationInteraction } from "../features/fertilization";

const TimelineControls = ({
  activeEventIds,
  onTimelineEventToggle,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
}) => {
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

  const {
    raisedPeriodId,
    handleFertilizationClick,
    handleStartDrag,
    handleHandleKeyDown,
  } = useFertilizationInteraction({
    viewStartMs,
    viewEndMs,
    yearStartMs,
    yearEndMs,
    setVisibleRangeByDates,
    startDrag,
    onHandleKeyDown,
  });

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
        activeEventIds={activeEventIds}
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
