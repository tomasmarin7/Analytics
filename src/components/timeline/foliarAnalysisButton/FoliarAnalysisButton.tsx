import "./FoliarAnalysisButton.css";

type FoliarAnalysisButtonProps = {
  leftPercent: number;
  onClick?: () => void;
};

const FoliarAnalysisButton = ({ leftPercent, onClick }: FoliarAnalysisButtonProps) => (
  <button
    type="button"
    className="lower-dots-bridge__diamond-button"
    style={{ left: `${leftPercent}%` }}
    onClick={onClick}
    aria-label="Análisis Foliar"
    title="Análisis Foliar"
  >
    <span className="lower-dots-bridge__diamond-shape" aria-hidden="true" />
    <span className="lower-dots-bridge__diamond-stem" aria-hidden="true" />
    <span className="lower-dots-bridge__diamond-label" aria-hidden="true">
      Análisis Foliar
    </span>
  </button>
);

export default FoliarAnalysisButton;
