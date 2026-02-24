import { useCallback, useMemo, useState } from "react";
import Mapa from "./Mapa";
import mapaCompletoHuerto from "../../mapa_completo_huerto.json";
import flechaSidePopover from "../assets/images/flecha-side-pop-over.png";
import foliarAnalysisRows from "../data/foliarAnalysisRows.json";

const MAP_COORDINATE = { lat: -35.80658, lng: -71.807608 };
const MAP_ZOOM = 15;

const isLatLngPoint = (value) => {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng);
};

const normalizePolygonPath = (polygonPath) => {
  if (!Array.isArray(polygonPath) || polygonPath.length < 3) {
    return null;
  }

  if (!polygonPath.every((point) => isLatLngPoint(point))) {
    return null;
  }

  return polygonPath;
};

const collectPolygonPaths = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  const directPath = normalizePolygonPath(value);
  if (directPath) {
    return [directPath];
  }

  return value.flatMap((item) => collectPolygonPaths(item));
};

const SidePopover = ({ onSelectedCuartelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableCuarteles = useMemo(
    () =>
      [...new Set(foliarAnalysisRows.map((row) => String(row.Cuartel ?? "").trim()).filter(Boolean))].sort(),
    []
  );
  const polygonPaths = useMemo(() => collectPolygonPaths(mapaCompletoHuerto), []);
  const polygonCuartelMap = useMemo(() => {
    const nextMap = {};

    polygonPaths.forEach((_, polygonId) => {
      nextMap[polygonId] =
        availableCuarteles[Math.floor(Math.random() * availableCuarteles.length)] ?? null;
    });

    return nextMap;
  }, [availableCuarteles, polygonPaths]);

  const handlePolygonSelect = useCallback(
    (polygonId) => {
      if (polygonId === null || polygonId === undefined) {
        onSelectedCuartelChange?.(null);
        return;
      }

      onSelectedCuartelChange?.(polygonCuartelMap[polygonId] ?? null);
    },
    [onSelectedCuartelChange, polygonCuartelMap]
  );

  return (
    <section className={`side-popover ${isOpen ? "side-popover--open" : ""}`} aria-label="Panel lateral flotante">
      <div className="side-popover__sheet">
        <div className="side-popover__content">
          <Mapa
            coordinate={MAP_COORDINATE}
            zoom={MAP_ZOOM}
            isVisible={isOpen}
            polygons={mapaCompletoHuerto}
            onPolygonSelect={handlePolygonSelect}
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
          src={flechaSidePopover}
          alt=""
          aria-hidden="true"
        />
      </button>
    </section>
  );
};

export default SidePopover;
