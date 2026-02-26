import "./FoliarAnalysisTableCard.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { useVerticalWheelToHorizontalScroll } from "../shared/useVerticalWheelToHorizontalScroll";

const renderCellValue = (value) => (value === "" || value === null || value === undefined ? "-" : value);

const buildRowKey = (row, rowIndex) =>
  `${row.cuartel ?? "cuartel"}-${row.year ?? "year"}-${row.variedad ?? "variedad"}-${rowIndex}`;

const FoliarAnalysisTableCard = ({
  hasDataTable,
  rowData,
  selectedYearsCount,
  columns = [],
  tableAriaLabel = "Tabla de análisis",
}) => {
  const tableScrollRef = useRef(null);
  const pillScrollbarRef = useRef(null);
  const dragStateRef = useRef(null);
  const [horizontalScrollState, setHorizontalScrollState] = useState({
    isScrollable: false,
    thumbWidthPx: 0,
    thumbOffsetPx: 0,
  });
  let previousYear = null;
  let yearBandIndex = -1;

  useVerticalWheelToHorizontalScroll(tableScrollRef);

  useEffect(() => {
    const scrollElement = tableScrollRef.current;
    const scrollbarElement = pillScrollbarRef.current;
    if (!scrollElement || !scrollbarElement) return undefined;

    const updateHorizontalScrollState = () => {
      const viewportWidth = scrollElement.clientWidth;
      const contentWidth = scrollElement.scrollWidth;
      const trackWidth = scrollbarElement.clientWidth;

      if (contentWidth <= viewportWidth || trackWidth <= 0) {
        setHorizontalScrollState({
          isScrollable: false,
          thumbWidthPx: 0,
          thumbOffsetPx: 0,
        });
        return;
      }

      const thumbWidthPx = Math.max(58, (viewportWidth / contentWidth) * trackWidth);
      const maxThumbOffsetPx = Math.max(0, trackWidth - thumbWidthPx);
      const maxScrollLeft = contentWidth - viewportWidth;
      const thumbOffsetPx =
        maxScrollLeft <= 0 ? 0 : (scrollElement.scrollLeft / maxScrollLeft) * maxThumbOffsetPx;

      setHorizontalScrollState({
        isScrollable: true,
        thumbWidthPx,
        thumbOffsetPx,
      });
    };

    updateHorizontalScrollState();

    const resizeObserver = new ResizeObserver(updateHorizontalScrollState);
    resizeObserver.observe(scrollElement);
    resizeObserver.observe(scrollbarElement);

    scrollElement.addEventListener("scroll", updateHorizontalScrollState, { passive: true });
    window.addEventListener("resize", updateHorizontalScrollState);

    return () => {
      resizeObserver.disconnect();
      scrollElement.removeEventListener("scroll", updateHorizontalScrollState);
      window.removeEventListener("resize", updateHorizontalScrollState);
    };
  }, [rowData.length, columns.length]);

  const handleThumbPointerDown = (event) => {
    const scrollElement = tableScrollRef.current;
    const scrollbarElement = pillScrollbarRef.current;
    if (!scrollElement || !scrollbarElement || !horizontalScrollState.isScrollable) return;

    const maxScrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth;
    const maxThumbOffsetPx = scrollbarElement.clientWidth - horizontalScrollState.thumbWidthPx;
    if (maxScrollLeft <= 0 || maxThumbOffsetPx <= 0) return;

    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startScrollLeft: scrollElement.scrollLeft,
      maxScrollLeft,
      maxThumbOffsetPx,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handleThumbPointerMove = (event) => {
    const scrollElement = tableScrollRef.current;
    const dragState = dragStateRef.current;
    if (!scrollElement || !dragState || dragState.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startClientX;
    const scrollDelta = (deltaX / dragState.maxThumbOffsetPx) * dragState.maxScrollLeft;
    scrollElement.scrollLeft = dragState.startScrollLeft + scrollDelta;
  };

  const handleThumbPointerUp = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
  };

  const handlePillScrollbarPointerDown = (event) => {
    if (event.target !== event.currentTarget) return;

    const scrollElement = tableScrollRef.current;
    const scrollbarElement = pillScrollbarRef.current;
    if (!scrollElement || !scrollbarElement || !horizontalScrollState.isScrollable) return;

    const trackRect = scrollbarElement.getBoundingClientRect();
    const clickOffset = event.clientX - trackRect.left;
    const desiredThumbCenter = clickOffset - horizontalScrollState.thumbWidthPx / 2;
    const maxThumbOffsetPx = Math.max(0, trackRect.width - horizontalScrollState.thumbWidthPx);
    const clampedThumbOffsetPx = Math.min(maxThumbOffsetPx, Math.max(0, desiredThumbCenter));
    const maxScrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth;
    const nextScrollLeft = maxThumbOffsetPx <= 0 ? 0 : (clampedThumbOffsetPx / maxThumbOffsetPx) * maxScrollLeft;
    scrollElement.scrollLeft = nextScrollLeft;
  };

  const thumbStyle = useMemo(
    () => ({
      width: `${horizontalScrollState.thumbWidthPx}px`,
      transform: `translateX(${horizontalScrollState.thumbOffsetPx}px)`,
    }),
    [horizontalScrollState.thumbOffsetPx, horizontalScrollState.thumbWidthPx]
  );

  return (
    <div className="foliar-analysis-table-card">
      <div className="foliar-analysis-table-card__inner">
        <div className="foliar-analysis-table-card__grid">
          {!hasDataTable ? (
            <div className="foliar-analysis-table-card__empty-message">
              No hay tabla disponible para los eventos seleccionados.
            </div>
          ) : (
            <>
              <div ref={tableScrollRef} className="foliar-analysis-table-card__table-scroll">
                <table className="foliar-analysis-table-card__table" role="table" aria-label={tableAriaLabel}>
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.field}
                          scope="col"
                          className={column.tone ? `foliar-analysis-table-card__col--${column.tone}` : ""}
                        >
                          {column.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedYearsCount === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="foliar-analysis-table-card__empty-cell">
                          Selecciona al menos un año para formar la tabla.
                        </td>
                      </tr>
                    ) : rowData.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="foliar-analysis-table-card__empty-cell">
                          No hay registros para los años seleccionados.
                        </td>
                      </tr>
                    ) : (
                      rowData.map((row, rowIndex) => {
                      const isYearStart = rowIndex === 0 || row.year !== previousYear;
                      if (isYearStart) yearBandIndex += 1;
                      const rowClassName = [
                        "foliar-analysis-table-card__row",
                        yearBandIndex % 2 === 0
                          ? "foliar-analysis-table-card__row--year-band-a"
                          : "foliar-analysis-table-card__row--year-band-b",
                        isYearStart ? "foliar-analysis-table-card__row--year-start" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      previousYear = row.year;

                      return (
                        <tr key={buildRowKey(row, rowIndex)} className={rowClassName}>
                          {columns.map((column) => {
                            const cellValue =
                              column.field === "year" && !isYearStart ? "" : row[column.field];
                            return (
                              <td
                                key={`${buildRowKey(row, rowIndex)}-${column.field}`}
                                className={column.tone ? `foliar-analysis-table-card__col--${column.tone}` : ""}
                              >
                                {renderCellValue(cellValue)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div
                ref={pillScrollbarRef}
                className={`foliar-analysis-table-card__pill-scrollbar${
                  horizontalScrollState.isScrollable ? " foliar-analysis-table-card__pill-scrollbar--active" : ""
                }`}
                onPointerDown={handlePillScrollbarPointerDown}
                aria-hidden="true"
              >
                <div
                  className="foliar-analysis-table-card__pill-scrollbar-thumb"
                  style={thumbStyle}
                  onPointerDown={handleThumbPointerDown}
                  onPointerMove={handleThumbPointerMove}
                  onPointerUp={handleThumbPointerUp}
                  onPointerCancel={handleThumbPointerUp}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoliarAnalysisTableCard;
