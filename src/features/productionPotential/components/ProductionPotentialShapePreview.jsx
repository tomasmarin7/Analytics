import "./ProductionPotentialShapePreview.css";

const formatKgHa = (value) =>
  new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const ProductionPotentialShapePreview = ({ visual, showLabels = true }) => {
  if (!visual || !Array.isArray(visual.segments) || visual.segments.length === 0) return null;

  return (
    <div className="production-potential-shape-preview" aria-hidden="true">
      <span className="production-potential-shape-preview__baseline" />

      <div className="production-potential-shape-preview__stacked">
        {visual.segments.map((segment, index) => (
          <div
            key={`${segment.variedad}-${index}`}
            className="production-potential-shape-preview__segment"
            style={{
              flexBasis: `${Math.max(0, segment.sharePercent ?? 0)}%`,
              background: segment.color,
              color: segment.textColor,
            }}
            title={`${segment.variedad}: ${segment.kgHa} kg/ha`}
          >
            {showLabels ? (
              <>
                <span className="production-potential-shape-preview__segment-title">{segment.variedad}</span>
                <span className="production-potential-shape-preview__segment-value">
                  {formatKgHa(segment.kgHa)} kg/ha
                </span>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionPotentialShapePreview;
