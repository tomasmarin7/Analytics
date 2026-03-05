import "./ProductionPotentialShapePreview.css";

const formatKgHa = (value) =>
  new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const toRgba = (color, alpha) => {
  const normalizedColor = String(color ?? "").trim();
  const safeAlpha = Math.max(0, Math.min(1, Number(alpha)));

  const hexMatch = normalizedColor.match(/^#([\da-f]{3,8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const expandedHex =
      hex.length === 3 || hex.length === 4
        ? hex.split("").map((char) => `${char}${char}`).join("")
        : hex;

    if (expandedHex.length === 6 || expandedHex.length === 8) {
      const red = Number.parseInt(expandedHex.slice(0, 2), 16);
      const green = Number.parseInt(expandedHex.slice(2, 4), 16);
      const blue = Number.parseInt(expandedHex.slice(4, 6), 16);
      return `rgba(${red}, ${green}, ${blue}, ${safeAlpha})`;
    }
  }

  const rgbMatch = normalizedColor.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const channels = rgbMatch[1]
      .split(",")
      .map((channel) => channel.trim())
      .slice(0, 3)
      .map((channel) => Number(channel));

    if (channels.length === 3 && channels.every((channel) => Number.isFinite(channel))) {
      return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${safeAlpha})`;
    }
  }

  return normalizedColor;
};

const resolveSegmentBackground = (color, opacityGradient) => {
  if (!opacityGradient) {
    return color;
  }

  const startOpacity = opacityGradient.startOpacity ?? 1;
  const endOpacity = opacityGradient.endOpacity ?? 0.05;
  return `linear-gradient(90deg, ${toRgba(color, startOpacity)} 0%, ${toRgba(color, endOpacity)} 100%)`;
};

const ProductionPotentialShapePreview = ({
  visual,
  showLabels = true,
  showBaseline = true,
  className = "",
  opacityGradient = null,
}) => {
  if (!visual || !Array.isArray(visual.segments) || visual.segments.length === 0) return null;

  return (
    <div className={`production-potential-shape-preview ${className}`.trim()} aria-hidden="true">
      {showBaseline ? <span className="production-potential-shape-preview__baseline" /> : null}

      <div className="production-potential-shape-preview__stacked">
        {visual.segments.map((segment, index) => (
          <div
            key={`${segment.variedad}-${index}`}
            className="production-potential-shape-preview__segment"
            style={{
              flexBasis: `${Math.max(0, segment.sharePercent ?? 0)}%`,
              background: resolveSegmentBackground(segment.color, opacityGradient),
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
