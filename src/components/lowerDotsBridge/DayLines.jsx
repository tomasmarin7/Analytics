import TodayMarker from "./TodayMarker";

const DayLines = ({ dayLines, lineVisualLevel, visibleDays, isTodayVisible, todayLeftPercent }) => (
  <div
    className={`lower-dots-bridge__lines lower-dots-bridge__lines--${lineVisualLevel}`}
    style={{
      gridTemplateColumns: `repeat(${visibleDays}, minmax(0, 1fr))`,
    }}
  >
    {dayLines.map((line) => (
      <span
        key={line.id}
        className={`lower-dots-bridge__line${line.isMonthStart ? " lower-dots-bridge__line--month-start" : ""}`}
      />
    ))}

    {isTodayVisible && <TodayMarker leftPercent={todayLeftPercent} />}
  </div>
);

export default DayLines;
