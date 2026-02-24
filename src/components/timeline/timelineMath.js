import { DAY_MS, MONTH_NAMES } from "./constants";

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const toRatio = (value, min, max) => {
  if (max <= min) return 0;
  return (value - min) / (max - min);
};

export const getYearDomain = (year) => {
  const yearStartMs = Date.UTC(year, 0, 1);
  const yearEndMs = Date.UTC(year + 1, 0, 1) - DAY_MS;
  const totalDays = Math.round((yearEndMs - yearStartMs) / DAY_MS) + 1;

  return { yearStartMs, yearEndMs, totalDays };
};

export const getMonthMarkers = ({ year, startMs, endMs }) => {
  const markers = [];
  const viewSpanMs = endMs - startMs + DAY_MS;

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const monthStartMs = Date.UTC(year, monthIndex, 1);
    if (monthStartMs < startMs || monthStartMs > endMs) continue;

    markers.push({
      id: monthIndex,
      label: MONTH_NAMES[monthIndex],
      ratio: clamp((monthStartMs - startMs + DAY_MS / 2) / viewSpanMs, 0, 1),
    });
  }

  return markers;
};

export const getVisiblePeriods = ({ periods, viewStartMs, viewEndMs, viewSpanMs }) =>
  periods
    .map((period) => {
      const clippedStartMs = Math.max(period.startMs, viewStartMs);
      const clippedEndMs = Math.min(period.endMs, viewEndMs);

      if (clippedEndMs < clippedStartMs) return null;

      const left = ((clippedStartMs - viewStartMs) / viewSpanMs) * 100;
      const right = ((clippedEndMs + DAY_MS - viewStartMs) / viewSpanMs) * 100;

      return {
        ...period,
        left: clamp(left, 0, 100),
        width: clamp(right - left, 0.7, 100),
      };
    })
    .filter(Boolean);

export const getDayLines = ({ visibleDays, viewStartMs }) =>
  Array.from({ length: visibleDays }, (_, index) => {
    const dayMs = viewStartMs + DAY_MS * index;
    return {
      id: `line-${index}`,
      isMonthStart: new Date(dayMs).getUTCDate() === 1,
    };
  });

export const getLineVisualLevel = ({ leftRatio, rightRatio, minRangeRatio }) => {
  const rangeRatio = rightRatio - leftRatio;
  const denominator = 1 - minRangeRatio;
  const normalizedZoom = denominator > 0 ? clamp((1 - rangeRatio) / denominator, 0, 1) : 0;

  if (normalizedZoom >= 0.8) return "high";
  if (normalizedZoom >= 0.5) return "mid";
  if (normalizedZoom >= 0.25) return "low";
  return "base";
};
