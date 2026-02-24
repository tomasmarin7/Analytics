import { TIMELINE_ARIA_LABEL } from "./timeline/constants";
import RangeSlider from "./rangeSlider/RangeSlider";
import TimelineTrack from "./timeline/TimelineTrack";
import { useTimelineController } from "./timeline/useTimelineController";

const TimelineControls = () => {
  const {
    sliderRef,
    dayLines,
    lineVisualLevel,
    monthMarkers,
    visiblePeriods,
    isTodayVisible,
    todayLeftPercent,
    isJanuaryMarkerVisible,
    januaryMarkerLeftPercent,
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

    setVisibleRangeByDates({
      startMs: period?.focusStartMs ?? defaultStartMs,
      endMs: period?.focusEndMs ?? defaultEndMs,
      animate: true,
    });
  };

  const handleJanuaryMarkerClick = () => {
    // Placeholder for future CSV/DB-driven action tied to this timeline event.
    console.log("Análisis Foliar");
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
        isJanuaryMarkerVisible={isJanuaryMarkerVisible}
        januaryMarkerLeftPercent={januaryMarkerLeftPercent}
        onJanuaryMarkerClick={handleJanuaryMarkerClick}
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
