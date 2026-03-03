import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildDraftRaleoRows,
  buildHistoricalRaleoRows,
  DRAFT_YEAR,
  formatCellValue,
  normalizeText,
} from "./raleoDecisionService";
import "../pruningDecision/pruningDecisionTable.css";

const RaleoDecisionTable = ({
  selectedCuartel,
  selectedYears = [],
  registeredProductionByCuartel = {},
  registeredPruningByCuartel = {},
}) => {
  const normalizedSelectedCuartel = normalizeText(selectedCuartel);
  const hasSelectedYears = Array.isArray(selectedYears) && selectedYears.length > 0;

  const historicalRows = useMemo(
    () => buildHistoricalRaleoRows({ selectedCuartel, selectedYears }),
    [selectedCuartel, selectedYears],
  );

  const registeredProductionForSelectedCuartel = normalizedSelectedCuartel
    ? registeredProductionByCuartel[normalizedSelectedCuartel]
    : null;
  const registeredPruningForSelectedCuartel = normalizedSelectedCuartel
    ? registeredPruningByCuartel[normalizedSelectedCuartel]
    : null;

  const draftRows = useMemo(
    () =>
      buildDraftRaleoRows({
        selectedCuartel,
        registeredProductionForSelectedCuartel,
        registeredPruningForSelectedCuartel,
      }),
    [registeredProductionForSelectedCuartel, registeredPruningForSelectedCuartel, selectedCuartel],
  );

  const historicalRowsWithTone = useMemo(() => {
    let previousYear = null;
    let yearBandIndex = -1;

    return historicalRows.map((row) => {
      if (row.year !== previousYear) {
        previousYear = row.year;
        yearBandIndex += 1;
      }

      return {
        ...row,
        toneClassName:
          yearBandIndex % 2 === 0
            ? "pruning-decision-table__row--year-a"
            : "pruning-decision-table__row--year-b",
      };
    });
  }, [historicalRows]);

  const draftToneClassName = useMemo(() => {
    const uniqueHistoricalYears = new Set(historicalRows.map((row) => row.year));
    return uniqueHistoricalYears.size % 2 === 0
      ? "pruning-decision-table__row--year-a"
      : "pruning-decision-table__row--year-b";
  }, [historicalRows]);

  const scrollRef = useRef(null);
  const [scrollThumb, setScrollThumb] = useState({
    height: 0,
    top: 0,
    visible: false,
  });

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return undefined;

    const updateScrollThumb = () => {
      const { clientHeight, scrollHeight, scrollTop } = scrollElement;
      if (clientHeight <= 0 || scrollHeight <= clientHeight) {
        setScrollThumb({
          height: 0,
          top: 0,
          visible: false,
        });
        return;
      }

      const trackPadding = 6;
      const trackHeight = Math.max(0, clientHeight - trackPadding * 2);
      const rawThumbHeight = (clientHeight / scrollHeight) * trackHeight;
      const thumbHeight = Math.max(36, rawThumbHeight);
      const maxThumbTravel = Math.max(0, trackHeight - thumbHeight);
      const maxScrollTop = Math.max(1, scrollHeight - clientHeight);
      const thumbTop = trackPadding + (scrollTop / maxScrollTop) * maxThumbTravel;

      setScrollThumb({
        height: thumbHeight,
        top: thumbTop,
        visible: true,
      });
    };

    updateScrollThumb();
    scrollElement.addEventListener("scroll", updateScrollThumb);
    window.addEventListener("resize", updateScrollThumb);

    const resizeObserver =
      typeof ResizeObserver === "function" ? new ResizeObserver(updateScrollThumb) : null;
    resizeObserver?.observe(scrollElement);
    Array.from(scrollElement.children).forEach((child) => resizeObserver?.observe(child));

    return () => {
      scrollElement.removeEventListener("scroll", updateScrollThumb);
      window.removeEventListener("resize", updateScrollThumb);
      resizeObserver?.disconnect();
    };
  }, [draftRows, historicalRowsWithTone, selectedYears]);

  if (!normalizedSelectedCuartel) {
    return <div className="pruning-decision-table__empty">Selecciona un cuartel en el mapa para ver la tabla de raleo.</div>;
  }

  if (!hasSelectedYears) {
    return <div className="pruning-decision-table__empty">Selecciona uno o mas anos para ver la tabla de raleo.</div>;
  }

  const hasRows = historicalRowsWithTone.length > 0 || draftRows.length > 0;
  if (!hasRows) {
    return (
      <div className="pruning-decision-table__empty">
        Registra Produccion Posible y Poda para calcular la tabla de raleo.
      </div>
    );
  }

  return (
    <div className="pruning-decision-table__content">
      <div className="pruning-decision-table__scroll-shell">
        <div ref={scrollRef} className="pruning-decision-table__scroll">
          <table className="pruning-decision-table" role="table" aria-label="Tabla de decision de raleo">
            <thead>
              <tr>
                <th scope="col">Temp.</th>
                <th scope="col">Variedad</th>
                <th scope="col">% Cuaja Estimada</th>
                <th scope="col">% Cuaja Real</th>
                <th scope="col">Frutos por Arbol</th>
                <th scope="col">Frutos Objetivo por Arbol</th>
                <th scope="col">Raleo (Frutos/Arbol)</th>
              </tr>
            </thead>
            <tbody>
              {historicalRowsWithTone.map((row) => (
                <tr key={`hist-${row.year}-${row.variedad}`} className={row.toneClassName}>
                  <td>{row.year}</td>
                  <td>{row.variedad}</td>
                  <td>{formatCellValue(row.cuajaEstimada)}</td>
                  <td>{formatCellValue(row.cuajaReal)}</td>
                  <td>{formatCellValue(row.frutosPorArbol)}</td>
                  <td>{formatCellValue(row.frutosObjetivoPorArbol)}</td>
                  <td>{formatCellValue(row.raleoFrutosPorArbol)}</td>
                </tr>
              ))}

              {draftRows.map((row) => (
                <tr
                  key={`draft-${row.variedad}-${DRAFT_YEAR}`}
                  className={`pruning-decision-table__draft-row ${draftToneClassName}`}
                >
                  <td>{DRAFT_YEAR}</td>
                  <td>{row.variedad}</td>
                  <td>{formatCellValue(row.cuajaEstimada)}</td>
                  <td>{formatCellValue(row.cuajaReal)}</td>
                  <td>{formatCellValue(row.frutosPorArbol)}</td>
                  <td>{formatCellValue(row.frutosObjetivoPorArbol)}</td>
                  <td>{formatCellValue(row.raleoFrutosPorArbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {scrollThumb.visible ? (
          <span
            className="pruning-decision-table__scroll-thumb"
            style={{ height: `${scrollThumb.height}px`, top: `${scrollThumb.top}px` }}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  );
};

export default RaleoDecisionTable;
