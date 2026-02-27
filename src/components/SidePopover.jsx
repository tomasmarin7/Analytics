import { useCallback, useEffect, useMemo, useState } from "react";
import Mapa from "./Mapa";
import mapaCompletoHuerto from "../../mapa_completo_huerto.json";
import flechaSidePopover from "../assets/images/flecha-side-pop-over.png";
import foliarAnalysisRows from "../data/foliarAnalysisRows.json";

const MAP_COORDINATE = { lat: -35.80658, lng: -71.807608 };
const MAP_ZOOM = 15;
const POLYGON_CUARTEL_MAP_STORAGE_KEY = "polygonCuartelMap";

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

const createDeterministicPolygonCuartelMap = ({ availableCuarteles, polygonCount }) => {
  const nextMap = {};
  if (!Array.isArray(availableCuarteles) || availableCuarteles.length === 0) {
    return nextMap;
  }

  for (let polygonId = 0; polygonId < polygonCount; polygonId += 1) {
    nextMap[polygonId] = availableCuarteles[polygonId % availableCuarteles.length] ?? null;
  }

  return nextMap;
};

const buildPersistentPolygonCuartelMap = ({ rawStoredMap, availableCuarteles, polygonCount }) => {
  const storedMap = rawStoredMap && typeof rawStoredMap === "object" ? rawStoredMap : {};
  const fallbackMap = createDeterministicPolygonCuartelMap({ availableCuarteles, polygonCount });
  const availableCuartelesSet = new Set(availableCuarteles.map((value) => String(value).trim().toUpperCase()));
  const nextMap = {};

  for (let polygonId = 0; polygonId < polygonCount; polygonId += 1) {
    const rawCuartel = String(storedMap[polygonId] ?? "").trim();
    const normalizedCuartel = rawCuartel.toUpperCase();
    const hasValidStoredCuartel = rawCuartel && availableCuartelesSet.has(normalizedCuartel);

    nextMap[polygonId] = hasValidStoredCuartel ? rawCuartel : fallbackMap[polygonId] ?? null;
  }

  return nextMap;
};

const SidePopover = ({ onSelectedCuartelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [polygonCuartelMap, setPolygonCuartelMap] = useState({});
  const availableCuarteles = useMemo(
    () =>
      [...new Set(foliarAnalysisRows.map((row) => String(row.Cuartel ?? "").trim()).filter(Boolean))].sort(),
    []
  );
  const polygonPaths = useMemo(() => collectPolygonPaths(mapaCompletoHuerto), []);
  useEffect(() => {
    const polygonCount = polygonPaths.length;
    if (polygonCount === 0 || availableCuarteles.length === 0) {
      setPolygonCuartelMap({});
      return;
    }

    if (typeof window === "undefined") {
      setPolygonCuartelMap(createDeterministicPolygonCuartelMap({ availableCuarteles, polygonCount }));
      return;
    }

    let parsedStoredMap = null;
    try {
      const raw = window.localStorage.getItem(POLYGON_CUARTEL_MAP_STORAGE_KEY);
      parsedStoredMap = raw ? JSON.parse(raw) : null;
    } catch {
      parsedStoredMap = null;
    }

    setPolygonCuartelMap(
      buildPersistentPolygonCuartelMap({
        rawStoredMap: parsedStoredMap,
        availableCuarteles,
        polygonCount,
      })
    );
  }, [availableCuarteles, polygonPaths]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(POLYGON_CUARTEL_MAP_STORAGE_KEY, JSON.stringify(polygonCuartelMap));
    } catch {
      // noop: localStorage can fail in restricted contexts
    }
  }, [polygonCuartelMap]);

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
