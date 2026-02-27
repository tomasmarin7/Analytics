import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import flechaSidePopover from "../assets/images/flecha-side-pop-over.png";

const getStartOfYear = (year) => new Date(year, 0, 1);
const getEndOfYear = (year) => new Date(year, 11, 31);

const getDayOfYear = (date) => {
  const start = getStartOfYear(date.getFullYear());
  const diffMs = date.getTime() - start.getTime();
  return Math.floor(diffMs / 86400000) + 1;
};

const buildDateFromYearDay = (year, dayOfYear) => {
  const date = getStartOfYear(year);
  date.setDate(dayOfYear);
  return date;
};

const formatDate = (date) =>
  new Intl.DateTimeFormat("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

const THUMB_HIT_RADIUS_PX = 18;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const DateSidePopover = ({ currentDate, onCurrentDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sliderRef = useRef(null);
  const draggingRef = useRef(false);
  const safeCurrentDate = currentDate instanceof Date && !Number.isNaN(currentDate.getTime()) ? currentDate : new Date();
  const currentYear = safeCurrentDate.getFullYear();
  const maxDay = useMemo(() => getDayOfYear(getEndOfYear(currentYear)), [currentYear]);
  const dayOfYear = useMemo(() => getDayOfYear(safeCurrentDate), [safeCurrentDate]);
  const currentDateLabel = useMemo(() => formatDate(safeCurrentDate), [safeCurrentDate]);
  const sliderProgressPercent = useMemo(
    () => ((dayOfYear - 1) / Math.max(1, maxDay - 1)) * 100,
    [dayOfYear, maxDay],
  );

  const handleDayChange = useCallback((nextDay) => {
    if (!Number.isFinite(nextDay)) return;
    const clampedDay = clamp(Math.round(nextDay), 1, maxDay);
    onCurrentDateChange?.(buildDateFromYearDay(currentYear, clampedDay));
  }, [currentYear, maxDay, onCurrentDateChange]);

  const getDayFromClientX = useCallback((clientX) => {
    const slider = sliderRef.current;
    if (!slider) return null;

    const rect = slider.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return 1 + ratio * (maxDay - 1);
  }, [maxDay]);

  const isPointerOnThumb = useCallback((clientX) => {
    const slider = sliderRef.current;
    if (!slider) return false;

    const rect = slider.getBoundingClientRect();
    if (rect.width <= 0) return false;
    const ratio = (dayOfYear - 1) / Math.max(1, maxDay - 1);
    const thumbX = rect.left + ratio * rect.width;
    return Math.abs(clientX - thumbX) <= THUMB_HIT_RADIUS_PX;
  }, [dayOfYear, maxDay]);

  const handlePointerMove = useCallback((event) => {
    if (!draggingRef.current) return;
    const nextDay = getDayFromClientX(event.clientX);
    if (nextDay === null) return;
    handleDayChange(nextDay);
  }, [getDayFromClientX, handleDayChange]);

  const stopDrag = useCallback(() => {
    draggingRef.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDrag);
    window.removeEventListener("pointercancel", stopDrag);
  }, [handlePointerMove]);

  const handlePointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    if (!isPointerOnThumb(event.clientX)) return;

    draggingRef.current = true;
    const slider = sliderRef.current;
    slider?.setPointerCapture?.(event.pointerId);
    const nextDay = getDayFromClientX(event.clientX);
    if (nextDay !== null) {
      handleDayChange(nextDay);
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
  }, [getDayFromClientX, handleDayChange, handlePointerMove, isPointerOnThumb, stopDrag]);

  useEffect(() => () => {
    draggingRef.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDrag);
    window.removeEventListener("pointercancel", stopDrag);
  }, [handlePointerMove, stopDrag]);

  const handleSliderChange = (event) => {
    const nextDay = Number(event.target.value);
    handleDayChange(nextDay);
  };

  return (
    <section
      className={`date-side-popover ${isOpen ? "date-side-popover--open" : ""}`}
      aria-label="Control de fecha actual"
    >
      <div className="date-side-popover__sheet">
        <div className="date-side-popover__content">
          <h3 className="date-side-popover__title">Fecha actual simulada</h3>
          <p className="date-side-popover__date">{currentDateLabel}</p>
          <input
            ref={sliderRef}
            className="date-side-popover__slider"
            type="range"
            min={1}
            max={maxDay}
            step={1}
            value={dayOfYear}
            onChange={handleSliderChange}
            onPointerDown={handlePointerDown}
            style={{ "--date-slider-progress": `${sliderProgressPercent}%` }}
            aria-label="Seleccionar día del año"
          />
          <div className="date-side-popover__legend">
            <span>1 Ene</span>
            <span>31 Dic</span>
          </div>
        </div>
      </div>

      <button
        className="date-side-popover__toggle"
        type="button"
        aria-label={isOpen ? "Cerrar control de fecha" : "Abrir control de fecha"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <img
          className={`date-side-popover__icon ${isOpen ? "date-side-popover__icon--left" : ""}`}
          src={flechaSidePopover}
          alt=""
          aria-hidden="true"
        />
      </button>
    </section>
  );
};

export default DateSidePopover;
