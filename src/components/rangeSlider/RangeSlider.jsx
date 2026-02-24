import { RANGE_SLIDER_ARIA_LABEL } from "../timeline/constants";
import "./RangeSlider.css";

const RangeSlider = ({ sliderRef, leftHandleExpr, rightHandleExpr, startDrag, onHandleKeyDown }) => (
  <section className="lower-dots-bridge__extra" ref={sliderRef} aria-label={RANGE_SLIDER_ARIA_LABEL}>
    <span
      className="lower-dots-bridge__extra-band"
      style={{ left: leftHandleExpr, right: `calc(100% - ${rightHandleExpr})` }}
      onPointerDown={startDrag("band")}
    />

    <button
      type="button"
      className="lower-dots-bridge__extra-flag lower-dots-bridge__extra-flag--left"
      style={{ left: leftHandleExpr }}
      onPointerDown={startDrag("left")}
      onKeyDown={onHandleKeyDown("left")}
      aria-label="Mover handle izquierdo"
    >
      <span className="lower-dots-bridge__extra-flag-stem" />
      <span className="lower-dots-bridge__extra-flag-head" />
    </button>

    <button
      type="button"
      className="lower-dots-bridge__extra-flag lower-dots-bridge__extra-flag--right"
      style={{ left: rightHandleExpr }}
      onPointerDown={startDrag("right")}
      onKeyDown={onHandleKeyDown("right")}
      aria-label="Mover handle derecho"
    >
      <span className="lower-dots-bridge__extra-flag-stem" />
      <span className="lower-dots-bridge__extra-flag-head" />
    </button>
  </section>
);

export default RangeSlider;
