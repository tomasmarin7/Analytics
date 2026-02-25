import "./YearSelector.css";

const YearSelector = ({
  yearPickerRef,
  availableYears,
  selectedYears,
  isYearMenuOpen,
  onToggleMenu,
  onToggleYear,
}) => (
  <div ref={yearPickerRef} className="data-records-section__year-picker">
    <button
      type="button"
      className="data-records-section__year-trigger"
      onClick={onToggleMenu}
      disabled={!availableYears.length}
      aria-label="Seleccionar años"
      title="Seleccionar años"
    />

    {isYearMenuOpen && availableYears.length > 0 && (
      <div className="data-records-section__year-menu">
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
      </div>
    )}
  </div>
);

export default YearSelector;
