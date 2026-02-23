import DayLines from "./DayLines";
import MonthLabels from "./MonthLabels";
import PeriodLayer from "./PeriodLayer";

const TimelineTrack = ({
  dayLines,
  lineVisualLevel,
  visibleDays,
  monthMarkers,
  visiblePeriods,
  isTodayVisible,
  todayLeftPercent,
}) => (
  <div className="lower-dots-bridge__inner">
    <span className="lower-dots-bridge__dot" aria-hidden="true" />

    <div className="lower-dots-bridge__track" aria-hidden="true">
      <PeriodLayer periods={visiblePeriods} />
      <DayLines
        dayLines={dayLines}
        lineVisualLevel={lineVisualLevel}
        visibleDays={visibleDays}
        isTodayVisible={isTodayVisible}
        todayLeftPercent={todayLeftPercent}
      />
      <MonthLabels markers={monthMarkers} />
    </div>

    <span className="lower-dots-bridge__dot" aria-hidden="true" />
  </div>
);

export default TimelineTrack;
