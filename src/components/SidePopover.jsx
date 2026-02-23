import { useState } from "react";
import Mapa from "./Mapa";
import mapaCompletoHuerto from "../../mapa_completo_huerto.json";

const MAP_COORDINATE = { lat: -35.80658, lng: -71.807608 };
const MAP_ZOOM = 15;

const SidePopover = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={`side-popover ${isOpen ? "side-popover--open" : ""}`} aria-label="Panel lateral flotante">
      <div className="side-popover__sheet">
        <div className="side-popover__content">
          <Mapa
            coordinate={MAP_COORDINATE}
            zoom={MAP_ZOOM}
            isVisible={isOpen}
            polygons={mapaCompletoHuerto}
          />
        </div>
      </div>

      <button
        className="side-popover__toggle"
        type="button"
        aria-label={isOpen ? "Cerrar panel lateral" : "Abrir panel lateral"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <img
          className={`side-popover__icon ${isOpen ? "side-popover__icon--left" : ""}`}
          src="/flecha-side-pop-over.png"
          alt=""
          aria-hidden="true"
        />
      </button>
    </section>
  );
};

export default SidePopover;
