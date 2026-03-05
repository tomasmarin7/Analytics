import { TIMELINE_ARIA_LABEL } from "./timeline/constants";
import TimelineTrack from "./timeline/TimelineTrack";
import { useTimelineController } from "./timeline/useTimelineController";

const TimelineControls = ({
  currentDate,
}) => {
  const {
    dayLines,
    lineVisualLevel,
    monthMarkers,
    isTodayVisible,
    todayLeftPercent,
    visibleDays,
  } = useTimelineController({ currentDate });

  return (
    <section className="lower-dots-bridge" aria-label={TIMELINE_ARIA_LABEL}>
      <TimelineTrack
        dayLines={dayLines}
        lineVisualLevel={lineVisualLevel}
        visibleDays={visibleDays}
        monthMarkers={monthMarkers}
        isTodayVisible={isTodayVisible}
        todayLeftPercent={todayLeftPercent}
      />
    </section>
  );
};

export default TimelineControls;
