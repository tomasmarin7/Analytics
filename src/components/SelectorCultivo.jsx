const SelectorCultivo = () => {
  return (
    <button className="selector-cultivo" type="button" aria-label="Cerezo">
      <img className="selector-cultivo__icon" src="/icono-cerezo.png" alt="" aria-hidden="true" />
      <span className="selector-cultivo__label">Cerezo</span>
    </button>
  );
};

export default SelectorCultivo;
