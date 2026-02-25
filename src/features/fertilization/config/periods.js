export const createDefaultPeriods = (year) => [
  {
    id: "periodo-fertilizacion",
    label: "Fertilización",
    startMs: Date.UTC(year, 1, 1),
    endMs: Date.UTC(year, 3, 0),
    focusStartMs: Date.UTC(year, 0, 1),
    focusEndMs: Date.UTC(year, 3, 1),
  },
];

export const getFallbackFocusRange = (year) => ({
  startMs: Date.UTC(year, 0, 1),
  endMs: Date.UTC(year, 3, 1),
});
