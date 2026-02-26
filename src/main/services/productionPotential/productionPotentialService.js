const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const parsed = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const toPercent = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const parsed = Number(String(value).trim().replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const round = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const calculateProductionPotential = ({
  dardosPlanta,
  floresDardo,
  danoPercent,
  cuajaPercent,
  plantasHaProductivas,
  pesoFrutoGr,
}) => {
  const parsedDardosPlanta = toNumber(dardosPlanta);
  const parsedFloresDardo = toNumber(floresDardo);
  const parsedDanoPercent = toPercent(danoPercent);
  const parsedCuajaPercent = toPercent(cuajaPercent);
  const parsedPlantasHaProductivas = toNumber(plantasHaProductivas);
  const parsedPesoFrutoGr = toNumber(pesoFrutoGr);

  const frutosPlanta =
    parsedDardosPlanta !== null &&
    parsedFloresDardo !== null &&
    parsedDanoPercent !== null &&
    parsedCuajaPercent !== null
      ? parsedDardosPlanta * parsedFloresDardo * (1 - parsedDanoPercent / 100) * (parsedCuajaPercent / 100)
      : null;

  const produccionKgHa =
    frutosPlanta !== null && parsedPlantasHaProductivas !== null && parsedPesoFrutoGr !== null
      ? (frutosPlanta * parsedPlantasHaProductivas * parsedPesoFrutoGr) / 1000
      : null;

  return {
    frutosPlanta: round(frutosPlanta, 2),
    produccionKgHa: round(produccionKgHa, 2),
  };
};
