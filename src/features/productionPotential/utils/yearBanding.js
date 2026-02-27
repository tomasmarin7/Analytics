const YEAR_BAND_A = "year-band-a";
const YEAR_BAND_B = "year-band-b";

const collectOrderedYears = (rows, seenYears, orderedYears) => {
  for (const row of rows) {
    if (seenYears.has(row.year)) continue;
    seenYears.add(row.year);
    orderedYears.push(row.year);
  }
};

export const buildYearBandByYear = ({ historicalRows, draftRows }) => {
  const seenYears = new Set();
  const orderedYears = [];

  collectOrderedYears(historicalRows, seenYears, orderedYears);
  collectOrderedYears(draftRows, seenYears, orderedYears);

  return new Map(orderedYears.map((year, index) => [year, index % 2 === 0 ? YEAR_BAND_A : YEAR_BAND_B]));
};

export const getYearBandClass = (yearBandByYear, year) =>
  `production-potential-table__row--${yearBandByYear.get(year) ?? YEAR_BAND_A}`;
