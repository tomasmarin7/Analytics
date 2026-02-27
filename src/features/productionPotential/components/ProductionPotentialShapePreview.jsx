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
            key={`${segment.variedad}-${segment.part}-${index}`}
            className={`production-potential-shape-preview__segment production-potential-shape-preview__segment--${segment.part}`}
            style={{
              flexBasis: `${Math.max(0, segment.sharePercent ?? 0)}%`,
              background: segment.color,
            }}
            title={`${segment.variedad} · ${segment.part}: ${segment.kgHa} kg/ha`}
          >
            {showLabels ? (
              <>
                <span className="production-potential-shape-preview__segment-title">
                  {segment.part === "laterales" ? `${segment.variedad}/Lateral` : segment.variedad}
                </span>
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
