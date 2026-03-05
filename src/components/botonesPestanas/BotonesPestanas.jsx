import { useEffect, useMemo, useRef, useState } from "react";
import "./BotonesPestanas.css";
import YearChipsColumn from "../dataRecordsSection/YearChipsColumn/YearChipsColumn";
import foliarAnalysisRows from "../../data/foliarAnalysisRows.json";
import budAnalysisRows from "../../data/budAnalysisRows.json";
import prePruningCountRows from "../../data/prePruningCountRows.json";
import postPruningCountRows from "../../data/postPruningCountRows.json";
import fertilizationPlanRows from "../../data/fertilizationPlanRows.json";

const DAY_MS = 86400000;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const normalizeKey = (value) => String(value ?? "").trim().toUpperCase();

const collectYearsForCuartel = ({
  rows = [],
  cuartelField,
  yearField,
  normalizedSelectedCuartel,
  yearsSet,
}) => {
  if (!normalizedSelectedCuartel || !Array.isArray(rows)) return;

  rows.forEach((row) => {
    const rowCuartel = normalizeKey(row?.[cuartelField]);
    if (rowCuartel !== normalizedSelectedCuartel) return;

    const year = Number(row?.[yearField]);
    if (Number.isFinite(year)) {
      yearsSet.add(year);
    }
  });
};

const TAB_DEFINITIONS = [
  {
    id: "fertilizacion",
    label: "FERTILIZACION",
    variant: "fertilizacion",
    start: { month: 1, day: 1 },
    end: { month: 2, day: "last" },
  },
  {
    id: "rdto-pre-poda",
    label: "RDTO. PRE PODA",
    variant: "rdto-pre-poda",
    start: { month: 4, day: 1 },
    end: { month: 5, day: 15 },
  },
  {
    id: "poda",
    label: "PODA",
    variant: "poda",
    start: { month: 5, day: 16 },
    end: { month: 5, day: "last" },
  },
  {
    id: "clima",
    label: "CLIMA",
    variant: "clima",
    start: { month: 6, day: 1 },
    end: { month: 6, day: "last" },
  },
  {
    id: "raleo",
    label: "RALEO",
    variant: "raleo",
    start: { month: 8, day: 25 },
    end: { month: 9, day: 15 },
  },
  {
    id: "cosecha",
    label: "COSECHA",
    variant: "cosecha",
    start: { month: 10, day: 1 },
    end: { month: 10, day: "last" },
  },
  {
    id: "produccion",
    label: "PRODUCCION",
    variant: "produccion",
    start: { month: 11, day: 1 },
    end: { month: 11, day: "last" },
  },
];

const resolveUtcDateMs = (year, { month, day }) => {
  if (day === "last") {
    return Date.UTC(year, month + 1, 0);
  }

  return Date.UTC(year, month, day);
};

const getTabGeometry = (year, start, end) => {
  const yearStartMs = Date.UTC(year, 0, 1);
  const yearEndMs = Date.UTC(year + 1, 0, 1) - DAY_MS;
  const yearSpanMs = yearEndMs - yearStartMs + DAY_MS;
  const startMs = resolveUtcDateMs(year, start);
  const endMs = resolveUtcDateMs(year, end);

  const left = ((startMs - yearStartMs) / yearSpanMs) * 100;
  const right = ((endMs + DAY_MS - yearStartMs) / yearSpanMs) * 100;

  return {
    left: clamp(left, 0, 100),
    width: clamp(right - left, 1.6, 100),
  };
};

