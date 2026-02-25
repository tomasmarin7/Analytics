import "./YearIndexColumn.css";

const YearIndexColumn = ({ years }) => (
  <div className="data-records-section__years">
    <table className="data-records-section__years-table" role="presentation" aria-hidden="true">
      <thead>
        <tr>
          <th>Temp.</th>
        </tr>
      </thead>
      <tbody>
        {years.map((year) => (
          <tr key={year}>
            <td>{year}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default YearIndexColumn;
