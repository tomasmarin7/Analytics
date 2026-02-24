export const createDefaultPeriods = (year) => [
  {
    id: "periodo-febrero",
    label: "Fertilización",
    startMs: Date.UTC(year, 1, 1),
    endMs: Date.UTC(year, 3, 0),
  },
];