const BotonesPestanas = ({ currentDate, selectedCuartel }) => {
  const [activeTabId, setActiveTabId] = useState(null);
  const [lastSelectedTabId, setLastSelectedTabId] = useState(TAB_DEFINITIONS[0].id);
  const [selectedYears, setSelectedYears] = useState([]);
  const previousCuartelRef = useRef(normalizeKey(selectedCuartel));

  const activeYear =
    currentDate instanceof Date && !Number.isNaN(currentDate.getTime()) ? currentDate.getFullYear() : new Date().getFullYear();

  const tabs = useMemo(
    () =>
      TAB_DEFINITIONS.map((tab) => ({
        ...tab,
        ...getTabGeometry(activeYear, tab.start, tab.end),
      })),
    [activeYear],
  );
  const normalizedSelectedCuartel = useMemo(() => normalizeKey(selectedCuartel), [selectedCuartel]);
  const availableYears = useMemo(() => {
    const yearsSet = new Set();

    collectYearsForCuartel({
      rows: foliarAnalysisRows,
      cuartelField: "Cuartel",
      yearField: "Temp.",
      normalizedSelectedCuartel,
      yearsSet,
    });
    collectYearsForCuartel({
      rows: budAnalysisRows,
      cuartelField: "Cuartel",
      yearField: "Temp.",
      normalizedSelectedCuartel,
      yearsSet,
    });
    collectYearsForCuartel({
      rows: prePruningCountRows,
      cuartelField: "Cuartel",
      yearField: "Temp.",
      normalizedSelectedCuartel,
      yearsSet,
    });
    collectYearsForCuartel({
      rows: postPruningCountRows,
      cuartelField: "Cuartel",
      yearField: "Temp.",
      normalizedSelectedCuartel,
      yearsSet,
    });
    collectYearsForCuartel({
      rows: fertilizationPlanRows,
      cuartelField: "cuartel",
      yearField: "temp",
      normalizedSelectedCuartel,
      yearsSet,
    });

    return [...yearsSet].sort((a, b) => a - b);
  }, [normalizedSelectedCuartel]);

  useEffect(() => {
    if (previousCuartelRef.current === normalizedSelectedCuartel) return;
    previousCuartelRef.current = normalizedSelectedCuartel;
    setSelectedYears((currentYears) => (currentYears.length ? [] : currentYears));
  }, [normalizedSelectedCuartel]);

  useEffect(() => {
    if (!selectedYears.length) return;
    const availableYearsSet = new Set(availableYears);
    setSelectedYears((currentYears) => currentYears.filter((year) => availableYearsSet.has(year)));
  }, [availableYears, selectedYears.length]);
  const visibleTabId = activeTabId ?? lastSelectedTabId;
  const visibleTab = tabs.find((tab) => tab.id === visibleTabId) ?? tabs[0];
  const panelAnchorWidth = `${visibleTab.width}%`;
  const panelAnchorCenter = `${visibleTab.left + visibleTab.width / 2}%`;

  const handleTabClick = (tabId) => {
    setActiveTabId((currentTabId) => {
      if (currentTabId === tabId) {
        return null;
      }

      setLastSelectedTabId(tabId);
      return tabId;
    });
  };
  const handleToggleYear = (year) => {
    setSelectedYears((currentYears) =>
      currentYears.includes(year)
        ? currentYears.filter((value) => value !== year)
        : [...currentYears, year].sort((a, b) => a - b),
    );
  };

  return (
    <section className="botones-pestanas" aria-label="Acciones principales">
      <div className="botones-pestanas__linea-tiempo" aria-label="Procesos del huerto">
        {tabs.map(({ id, label, variant, left, width }) => (
          <div
            key={id}
            className={`botones-pestanas__slot botones-pestanas__slot--${id}`}
            style={{ left: `${left}%`, width: `${width}%` }}
          >
            <button
              type="button"
              className={`botones-pestanas__vignette botones-pestanas__vignette--${variant} ${
                activeTabId === id ? "botones-pestanas__vignette--active" : ""
              }`}
              aria-pressed={activeTabId === id}
              onClick={() => handleTabClick(id)}
            >
              <span className="botones-pestanas__vignette-label">{label}</span>
            </button>
          </div>
        ))}
      </div>
      <div
        className={`botones-pestanas__panel-slot botones-pestanas__panel-slot--${visibleTab?.variant ?? "fertilizacion"} ${
          activeTabId ? "botones-pestanas__panel-slot--open" : ""
        }`}
        style={{
          "--panel-anchor-width": panelAnchorWidth,
          "--panel-anchor-center": panelAnchorCenter,
        }}
      >
        <div
          className={`botones-pestanas__panel botones-pestanas__panel--${visibleTab?.variant ?? "fertilizacion"} ${
            activeTabId ? "botones-pestanas__panel--open" : ""
          }`}
          aria-hidden={!activeTabId}
        >
          <div className="botones-pestanas__year-selector" aria-hidden={!activeTabId}>
            <YearChipsColumn
              availableYears={availableYears}
              selectedYears={selectedYears}
              onToggleYear={handleToggleYear}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BotonesPestanas;
