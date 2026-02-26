import "./YearChipsBar.css";

const YearChipsBar = ({ availableYears = [], selectedYears = [], onToggleYear }) => (
  <div className="data-records-years-panel" aria-label="Años disponibles">
    <div className="data-records-section__years-strip">
      {availableYears.map((year) => {
        const isSelected = selectedYears.includes(year);
        return (
          <button
            key={year}
            type="button"
            className={`data-records-section__year-chip${isSelected ? " data-records-section__year-chip--selected" : ""}`}
            onClick={() => onToggleYear(year)}
          >
            {year}
          </button>
        );
      })}
    </div>
  </div>
);

export default YearChipsBar;
