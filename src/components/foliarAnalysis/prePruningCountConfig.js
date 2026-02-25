export const PRE_PRUNING_COUNT_SCORE_FIELDS = [
  "superficieCuartelHa",
  "superficieVariedadHa",
  "plantasHa",
  "plantasHaProductivas",
  "dardosPlanta",
  "promDardosLateral",
  "ramillasPlanta",
  "promRamillasLateral",
];

export const PRE_PRUNING_COUNT_COLUMNS = [
  { field: "variedad", header: "Variedad" },
  { field: "superficieCuartelHa", header: "Superficie Cuartel (ha)" },
  { field: "superficieVariedadHa", header: "Superficie Variedad (ha)" },
  { field: "plantasHa", header: "Plantas /ha" },
  { field: "plantasHaProductivas", header: "Plantas /ha Productivas" },
  { field: "dardosPlanta", header: "Dardos /Planta" },
  { field: "promDardosLateral", header: "Prom. Dardos /Lateral" },
  { field: "ramillasPlanta", header: "Ramillas /Planta" },
  { field: "promRamillasLateral", header: "Prom. Ramillas /Lateral" },
];

export const mapPrePruningCountRow = (row) => ({
  year: Number(row["Temp."]),
  temp: row["Temp."],
  huerto: row.Huerto,
  cuartel: row.Cuartel,
  variedad: row.Variedad,
  superficieCuartelHa: row["Superficie Cuartel (ha)"],
  superficieVariedadHa: row["Superficie Variedad (ha)"],
  plantasHa: row["Plantas /ha"],
  plantasHaProductivas: row["Plantas /ha Productivas"],
  dardosPlanta: row["Dardos /Planta"],
  promDardosLateral: row["Prom. Dardos /Lateral"],
  ramillasPlanta: row["Ramillas /Planta"],
  promRamillasLateral: row["Prom. Ramillas /Lateral"],
});

export const sortPrePruningCountRows = (a, b) => {
  if (a.year !== b.year) return a.year - b.year;

  const variedadComparison = String(a.variedad ?? "").localeCompare(String(b.variedad ?? ""));
  if (variedadComparison !== 0) return variedadComparison;

  return String(a.cuartel ?? "").localeCompare(String(b.cuartel ?? ""));
};
