export const createDefaultPeriods = (year) => [
  {
    id: "periodo-agosto-septiembre",
    label: "Agosto - Septiembre",
    startMs: Date.UTC(year, 7, 1),
    endMs: Date.UTC(year, 8, 30),
    color: "#cc684a",
  },
  {
    id: "evaluacion-octubre",
    label: "Evaluacion",
    startMs: Date.UTC(year, 9, 5),
    endMs: Date.UTC(year, 9, 20),
    color: "#5f8a7c",
  },
];
