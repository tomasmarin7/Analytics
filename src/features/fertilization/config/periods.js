import { PERIOD_PANEL_TYPES } from "./panelTypes";

export const createDefaultPeriods = (year) => [
  {
    id: "periodo-fertilizacion",
    label: "Fertilización",
    startMs: Date.UTC(year, 1, 1),
    endMs: Date.UTC(year, 3, 0),
    focusStartMs: Date.UTC(year, 0, 1),
    focusEndMs: Date.UTC(year, 3, 0),
    variant: "fertilization",
    panelType: PERIOD_PANEL_TYPES.FERTILIZATION,
  },
  {
    id: "periodo-produccion-posible",
    label: "Producción Posible",
    startMs: Date.UTC(year, 5, 15),
    endMs: Date.UTC(year, 5, 25),
    raisedStartMs: Date.UTC(year, 5, 1),
    focusStartMs: Date.UTC(year, 4, 15),
    focusEndMs: Date.UTC(year, 5, 25),
    variant: "production-potential",
    panelType: PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL,
  },
  {
    id: "periodo-produccion-posible-variedad-dardo",
    label: "Producción Posible/Variedad/Dardo",
    startMs: Date.UTC(year, 5, 26),
    endMs: Date.UTC(year, 6, 1),
    raisedStartMs: Date.UTC(year, 5, 26),
    raisedEndMs: Date.UTC(year, 6, 1),
    focusStartMs: Date.UTC(year, 5, 10),
    focusEndMs: Date.UTC(year, 7, 15),
    variant: "production-potential-variedad-dardo",
    panelType: PERIOD_PANEL_TYPES.PRODUCTION_POTENTIAL_VARIETY_DARDO,
  },
  {
    id: "periodo-poda",
    label: "Poda",
    startMs: Date.UTC(year, 6, 1),
    endMs: Date.UTC(year, 6, 15),
    raisedStartMs: Date.UTC(year, 6, 1),
    raisedEndMs: Date.UTC(year, 6, 15),
    focusStartMs: Date.UTC(year, 5, 24),
    focusEndMs: Date.UTC(year, 6, 20),
    variant: "pruning-decision",
    panelType: PERIOD_PANEL_TYPES.PRUNING_DECISION,
  },
];

export const getFallbackFocusRange = (year) => ({
  startMs: Date.UTC(year, 0, 1),
  endMs: Date.UTC(year, 3, 0),
});
