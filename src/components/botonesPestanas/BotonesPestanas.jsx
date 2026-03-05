import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClimaPestana,
  CosechaPestana,
  FertilizacionPestana,
  PodaPestana,
  ProduccionPestana,
  RaleoPestana,
  RdtoPrePodaPestana,
} from "./pestanas";
import "./BotonesPestanas.css";

const DAY_MS = 86400000;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const TAB_DEFINITIONS = [
  {
    id: "fertilizacion",
    Component: FertilizacionPestana,
    start: { month: 1, day: 1 },
    end: { month: 2, day: "last" },
  },
  {
    id: "rdto-pre-poda",
    Component: RdtoPrePodaPestana,
    start: { month: 4, day: 1 },
    end: { month: 5, day: 15 },
  },
  {
    id: "poda",
    Component: PodaPestana,
    start: { month: 5, day: 16 },
    end: { month: 5, day: "last" },
  },
  {
    id: "clima",
    Component: ClimaPestana,
    start: { month: 6, day: 1 },
    end: { month: 6, day: "last" },
  },
  {
    id: "raleo",
    Component: RaleoPestana,
    start: { month: 8, day: 25 },
    end: { month: 9, day: 15 },
  },
  {
    id: "cosecha",
    Component: CosechaPestana,
    start: { month: 10, day: 1 },
    end: { month: 10, day: "last" },
  },
  {
    id: "produccion",
    Component: ProduccionPestana,
    start: { month: 11, day: 1 },
    end: { month: 11, day: "last" },
  },
];

const BOTONES_PESTANAS = TAB_DEFINITIONS.map((tab) => tab.id);

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

const BotonesPestanas = ({ currentDate }) => {
  const [activePestanaId, setActivePestanaId] = useState("fertilizacion");
  const [expansionOriginX, setExpansionOriginX] = useState(50);
  const isPanelOpen = activePestanaId !== null;
  const sectionRef = useRef(null);
  const pestanaRefs = useRef(new Map());
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

  const setPestanaRef = (pestanaId) => (element) => {
    if (element) {
      pestanaRefs.current.set(pestanaId, element);
    } else {
      pestanaRefs.current.delete(pestanaId);
    }
  };

  const updateExpansionOrigin = (pestanaId) => {
    if (!pestanaId) {
      return;
    }

    const sectionElement = sectionRef.current;
    const pestanaElement = pestanaRefs.current.get(pestanaId);
    if (!sectionElement || !pestanaElement) {
      return;
    }

    const sectionRect = sectionElement.getBoundingClientRect();
    const pestanaRect = pestanaElement.getBoundingClientRect();
    const pestanaCenterX = pestanaRect.left + pestanaRect.width / 2;
    const percent = ((pestanaCenterX - sectionRect.left) / sectionRect.width) * 100;
    const clampedPercent = Math.min(96, Math.max(4, percent));

    setExpansionOriginX(clampedPercent);
  };

  const handlePestanaClick = (pestanaId) => {
    setActivePestanaId((current) => {
      if (current === pestanaId) {
        return null;
      }

      return pestanaId;
    });
  };

  useEffect(() => {
    if (!activePestanaId) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      updateExpansionOrigin(activePestanaId);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activePestanaId]);

  useEffect(() => {
    const handleResize = () => {
      if (!activePestanaId) {
        return;
      }

      updateExpansionOrigin(activePestanaId);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activePestanaId]);

  return (
    <section
      ref={sectionRef}
      className={`botones-pestanas ${isPanelOpen ? "botones-pestanas--panel-open" : ""}`}
      aria-label="Acciones principales"
      style={{ "--expansion-origin-x": `${expansionOriginX}%` }}
    >
      <div className="botones-pestanas__linea-tiempo" role="tablist" aria-label="Procesos del huerto">
        {tabs.map(({ id, Component, left, width }) => (
          <div
            key={id}
            className={`botones-pestanas__slot botones-pestanas__slot--${id}`}
            style={{ left: `${left}%`, width: `${width}%` }}
          >
            <Component
              isActive={activePestanaId === id}
              onClick={() => handlePestanaClick(id)}
              setButtonRef={setPestanaRef(id)}
            />
          </div>
        ))}
      </div>

      <div className="botones-pestanas__panel-slot">
        <section
          id="botones-pestanas-panel"
          role="tabpanel"
          aria-labelledby={activePestanaId ? `botones-pestanas-${activePestanaId}` : undefined}
          aria-hidden={!isPanelOpen}
          className={`botones-pestanas__panel ${isPanelOpen ? "botones-pestanas__panel--open" : ""} ${
            activePestanaId && BOTONES_PESTANAS.includes(activePestanaId)
              ? `botones-pestanas__panel--${activePestanaId}`
              : ""
          } fx-grainy-green-surface`}
        />
      </div>
    </section>
  );
};

export default BotonesPestanas;
