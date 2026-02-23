const TodayMarker = ({ leftPercent }) => (
  <>
    <span className="lower-dots-bridge__today-stem" style={{ left: `${leftPercent}%` }} />
    <span className="lower-dots-bridge__today-dot" style={{ left: `${leftPercent}%` }} />
  </>
);

export default TodayMarker;
