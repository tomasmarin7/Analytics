import TodayMarker from "./TodayMarker";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DayLines = ({ dayLines, lineVisualLevel, visibleDays, isTodayVisible, todayLeftPercent }) => (
  <div
    className={`lower-dots-bridge__lines lower-dots-bridge__lines--${lineVisualLevel}`}
    style={{
      gridTemplateColumns: `repeat(${visibleDays}, minmax(0, 1fr))`,
    }}
  >
    {dayLines.map((line, index) => {
      const baseClass = `lower-dots-bridge__line${line.isMonthStart ? " lower-dots-bridge__line--month-start" : ""}`;

      if (!isTodayVisible || line.isMonthStart || visibleDays <= 1) {
        return <span key={line.id} className={baseClass} />;
      }

      const lineCenterPercent = ((index + 0.5) / visibleDays) * 100;
      const maxDistancePercent = 25;
      const distancePercent = Math.abs(lineCenterPercent - todayLeftPercent);
      const proximity = clamp(1 - distancePercent / maxDistancePercent, 0, 1);
      const exponentialWeight = (Math.exp(4 * proximity) - 1) / (Math.exp(4) - 1);
      const scaleY = 1 + exponentialWeight * 3.4;

      return <span key={line.id} className={baseClass} style={{ transform: `scaleY(${scaleY})` }} />;
    })}

    {isTodayVisible && <TodayMarker leftPercent={todayLeftPercent} />}
  </div>
);

export default DayLines;
