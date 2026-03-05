import DayLines from "./DayLines";
import MonthLabels from "./MonthLabels";
import TodayMarker from "./TodayMarker";
import "./Timeline.css";

const TimelineTrack = ({
  dayLines,
  lineVisualLevel,
  visibleDays,
  monthMarkers,
  isTodayVisible,
  todayLeftPercent,
}) => {
  return (
    <div className="lower-dots-bridge__inner">
      <span className="lower-dots-bridge__dot" aria-hidden="true" />

      <div className="lower-dots-bridge__track" aria-hidden="true">
        <DayLines
          dayLines={dayLines}
          monthMarkers={monthMarkers}
          lineVisualLevel={lineVisualLevel}
          visibleDays={visibleDays}
          isTodayVisible={isTodayVisible}
          todayLeftPercent={todayLeftPercent}
        />
        <MonthLabels markers={monthMarkers} />
        {isTodayVisible ? (
          <div className="lower-dots-bridge__today-layer" aria-hidden="true">
            <TodayMarker leftPercent={todayLeftPercent} />
          </div>
        ) : null}
      </div>

      <span className="lower-dots-bridge__dot" aria-hidden="true" />
    </div>
  );
};

export default TimelineTrack;
