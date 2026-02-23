import RangeSlider from "./lowerDotsBridge/RangeSlider";
import TimelineTrack from "./lowerDotsBridge/TimelineTrack";
import { TIMELINE_ARIA_LABEL } from "./lowerDotsBridge/constants";
import { useTimelineController } from "./lowerDotsBridge/useTimelineController";

const LowerDotsBridge = () => {
  const {
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
  } = useTimelineController();

  return (
    <section className="lower-dots-bridge" aria-label={TIMELINE_ARIA_LABEL}>
      <TimelineTrack
        dayLines={dayLines}
        lineVisualLevel={lineVisualLevel}
        visibleDays={visibleDays}
        monthMarkers={monthMarkers}
        visiblePeriods={visiblePeriods}
        isTodayVisible={isTodayVisible}
        todayLeftPercent={todayLeftPercent}
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

export default LowerDotsBridge;
