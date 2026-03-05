const PestanaBoton = ({ id, label, variant, isActive, onClick, setButtonRef }) => {
  return (
    <button
      id={`botones-pestanas-${id}`}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls="botones-pestanas-panel"
      className={`botones-pestanas__vignette botones-pestanas__vignette--${variant} ${
        isActive ? "botones-pestanas__vignette--active" : ""
      }`}
      onClick={onClick}
      ref={setButtonRef}
    >
      <span className="botones-pestanas__vignette-label">{label}</span>
    </button>
  );
};

export default PestanaBoton;
