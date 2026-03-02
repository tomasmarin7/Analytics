import "./porcionesFrios.css";

const TOTAL_BAR_HEIGHT_PX = 80;
const BAR_GAP_PX = 3;
const DAY_MS = 86400000;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const PorcionesFriosLayer = ({
  bars = [],
  chartStartMs,
  chartEndMs,
  maxAccumulatedPortions = 1,
  viewStartMs,
  viewEndMs,
  viewSpanMs,
  currentDate,
  isForeground = false,
  onFocus,
  zIndex = 1,
}) => {
  if (!Array.isArray(bars) || !bars.length) return null;
  if (!Number.isFinite(chartStartMs) || !Number.isFinite(chartEndMs)) return null;
  if (!Number.isFinite(viewStartMs) || !Number.isFinite(viewEndMs) || !Number.isFinite(viewSpanMs) || viewSpanMs <= 0) {
    return null;
  }

  const visibleStartMs = Math.max(chartStartMs, viewStartMs);
  const visibleEndMs = Math.min(chartEndMs, viewEndMs);
  const visibleSpanMs = visibleEndMs - visibleStartMs + DAY_MS;

  if (visibleEndMs < visibleStartMs) return null;

  const leftPercent = clamp(((visibleStartMs - viewStartMs) / viewSpanMs) * 100, 0, 100);
  const rightPercent = clamp((((visibleEndMs + DAY_MS) - viewStartMs) / viewSpanMs) * 100, 0, 100);

  return (
    <div
      className={`lower-dots-bridge__porciones-frios${
        isForeground ? " lower-dots-bridge__porciones-frios--foreground" : " lower-dots-bridge__porciones-frios--background"
      }`}
      style={{
        left: `${leftPercent}%`,
        width: `${Math.max(0, rightPercent - leftPercent)}%`,
        zIndex,
      }}
      aria-hidden="true"
      onPointerDown={onFocus}
    >
      <div className="lower-dots-bridge__porciones-frios-bars">
        {bars
          .filter((bar) => bar.endMs >= visibleStartMs && bar.startMs <= visibleEndMs)
          .map((bar, index) => {
            const clippedStartMs = Math.max(bar.startMs, visibleStartMs);
            const clippedEndMs = Math.min(bar.endMs, visibleEndMs + DAY_MS - 1);
            const leftPercentInside = clamp(((clippedStartMs - visibleStartMs) / visibleSpanMs) * 100, 0, 100);
            const widthPercentInside = clamp((((clippedEndMs - clippedStartMs) + 1) / visibleSpanMs) * 100, 0, 100);
            const currentDateMs =
              currentDate instanceof Date && !Number.isNaN(currentDate.getTime())
                ? Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
                : null;
            const isCompleted = currentDateMs !== null && currentDateMs > bar.endMs;
            const darkHeightPx = Math.max(
              0,
              Math.min(
                TOTAL_BAR_HEIGHT_PX - BAR_GAP_PX,
                (bar.accumulatedPortions / maxAccumulatedPortions) * (TOTAL_BAR_HEIGHT_PX - BAR_GAP_PX),
              ),
            );
            const lightHeightPx = isCompleted
              ? Math.max(0, TOTAL_BAR_HEIGHT_PX - darkHeightPx - BAR_GAP_PX)
              : TOTAL_BAR_HEIGHT_PX;

            return (
              <span
                key={bar.id ?? `porciones-frios-bar-${index}`}
                className={`lower-dots-bridge__porciones-frios-bar-stack${
                  isCompleted ? " lower-dots-bridge__porciones-frios-bar-stack--with-fill" : ""
                }`}
                style={{
                  left: `${leftPercentInside}%`,
                  width: `${widthPercentInside}%`,
                }}
              >
                <span
                  className="lower-dots-bridge__porciones-frios-bar"
                  style={{ height: `${lightHeightPx}px` }}
                />
                {isCompleted ? (
                  <span
                    className="lower-dots-bridge__porciones-frios-bar-fill"
                    style={{ height: `${darkHeightPx}px` }}
                  />
                ) : null}
              </span>
            );
          })}
      </div>
    </div>
  );
};

export default PorcionesFriosLayer;
