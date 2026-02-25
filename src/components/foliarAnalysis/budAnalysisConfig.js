export const BUD_SCORE_FIELDS = ["yemasDardo", "floresYemaDardo", "floresDardo", "dano"];

export const BUD_COLUMNS = [
  { field: "variedad", header: "Variedad" },
  { field: "yemasDardo", header: "Yemas/Dardo" },
  { field: "floresYemaDardo", header: "Flores/Yema/Dardo" },
  { field: "floresDardo", header: "Flores/Dardo" },
  { field: "dano", header: "Daño (%)" },
];

export const mapBudRow = (row) => ({
  year: Number(row["Temp."]),
  temp: row["Temp."],
  cuartel: row.Cuartel,
  variedad: row.Variedad,
  yemasDardo: row["Yemas/Dardo"],
  floresYemaDardo: row["Flores/Yema/Dardo"],
  floresDardo: row["Flores/Dardo"],
  dano: row["Daño (%)"],
});

export const sortBudRows = (a, b) => {
  if (a.year !== b.year) return a.year - b.year;

  const variedadComparison = String(a.variedad ?? "").localeCompare(String(b.variedad ?? ""));
  if (variedadComparison !== 0) return variedadComparison;

  return String(a.cuartel ?? "").localeCompare(String(b.cuartel ?? ""));
};
