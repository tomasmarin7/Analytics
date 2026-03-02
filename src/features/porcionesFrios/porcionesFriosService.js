const PORCIONES_FRIOS_DAILY_RECORDS = [
  { date: "11-04", dailyPortions: 1.016 },
  { date: "14-04", dailyPortions: 0.1055 },
  { date: "15-04", dailyPortions: 1.007 },
  { date: "16-04", dailyPortions: 1.0085 },
  { date: "19-04", dailyPortions: 0.4963 },
  { date: "26-04", dailyPortions: 1.0143 },
  { date: "28-04", dailyPortions: 1.0098 },
  { date: "30-04", dailyPortions: 1.0108 },
  { date: "01-05", dailyPortions: 1.0177 },
  { date: "03-05", dailyPortions: 0.8667 },
  { date: "05-05", dailyPortions: 0.956 },
  { date: "06-05", dailyPortions: 1.0025 },
  { date: "08-05", dailyPortions: 1.0053 },
  { date: "12-05", dailyPortions: 1.0081 },
  { date: "14-05", dailyPortions: 0.9997 },
  { date: "16-05", dailyPortions: 0.8982 },
  { date: "17-05", dailyPortions: 1.0005 },
  { date: "19-05", dailyPortions: 1.0033 },
  { date: "20-05", dailyPortions: 1.0008 },
  { date: "22-05", dailyPortions: 0.3837 },
  { date: "23-05", dailyPortions: 0.7069 },
  { date: "24-05", dailyPortions: 0.8845 },
  { date: "25-05", dailyPortions: 0.9923 },
  { date: "27-05", dailyPortions: 1.0103 },
  { date: "28-05", dailyPortions: 1.3145 },
  { date: "31-05", dailyPortions: 0.9877 },
  { date: "01-06", dailyPortions: 0.4252 },
  { date: "02-06", dailyPortions: 1.3853 },
  { date: "04-06", dailyPortions: 0.9908 },
  { date: "05-06", dailyPortions: 1.0105 },
  { date: "06-06", dailyPortions: 1.0156 },
  { date: "08-06", dailyPortions: 1.1772 },
  { date: "09-06", dailyPortions: 0.2115 },
  { date: "10-06", dailyPortions: 1.3524 },
  { date: "12-06", dailyPortions: 1.016 },
  { date: "13-06", dailyPortions: 1.0124 },
  { date: "14-06", dailyPortions: 1.0043 },
  { date: "15-06", dailyPortions: 1.0039 },
  { date: "17-06", dailyPortions: 1.0173 },
  { date: "18-06", dailyPortions: 0.9216 },
  { date: "19-06", dailyPortions: 0.6636 },
  { date: "20-06", dailyPortions: 1.2575 },
  { date: "22-06", dailyPortions: 1.013 },
  { date: "23-06", dailyPortions: 1.145 },
  { date: "24-06", dailyPortions: 0.9872 },
  { date: "26-06", dailyPortions: 1.3173 },
  { date: "27-06", dailyPortions: 0.0578 },
  { date: "28-06", dailyPortions: 0.7067 },
  { date: "29-06", dailyPortions: 0.7825 },
  { date: "30-06", dailyPortions: 0.7081 },
  { date: "01-07", dailyPortions: 0.5259 },
  { date: "02-07", dailyPortions: 0.4653 },
  { date: "03-07", dailyPortions: 0.8232 },
  { date: "04-07", dailyPortions: 0.9217 },
  { date: "06-07", dailyPortions: 1.0019 },
  { date: "07-07", dailyPortions: 1.0104 },
  { date: "08-07", dailyPortions: 1.0122 },
  { date: "10-07", dailyPortions: 0.6826 },
  { date: "11-07", dailyPortions: 0.7812 },
  { date: "12-07", dailyPortions: 1.0319 },
  { date: "13-07", dailyPortions: 0.5396 },
  { date: "14-07", dailyPortions: 0.9629 },
  { date: "15-07", dailyPortions: 0.7389 },
  { date: "16-07", dailyPortions: 0.6491 },
  { date: "17-07", dailyPortions: 0.9977 },
  { date: "18-07", dailyPortions: 0.9999 },
  { date: "20-07", dailyPortions: 1.0051 },
  { date: "21-07", dailyPortions: 0.7458 },
  { date: "22-07", dailyPortions: 0.9505 },
  { date: "24-07", dailyPortions: 0.8744 },
  { date: "25-07", dailyPortions: 1.0051 },
  { date: "26-07", dailyPortions: 1.0076 },
  { date: "28-07", dailyPortions: 1.0053 },
];

