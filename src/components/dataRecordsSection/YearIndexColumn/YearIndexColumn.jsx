import "./YearIndexColumn.css";

const YearIndexColumn = ({ years, rowYears = [], yearHeaderLabel = "Temp." }) => {
  const labelsByRow = (() => {
    if (!rowYears.length) return years;

    const labels = Array.from({ length: rowYears.length }, () => "");
    let groupStart = 0;

    for (let index = 1; index <= rowYears.length; index += 1) {
      const currentYear = rowYears[groupStart];
      const nextYear = rowYears[index];
      if (nextYear !== currentYear) {
        const groupSize = index - groupStart;
        const middleRowIndex = groupStart + Math.floor((groupSize - 1) / 2);
        labels[middleRowIndex] = currentYear;
        groupStart = index;
      }
    }

    return labels;
  })();

  let previousYear = null;
  let yearBandIndex = -1;

  return (
    <div className="data-records-section__years">
      <table className="data-records-section__years-table" role="presentation" aria-hidden="true">
        <thead>
          <tr>
            <th>{yearHeaderLabel}</th>
          </tr>
        </thead>
        <tbody>
          {labelsByRow.map((yearLabel, index) => {
            const rowYear = rowYears[index];
            const isYearStart = index === 0 || rowYear !== previousYear;
            if (isYearStart) yearBandIndex += 1;
            const rowClassName = [
              "data-records-section__years-row",
              yearBandIndex % 2 === 0
                ? "data-records-section__years-row--band-a"
                : "data-records-section__years-row--band-b",
              isYearStart ? "data-records-section__years-row--year-start" : "",
            ]
              .filter(Boolean)
              .join(" ");
            previousYear = rowYear;

            return (
              <tr key={`${yearLabel}-${index}`} className={rowClassName}>
                <td>{yearLabel}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default YearIndexColumn;
