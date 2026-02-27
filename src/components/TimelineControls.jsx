import { TIMELINE_ARIA_LABEL } from "./timeline/constants";
import RangeSlider from "./rangeSlider/RangeSlider";
import TimelineTrack from "./timeline/TimelineTrack";
import { useTimelineController } from "./timeline/useTimelineController";
import { useFertilizationInteraction } from "../features/fertilization";

const MAX_VISIBLE_DAYS_FOR_FERTILIZATION_TITLE = 183;
const MAX_VISIBLE_DAYS_FOR_PRODUCTION_POTENTIAL_TITLE = 92;
const MAX_VISIBLE_DAYS_FOR_PRODUCTION_POTENTIAL_VALUE = 76;

const TimelineControls = ({
  activeEventIds,
  onTimelineEventToggle,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
  currentDate,
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
  } = useTimelineController({ currentDate });

  const {
    raisedPeriodId,
    handleFertilizationClick,
    handleStartDrag,
    handleHandleKeyDown,
    handleBandDoubleClick,
  } = useFertilizationInteraction({
    viewStartMs,
    viewEndMs,
    yearStartMs,
    yearEndMs,
    setVisibleRangeByDates,
    startDrag,
    onHandleKeyDown,
  });

  const showFertilizationTitle = visibleDays <= MAX_VISIBLE_DAYS_FOR_FERTILIZATION_TITLE;
  const showProductionPotentialTitle = visibleDays <= MAX_VISIBLE_DAYS_FOR_PRODUCTION_POTENTIAL_TITLE;
  const showProductionPotentialValue = visibleDays <= MAX_VISIBLE_DAYS_FOR_PRODUCTION_POTENTIAL_VALUE;

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
        showFertilizationTitle={showFertilizationTitle}
        showProductionPotentialTitle={showProductionPotentialTitle}
        showProductionPotentialValue={showProductionPotentialValue}
        currentDate={currentDate}
      />

      <RangeSlider
        sliderRef={sliderRef}
        leftHandleExpr={leftHandleExpr}
        rightHandleExpr={rightHandleExpr}
        startDrag={handleStartDrag}
        onHandleKeyDown={handleHandleKeyDown}
        onBandDoubleClick={handleBandDoubleClick}
      />
    </section>
  );
};

export default TimelineControls;
