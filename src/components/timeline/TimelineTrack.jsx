import DayLines from "./DayLines";
import MonthLabels from "./MonthLabels";
import { PeriodLayer } from "../../features/fertilization";
import "./Timeline.css";

const TimelineTrack = ({
  dayLines,
  lineVisualLevel,
  visibleDays,
  monthMarkers,
  visiblePeriods,
  onFertilizationClick,
  raisedPeriodId,
  isTodayVisible,
  todayLeftPercent,
  timelineEvents,
  activeEventId,
  onTimelineEventToggle,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
}) => (
  <div className="lower-dots-bridge__inner">
    <span className="lower-dots-bridge__dot" aria-hidden="true" />

    <div className="lower-dots-bridge__track" aria-hidden="true">
      <PeriodLayer
        periods={visiblePeriods}
        onFertilizationClick={onFertilizationClick}
        raisedPeriodId={raisedPeriodId}
        selectedHuerto={selectedHuerto}
        selectedCuartel={selectedCuartel}
        selectedYears={selectedYears}
      />
      <DayLines
        dayLines={dayLines}
        lineVisualLevel={lineVisualLevel}
        visibleDays={visibleDays}
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
      <MonthLabels markers={monthMarkers} />
    </div>

    <span className="lower-dots-bridge__dot" aria-hidden="true" />
  </div>
);

export default TimelineTrack;
