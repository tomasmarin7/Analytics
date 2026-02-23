import { useRef, useState } from "react";

const LINES_COUNT = 363;
const DAYS_IN_YEAR = 365;
const HANDLE_MIN_GAP = 0.08;
const HANDLE_EDGE_OFFSET_PX = 5;
const HANDLE_MAX_SPREAD_EPSILON = 0.001;
const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MONTH_START_DAY_INDEXES = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

const getMonthStartLineMap = () => {
  const maxLineIndex = LINES_COUNT - 1;
  const maxDayIndex = DAYS_IN_YEAR - 1;
  const monthStartPairs = MONTH_START_DAY_INDEXES.map((dayIndex, monthIndex) => [
    Math.round((dayIndex / maxDayIndex) * maxLineIndex),
    MONTH_NAMES[monthIndex],
  ]);
  return new Map(monthStartPairs);
};

const monthStartLineMap = getMonthStartLineMap();
const monthMarkers = Array.from(monthStartLineMap.entries()).sort((a, b) => a[0] - b[0]);

const isLeapYear = (year) => {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
};

const getDayOfYearIndex = (date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diffMs = date - start;
  return Math.floor(diffMs / 86400000);
};

const getCurrentDateLineIndex = () => {
  const today = new Date();
  const totalDaysInYear = isLeapYear(today.getFullYear()) ? 366 : 365;
  const dayIndex = getDayOfYearIndex(today);
  const maxLineIndex = LINES_COUNT - 1;
  const maxDayIndex = totalDaysInYear - 1;
  return Math.round((dayIndex / maxDayIndex) * maxLineIndex);
};

const LowerDotsBridge = () => {
  const extraRef = useRef(null);
  const [leftHandlePos, setLeftHandlePos] = useState(0);
  const [rightHandlePos, setRightHandlePos] = useState(1);
  const currentDateLineIndex = getCurrentDateLineIndex();
  const currentDateLeftPercent = (currentDateLineIndex / (LINES_COUNT - 1)) * 100;
  const handleLeftExpr = `calc(${HANDLE_EDGE_OFFSET_PX}px + (100% - ${
    HANDLE_EDGE_OFFSET_PX * 2
  }px) * ${leftHandlePos})`;
  const handleRightExpr = `calc(${HANDLE_EDGE_OFFSET_PX}px + (100% - ${
    HANDLE_EDGE_OFFSET_PX * 2
  }px) * ${rightHandlePos})`;

  const moveHandle = (handle, clientX) => {
    const extra = extraRef.current;
    if (!extra) return;

    const rect = extra.getBoundingClientRect();
    const usableWidth = rect.width - HANDLE_EDGE_OFFSET_PX * 2;
    if (usableWidth <= 0) return;

    const raw = (clientX - rect.left - HANDLE_EDGE_OFFSET_PX) / usableWidth;
    const clamped = Math.max(0, Math.min(1, raw));

    if (handle === "left") {
      const next = Math.min(clamped, rightHandlePos - HANDLE_MIN_GAP);
      setLeftHandlePos(next);
      return;
    }

    const next = Math.max(clamped, leftHandlePos + HANDLE_MIN_GAP);
    setRightHandlePos(next);
  };

  const startHandleDrag = (handle) => (event) => {
    event.preventDefault();
    moveHandle(handle, event.clientX);

    const onMouseMove = (moveEvent) => moveHandle(handle, moveEvent.clientX);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startBandDrag = (event) => {
    event.preventDefault();

    const extra = extraRef.current;
    if (!extra) return;

    const rect = extra.getBoundingClientRect();
    const usableWidth = rect.width - HANDLE_EDGE_OFFSET_PX * 2;
    if (usableWidth <= 0) return;

    const startX = event.clientX;
    const startLeft = leftHandlePos;
    const startRight = rightHandlePos;
    const spread = startRight - startLeft;

    if (spread >= 1 - HANDLE_MAX_SPREAD_EPSILON) return;

    const onMouseMove = (moveEvent) => {
      const deltaPercent = (moveEvent.clientX - startX) / usableWidth;
      const minShift = -startLeft;
      const maxShift = 1 - startRight;
      const shift = Math.max(minShift, Math.min(maxShift, deltaPercent));
      setLeftHandlePos(startLeft + shift);
      setRightHandlePos(startRight + shift);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <section className="lower-dots-bridge" aria-label="Conector inferior">
      <div className="lower-dots-bridge__inner">
        <span className="lower-dots-bridge__dot" aria-hidden="true" />
        <div className="lower-dots-bridge__track" aria-hidden="true">
          <div className="lower-dots-bridge__lines">
            {Array.from({ length: LINES_COUNT }, (_, index) => {
              const monthName = monthStartLineMap.get(index);
              return (
                <span
                  key={index}
                  className={`lower-dots-bridge__line${
                    monthName ? " lower-dots-bridge__line--month-start" : ""
                  }`}
                />
              );
            })}
            <span
              className="lower-dots-bridge__today-stem"
              style={{ left: `${currentDateLeftPercent}%` }}
            />
            <span
              className="lower-dots-bridge__today-dot"
              style={{ left: `${currentDateLeftPercent}%` }}
            />
          </div>
          <div className="lower-dots-bridge__months">
            {monthMarkers.map(([lineIndex, monthName]) => (
              <span
                key={monthName}
                className="lower-dots-bridge__month-label"
                style={{ left: `${(lineIndex / (LINES_COUNT - 1)) * 100}%` }}
              >
                {monthName}
              </span>
            ))}
          </div>
        </div>
        <span className="lower-dots-bridge__dot" aria-hidden="true" />
      </div>
      <section className="lower-dots-bridge__extra" aria-hidden="true" ref={extraRef}>
        <span
          className="lower-dots-bridge__extra-band"
          style={{ left: handleLeftExpr, right: `calc(100% - ${handleRightExpr})` }}
          onMouseDown={startBandDrag}
        />
        <button
          type="button"
          className="lower-dots-bridge__extra-flag lower-dots-bridge__extra-flag--left"
          style={{ left: handleLeftExpr }}
          onMouseDown={startHandleDrag("left")}
          aria-label="Mover handle izquierdo"
        >
          <span className="lower-dots-bridge__extra-flag-stem" />
          <span className="lower-dots-bridge__extra-flag-head" />
        </button>
        <button
          type="button"
          className="lower-dots-bridge__extra-flag lower-dots-bridge__extra-flag--right"
          style={{ left: handleRightExpr }}
          onMouseDown={startHandleDrag("right")}
          aria-label="Mover handle derecho"
        >
          <span className="lower-dots-bridge__extra-flag-stem" />
          <span className="lower-dots-bridge__extra-flag-head" />
        </button>
      </section>
    </section>
  );
};

export default LowerDotsBridge;
