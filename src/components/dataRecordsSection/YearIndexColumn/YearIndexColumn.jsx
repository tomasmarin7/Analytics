import "./YearIndexColumn.css";

const YearIndexColumn = ({ years, yearHeaderLabel = "Temp." }) => (
  <div className="data-records-section__years">
    <table className="data-records-section__years-table" role="presentation" aria-hidden="true">
      <thead>
        <tr>
          <th>{yearHeaderLabel}</th>
        </tr>
      </thead>
      <tbody>
        {years.map((year, index) => (
          <tr key={`${year}-${index}`}>
            <td>{year}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default YearIndexColumn;
