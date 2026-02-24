const MonthLabels = ({ markers }) => (
  <div className="lower-dots-bridge__months">
    {markers.map((marker) => (
      <span
        key={`month-${marker.id}`}
        className="lower-dots-bridge__month-label"
        style={{ left: `${marker.ratio * 100}%` }}
      >
        {marker.label}
      </span>
    ))}
  </div>
);

export default MonthLabels;