const COLD_PORTION_MONTHLY_TOTALS_BY_YEAR = {
  2022: { 4: 2.8, 5: 12.4, 6: 15.3, 7: 15.3 },
  2023: { 4: 3.0, 5: 13.7, 6: 16.9, 7: 15.8 },
  2024: { 4: 7.4, 5: 22.3, 6: 18.6, 7: 20.2 },
  2025: { 4: 6.7, 5: 17.0, 6: 22.2, 7: 19.8 },
};
const COLD_PORTION_SEASON_START_MONTH = 4;
const COLD_PORTION_SEASON_END_MONTH = 7;
const WEEK_MS = 7 * 86400000;
const PORCIONES_FRIOS_BAR_COUNT = 30;
const DAY_MS = 86400000;
const DAILY_RECORDS_BY_MONTH = PORCIONES_FRIOS_DAILY_RECORDS.reduce((recordsByMonth, record) => {
  const [, monthToken] = record.date.split("-");
  const month = Number(monthToken);
  const monthRecords = recordsByMonth.get(month) ?? [];
  monthRecords.push(record);
  recordsByMonth.set(month, monthRecords);
  return recordsByMonth;
}, new Map());
const YEAR_RECORDS_CACHE = new Map();

const roundPortionValue = (value) => Math.round(value * 10000) / 10000;
const sumDailyPortions = (records) => records.reduce((total, record) => total + record.dailyPortions, 0);

const scaleDailyPortionToMonthlyTarget = ({ baseDailyPortion, month, monthlyTargets }) => {
  if (!monthlyTargets || !Number.isFinite(monthlyTargets[month])) {
    return roundPortionValue(baseDailyPortion);
  }

  const monthTemplateRecords = DAILY_RECORDS_BY_MONTH.get(month) ?? [];
  const templateMonthTotal = sumDailyPortions(monthTemplateRecords);
  const targetMonthTotal = monthlyTargets[month];
  const scaleFactor = templateMonthTotal > 0 ? targetMonthTotal / templateMonthTotal : 1;

  return roundPortionValue(baseDailyPortion * scaleFactor);
};

const buildSeasonRecordsForYear = (year) => {
  if (YEAR_RECORDS_CACHE.has(year)) return YEAR_RECORDS_CACHE.get(year);

  const monthlyTargets = COLD_PORTION_MONTHLY_TOTALS_BY_YEAR[year] ?? null;
  let accumulatedPortions = 0;

  const records = PORCIONES_FRIOS_DAILY_RECORDS.map((record) => {
    const [dayToken, monthToken] = record.date.split("-");
    const day = Number(dayToken);
    const month = Number(monthToken);
    const dailyPortions = scaleDailyPortionToMonthlyTarget({
      baseDailyPortion: record.dailyPortions,
      month,
      monthlyTargets,
    });

    accumulatedPortions = roundPortionValue(accumulatedPortions + dailyPortions);

    return {
      id: `cold-portion-${year}-${record.date}`,
      dateLabel: record.date,
      day,
      month,
      dateMs: Date.UTC(year, month - 1, day),
      dailyPortions,
      accumulatedPortions,
    };
  });

  YEAR_RECORDS_CACHE.set(year, records);
  return records;
};

export const getColdPortionSeasonRecords = (year) => {
  return buildSeasonRecordsForYear(year);
};

