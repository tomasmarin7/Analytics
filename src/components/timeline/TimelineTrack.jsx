import { useState } from "react";
import DayLines from "./DayLines";
import MonthLabels from "./MonthLabels";
import TodayMarker from "./TodayMarker";
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
  activeEventIds,
  onTimelineEventToggle,
  selectedHuerto,
  selectedCuartel,
  selectedYears,
  onSelectedYearsChange,
}) => {
  const [foregroundLayer, setForegroundLayer] = useState("data-records");
  const periodsZIndex = foregroundLayer === "fertilization" ? 4 : 1;
  const dataRecordsZIndex = foregroundLayer === "data-records" ? 4 : 2;

  return (
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
          zIndex={periodsZIndex}
          onRequestForeground={() => setForegroundLayer("fertilization")}
        />
        <DayLines
          dayLines={dayLines}
          lineVisualLevel={lineVisualLevel}
          visibleDays={visibleDays}
          isTodayVisible={isTodayVisible}
          todayLeftPercent={todayLeftPercent}
          timelineEvents={timelineEvents}
          activeEventIds={activeEventIds}
          onTimelineEventToggle={onTimelineEventToggle}
          selectedHuerto={selectedHuerto}
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
          onSelectedYearsChange={onSelectedYearsChange}
          dataRecordsZIndex={dataRecordsZIndex}
          onRequestDataRecordsForeground={() => setForegroundLayer("data-records")}
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
