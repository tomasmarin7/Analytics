const LINES_COUNT = 363;
const DAYS_IN_YEAR = 365;
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
  const currentDateLineIndex = getCurrentDateLineIndex();
  const currentDateLeftPercent = (currentDateLineIndex / (LINES_COUNT - 1)) * 100;

  return (
    <section className="lower-dots-bridge" aria-label="Conector inferior">
      <div className="lower-dots-bridge__inner">
        <span className="lower-dots-bridge__dot" aria-hidden="true" />
        <div className="lower-dots-bridge__lines" aria-hidden="true">
          {Array.from({ length: LINES_COUNT }, (_, index) => {
            const monthName = monthStartLineMap.get(index);
            return (
              <span
                key={index}
                className={`lower-dots-bridge__line${
                  monthName ? " lower-dots-bridge__line--month-start" : ""
                }`}
              >
                {monthName ? (
                  <span className="lower-dots-bridge__month-label">{monthName}</span>
                ) : null}
              </span>
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
        <span className="lower-dots-bridge__dot" aria-hidden="true" />
      </div>
    </section>
  );
};

export default LowerDotsBridge;