const buildWeeklyAccumulatedRecords = ({ records, seasonStartMs, seasonEndMs }) => {
  let accumulatedPortions = 0;
  const weeklyRecords = [];

  for (let weekStartMs = seasonStartMs; weekStartMs <= seasonEndMs; weekStartMs += WEEK_MS) {
    const weekEndMs = Math.min(weekStartMs + WEEK_MS - 1, seasonEndMs);
    const recordsInWeek = records.filter((record) => record.dateMs >= weekStartMs && record.dateMs <= weekEndMs);
    if (!recordsInWeek.length) continue;

    accumulatedPortions = roundPortionValue(accumulatedPortions + sumDailyPortions(recordsInWeek));

    weeklyRecords.push({
      id: `cold-portion-week-${weekStartMs}`,
      weekStartMs,
      weekEndMs,
      dateMs: weekEndMs,
      accumulatedPortions,
    });
  }

  return weeklyRecords;
};

const getColdPortionSeasonSummary = (year) => {
  const seasonStartMs = Date.UTC(year, COLD_PORTION_SEASON_START_MONTH - 1, 1);
  const seasonEndMs = Date.UTC(year, COLD_PORTION_SEASON_END_MONTH, 0);
  const seasonRecords = getColdPortionSeasonRecords(year).filter(
    (record) => record.month >= COLD_PORTION_SEASON_START_MONTH && record.month <= COLD_PORTION_SEASON_END_MONTH,
  );
  const weeklyRecords = buildWeeklyAccumulatedRecords({
    records: seasonRecords,
    seasonStartMs,
    seasonEndMs,
  });
  const currentYearFinalAccumulated = weeklyRecords.at(-1)?.accumulatedPortions ?? 0;

  return {
    records: weeklyRecords,
    dailyRecords: seasonRecords,
    currentYearFinalAccumulated,
    chartMaxAccumulated: Math.max(currentYearFinalAccumulated, 1),
    seasonStartMs,
    seasonEndMs,
  };
};

const getPorcionesFriosBars = (year, barCount = PORCIONES_FRIOS_BAR_COUNT) => {
  const chartStartMs = Date.UTC(year, 4, 1);
  const chartEndMs = Date.UTC(year, 6, 31);
  const chartRecords = getColdPortionSeasonRecords(year).filter(
    (record) => record.dateMs >= chartStartMs && record.dateMs <= chartEndMs,
  );
  const totalDays = Math.round((chartEndMs - chartStartMs) / DAY_MS) + 1;

  const getAccumulatedUntil = (targetMs) =>
    chartRecords.reduce(
      (total, record) => (record.dateMs <= targetMs ? roundPortionValue(total + record.dailyPortions) : total),
      0,
    );

  const bars = Array.from({ length: barCount }, (_, index) => {
    const startDayOffset = Math.floor((index * totalDays) / barCount);
    const nextStartDayOffset = Math.floor(((index + 1) * totalDays) / barCount);
    const endDayOffset = Math.max(startDayOffset, nextStartDayOffset - 1);
    const startMs = chartStartMs + startDayOffset * DAY_MS;
    const endMs = chartStartMs + endDayOffset * DAY_MS + DAY_MS - 1;

    return {
      id: `porciones-frios-bar-${index + 1}`,
      startMs,
      endMs,
      accumulatedPortions: getAccumulatedUntil(endMs),
    };
  });

  return {
    chartStartMs,
    chartEndMs,
    bars,
    maxAccumulatedPortions: bars.at(-1)?.accumulatedPortions ?? 1,
  };
};

export const getPorcionesFriosSummary = (year) => {
  const seasonSummary = getColdPortionSeasonSummary(year);
  const barsSummary = getPorcionesFriosBars(year);

  return {
    ...seasonSummary,
    bars: barsSummary.bars,
    barChartStartMs: barsSummary.chartStartMs,
    barChartEndMs: barsSummary.chartEndMs,
    barMaxAccumulated: barsSummary.maxAccumulatedPortions,
  };
};
