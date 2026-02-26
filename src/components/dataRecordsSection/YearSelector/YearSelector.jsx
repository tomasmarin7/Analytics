import "./YearSelector.css";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const YearSelector = ({
  yearPickerRef,
  availableYears,
  selectedYears,
  isYearMenuOpen,
  onToggleMenu,
  onToggleYear,
  triggerLabel = "Temp.",
}) => {
  const triggerRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, minWidth: 260 });

  useLayoutEffect(() => {
    if (!isYearMenuOpen) return undefined;

    const updateMenuPosition = () => {
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      if (!triggerRect) return;

      const minWidth = Math.max(260, triggerRect.width * 2.8);
      const maxLeft = Math.max(12, window.innerWidth - minWidth - 12);
      const left = Math.min(maxLeft, Math.max(12, triggerRect.left));
      const top = triggerRect.bottom + 8;
      setMenuPosition({ top, left, minWidth });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isYearMenuOpen]);

  const menu =
    isYearMenuOpen && availableYears.length > 0
      ? createPortal(
          <div
            className="data-records-section__year-menu data-records-section__year-menu--portal"
            data-year-menu-root="true"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              minWidth: `${menuPosition.minWidth}px`,
            }}
          >
            {availableYears.map((year) => {
              const isSelected = selectedYears.includes(year);
              return (
                <button
                  key={year}
                  type="button"
                  className={`data-records-section__year-menu-item${
                    isSelected ? " data-records-section__year-menu-item--selected" : ""
                  }`}
                  onClick={() => onToggleYear(year)}
                >
                  {year}
                </button>
              );
            })}
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={yearPickerRef} className="data-records-section__year-picker">
      <button
        ref={triggerRef}
        type="button"
        className="data-records-section__year-trigger"
        onClick={onToggleMenu}
        disabled={!availableYears.length}
        aria-label="Seleccionar temporadas"
        title="Seleccionar temporadas"
      >
        {triggerLabel}
      </button>
      {menu}
    </div>
  );
};

export default YearSelector;
