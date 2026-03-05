import "./YearChipsColumn.css";

const YearChipsColumn = ({ availableYears = [], selectedYears = [], onToggleYear }) => (
  <div className="data-records-years-panel data-records-years-panel--vertical" aria-label="Anos disponibles">
    <div className="data-records-section__years-column">
      {availableYears.map((year) => {
        const isSelected = selectedYears.includes(year);
        return (
          <button
            key={year}
            type="button"
            className={`data-records-section__year-chip-vertical${
              isSelected ? " data-records-section__year-chip-vertical--selected" : ""
            }`}
            onClick={() => onToggleYear(year)}
          >
            {year}
          </button>
        );
      })}
    </div>
  </div>
);

export default YearChipsColumn;
