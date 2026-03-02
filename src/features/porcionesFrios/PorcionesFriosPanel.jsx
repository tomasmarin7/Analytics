import { useMemo } from "react";
import { getColdPortionSeasonRecords } from "./porcionesFriosService";
import "./porcionesFriosPanel.css";

const CHART_WIDTH = 760;
const CHART_HEIGHT = 320;
const CHART_MARGIN = {
  top: 26,
  right: 18,
  bottom: 40,
  left: 64,
};
const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("es-CL", { month: "short", timeZone: "UTC" });
const DISPLAY_START_MONTH = 3;
const DISPLAY_START_DAY = 25;
const DISPLAY_END_MONTH = 7;
const DISPLAY_END_DAY = 5;
const BLUE_SCALE = ["#b9dce8", "#93c2d7", "#6d9fbe", "#486aaa", "#25389a"];

const roundValue = (value) => Math.round(value * 10) / 10;

const buildTickValues = (maxValue, tickCount = 4) => {
  const safeMax = Math.max(1, maxValue);
  const step = safeMax / tickCount;
  return Array.from({ length: tickCount + 1 }, (_, index) => roundValue(step * index));
};

const buildLinePath = (points) => {
  if (!Array.isArray(points) || points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  return points.reduce(
    (path, point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `${path} L ${point.x} ${point.y}`),
    "",
  );
};

const buildAreaPath = (points, baselineY) => {
  if (!Array.isArray(points) || points.length === 0) return "";
  const linePath = buildLinePath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  return `${linePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;
};

const formatMonthLabel = (dateMs) => {
  const raw = MONTH_LABEL_FORMATTER.format(new Date(dateMs)).replace(".", "");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const resolveSeriesYears = (selectedYears, currentYear) => {
  const candidates = (Array.isArray(selectedYears) ? selectedYears : [])
    .map((year) => Number(year))
    .filter((year) => Number.isFinite(year) && year <= currentYear)
    .sort((a, b) => a - b);

  return candidates.length ? [...new Set(candidates)] : [currentYear - 1, currentYear];
};

const getSeriesColor = (index, total) => {
  if (total <= 1) return BLUE_SCALE[BLUE_SCALE.length - 1];
  const ratio = index / (total - 1);
  const paletteIndex = Math.round(ratio * (BLUE_SCALE.length - 1));
  return BLUE_SCALE[paletteIndex];
};

const buildPlotPoint = ({
  accumulatedPortions,
  chartBottomY,
  dateMs,
  innerHeight,
  innerWidth,
  maxAccumulated,
  seasonEndMs,
  seasonStartMs,
}) => ({
  x: CHART_MARGIN.left + ((dateMs - seasonStartMs) / (seasonEndMs - seasonStartMs || 1)) * innerWidth,
  y: chartBottomY - (accumulatedPortions / maxAccumulated) * innerHeight,
  accumulatedPortions,
});

const buildMonthTicks = ({ currentYear, innerWidth, seasonEndMs, seasonStartMs }) => {
  const ticks = [
    {
      dateMs: seasonStartMs,
      x: CHART_MARGIN.left,
      label: formatMonthLabel(seasonStartMs),
    },
  ];

  for (let month = DISPLAY_START_MONTH; month <= DISPLAY_END_MONTH; month += 1) {
    const dateMs = Date.UTC(currentYear, month, 1);
    if (dateMs < seasonStartMs || dateMs > seasonEndMs) continue;

    ticks.push({
      dateMs,
      x: CHART_MARGIN.left + ((dateMs - seasonStartMs) / (seasonEndMs - seasonStartMs || 1)) * innerWidth,
      label: formatMonthLabel(dateMs),
    });
  }

  return ticks;
};

const PorcionesFriosPanel = ({ summary, selectedYears = [], currentDate }) => {
  const safeCurrentDate =
    currentDate instanceof Date && !Number.isNaN(currentDate.getTime()) ? currentDate : new Date();
  const currentYear = safeCurrentDate.getFullYear();
  const currentDateMs = Date.UTC(
    safeCurrentDate.getFullYear(),
    safeCurrentDate.getMonth(),
    safeCurrentDate.getDate(),
  );
  const seriesYears = useMemo(() => resolveSeriesYears(selectedYears, currentYear), [currentYear, selectedYears]);
  const seriesRecordsByYear = useMemo(
    () =>
      Object.fromEntries(
        seriesYears.map((year) => [
          year,
          year === currentYear && Array.isArray(summary?.dailyRecords) ? summary.dailyRecords : getColdPortionSeasonRecords(year),
        ]),
      ),
    [currentYear, seriesYears, summary?.dailyRecords],
  );

  const chartData = useMemo(() => {
    const seasonStartMs = Date.UTC(currentYear, DISPLAY_START_MONTH, DISPLAY_START_DAY);
    const seasonEndMs = Date.UTC(currentYear, DISPLAY_END_MONTH, DISPLAY_END_DAY);
    if (!seriesYears.length) return null;

    const innerWidth = CHART_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right;
    const innerHeight = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;
    const chartBottomY = CHART_MARGIN.top + innerHeight;
    const chartRightX = CHART_MARGIN.left + innerWidth;
    const cutoffMs = Math.max(seasonStartMs, Math.min(currentDateMs, seasonEndMs));

    const toProjectedDateMs = (record) => Date.UTC(currentYear, record.month - 1, record.day);
    const rawSeries = seriesYears.map((year, index) => {
      const rawRecords = Array.isArray(seriesRecordsByYear[year]) ? seriesRecordsByYear[year] : [];
      const visibleRecords =
        year === currentYear ? rawRecords.filter((record) => record.dateMs <= cutoffMs) : rawRecords;
      return {
        year,
        color: getSeriesColor(index, seriesYears.length),
        isCurrentYear: year === currentYear,
        records: visibleRecords,
        finalValue: visibleRecords[visibleRecords.length - 1]?.accumulatedPortions ?? 0,
      };
    });

    const maxAccumulated = Math.max(...rawSeries.map((item) => item.finalValue), 1);
    const paddedMaxAccumulated = Math.max(1, maxAccumulated * 1.08);
    const resolvedSeries = rawSeries.map((item, index) => {
      const points = [
        buildPlotPoint({
          accumulatedPortions: 0,
          chartBottomY,
          currentYear,
          dateMs: seasonStartMs,
          innerHeight,
          innerWidth,
          maxAccumulated: paddedMaxAccumulated,
          seasonEndMs,
          seasonStartMs,
        }),
        ...item.records.map((record) =>
          buildPlotPoint({
            accumulatedPortions: record.accumulatedPortions,
            chartBottomY,
            currentYear,
            dateMs: item.isCurrentYear ? record.dateMs : toProjectedDateMs(record),
            innerHeight,
            innerWidth,
            maxAccumulated: paddedMaxAccumulated,
            seasonEndMs,
            seasonStartMs,
          }),
        ),
      ];

      return {
        ...item,
        animationDelayMs: index * 80,
        points,
        linePath: buildLinePath(points),
        areaPath: item.isCurrentYear ? buildAreaPath(points, chartBottomY) : "",
      };
    });

    return {
      chartBottomY,
      chartRightX,
      maxAccumulated: paddedMaxAccumulated,
      monthTicks: buildMonthTicks({
        currentYear,
        innerWidth,
        seasonEndMs,
        seasonStartMs,
      }),
      series: resolvedSeries,
      yTicks: buildTickValues(paddedMaxAccumulated),
    };
  }, [currentDateMs, currentYear, seriesRecordsByYear, seriesYears]);

  if (!chartData) return null;

  return (
    <div className="porciones-frios-panel" aria-label="Grafico de porciones frío acumuladas">
      <div className="porciones-frios-panel__header">
        <div>
          <span className="porciones-frios-panel__eyebrow">Porciones frío</span>
          <h3 className="porciones-frios-panel__title">Acumuladas por temporada</h3>
        </div>
        <div className="porciones-frios-panel__legend">
          {chartData.series.map((series) => (
            <span key={`legend-${series.year}`} className="porciones-frios-panel__legend-item">
              <span className="porciones-frios-panel__legend-swatch" style={{ background: series.color }} />
              {series.year}
              {series.isCurrentYear ? " hasta hoy" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="porciones-frios-panel__metrics">
        {chartData.series.map((series) => (
          <div key={`metric-${series.year}`} className="porciones-frios-panel__metric">
            <span className="porciones-frios-panel__metric-label">{series.year}</span>
            <span
              className={`porciones-frios-panel__metric-value${
                series.isCurrentYear ? " porciones-frios-panel__metric-value--current" : ""
              }`}
              style={!series.isCurrentYear ? { color: series.color } : null}
            >
              {series.finalValue.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <svg
        className="porciones-frios-panel__chart"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label={`Grafico comparativo de porciones frío acumuladas para ${chartData.series
          .map((series) => series.year)
          .join(", ")}`}
      >
        <defs>
          <clipPath id="porciones-frios-panel-plot-clip">
            <rect
              x={CHART_MARGIN.left}
              y={CHART_MARGIN.top}
              width={chartData.chartRightX - CHART_MARGIN.left}
              height={chartData.chartBottomY - CHART_MARGIN.top}
            />
          </clipPath>
          <linearGradient id="porciones-frios-panel-current-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#25389a" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#25389a" stopOpacity="0.01" />
          </linearGradient>
          <filter id="porciones-frios-panel-line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {chartData.yTicks.map((tick) => {
          const y =
            chartData.chartBottomY -
            (tick / chartData.maxAccumulated) * (CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom);
          return (
            <g key={`y-tick-${tick}`} className="porciones-frios-panel__grid-row">
              <line x1={CHART_MARGIN.left} y1={y} x2={chartData.chartRightX} y2={y} />
              <text x={CHART_MARGIN.left - 12} y={y + 4} textAnchor="end">
                {tick.toFixed(tick % 1 === 0 ? 0 : 1)}
              </text>
            </g>
          );
        })}

        {chartData.monthTicks.map((tick) => (
          <g key={`x-tick-${tick.dateMs}`} className="porciones-frios-panel__grid-column">
            <line x1={tick.x} y1={CHART_MARGIN.top} x2={tick.x} y2={chartData.chartBottomY} />
            <text x={tick.x} y={CHART_HEIGHT - 8} textAnchor="middle">
              {tick.label}
            </text>
          </g>
        ))}

        <g clipPath="url(#porciones-frios-panel-plot-clip)">
          {chartData.series
            .filter((series) => series.isCurrentYear)
            .map((series) => (
              <path
                key={`area-${series.year}`}
                className="porciones-frios-panel__current-area"
                d={series.areaPath}
              />
            ))}

          {chartData.series.map((series) => (
            <path
              key={`line-${series.year}`}
              className="porciones-frios-panel__line"
              d={series.linePath}
              pathLength="1"
              stroke={series.color}
              filter={series.isCurrentYear ? "url(#porciones-frios-panel-line-glow)" : undefined}
              style={{ animationDelay: `${series.animationDelayMs}ms` }}
            />
          ))}

          {chartData.series.map((series) =>
            series.points.length > 1 ? (
              <circle
                key={`endpoint-${series.year}`}
                className={`porciones-frios-panel__endpoint${
                  series.isCurrentYear ? " porciones-frios-panel__endpoint--current" : ""
                }`}
                cx={series.points[series.points.length - 1].x}
                cy={series.points[series.points.length - 1].y}
                r="6.5"
                fill={series.color}
              />
            ) : null,
          )}
        </g>
      </svg>
    </div>
  );
};

export default PorcionesFriosPanel;
