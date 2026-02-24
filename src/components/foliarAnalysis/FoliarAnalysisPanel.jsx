import "./FoliarAnalysisPanel.css";

const FoliarAnalysisPanel = ({ eventLabel }) => (
  <section className="foliar-analysis" aria-hidden="true">
    <div className="foliar-analysis__bullet">
      <span className="foliar-analysis__bullet-title">{eventLabel}</span>
    </div>
  </section>
);

export default FoliarAnalysisPanel;
