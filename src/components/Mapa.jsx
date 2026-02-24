import { useEffect, useRef, useState } from "react";

const DEFAULT_COORDINATE = { lat: -35.80658, lng: -71.807608 };
const DEFAULT_ZOOM = 18;
const SCRIPT_ID = "google-maps-javascript-api";
const POLYGON_FILL_SELECTED_OPACITY = 1;

let googleMapsLoaderPromise;

const waitForGoogleMapsReady = (timeoutMs = 10000, intervalMs = 50) =>
  new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (window.google?.maps?.Map) {
        resolve(window.google.maps);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error("Google Maps no terminó de inicializar correctamente."));
        return;
      }

      window.setTimeout(check, intervalMs);
    };

    check();
  });

const loadGoogleMaps = (apiKey) => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps solo está disponible en el navegador."));
  }

  if (window.google?.maps?.Map) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsLoaderPromise) {
    return googleMapsLoaderPromise;
  }

  googleMapsLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      if (window.google?.maps?.Map) {
        resolve(window.google.maps);
        return;
      }
      existingScript.addEventListener("load", () => {
        waitForGoogleMapsReady().then(resolve).catch(reject);
      }, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("No se pudo cargar Google Maps.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      waitForGoogleMapsReady().then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps."));
    document.head.appendChild(script);
  });

  googleMapsLoaderPromise = googleMapsLoaderPromise.catch((error) => {
    googleMapsLoaderPromise = undefined;
    throw error;
  });

  return googleMapsLoaderPromise;
};

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

  return polygonPath.map((point) => ({
    lat: Number(point.lat),
    lng: Number(point.lng),
  }));
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

const Mapa = ({
  coordinate = DEFAULT_COORDINATE,
  zoom = DEFAULT_ZOOM,
  isVisible = true,
  polygons = [],
  onPolygonSelect,
}) => {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const polygonRefs = useRef([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedPolygonId, setSelectedPolygonId] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError("Configura VITE_GOOGLE_MAPS_API_KEY para visualizar el mapa.");
      setIsLoading(false);
      return undefined;
    }

    setError("");
    setIsLoading(true);
    setIsMapReady(false);
    let cancelled = false;
    const previousAuthHandler = window.gm_authFailure;

    window.gm_authFailure = () => {
      if (!cancelled) {
        setError("La API key de Google Maps fue rechazada (auth/billing/restricciones).");
        setIsLoading(false);
      }
      if (typeof previousAuthHandler === "function") {
        previousAuthHandler();
      }
    };

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapElementRef.current) {
          return;
        }

        if (!maps?.Map) {
          throw new Error("Google Maps no terminó de inicializar correctamente.");
        }

        mapRef.current = new maps.Map(mapElementRef.current, {
          center: coordinate,
          zoom,
          mapTypeId: "satellite",
          gestureHandling: "none",
          disableDefaultUI: true,
          keyboardShortcuts: false,
          scrollwheel: false,
          draggable: false,
          disableDoubleClickZoom: true,
          clickableIcons: false,
        });

        maps.event.addListenerOnce(mapRef.current, "idle", () => {
          if (!cancelled) {
            setIsMapReady(true);
            setIsLoading(false);
          }
        });
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError.message);
          setIsMapReady(false);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      window.gm_authFailure = previousAuthHandler;
      polygonRefs.current.forEach(({ polygon }) => polygon.setMap(null));
      polygonRefs.current = [];
      mapRef.current = null;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setCenter(coordinate);
    mapRef.current.setZoom(zoom);
  }, [coordinate, zoom]);

  useEffect(() => {
    if (!mapRef.current || !isVisible || !window.google?.maps?.event) {
      return;
    }

    window.google.maps.event.trigger(mapRef.current, "resize");
    mapRef.current.setCenter(coordinate);
  }, [isVisible, coordinate]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !mapElementRef.current) {
      return;
    }

    const mapElement = mapElementRef.current;
    let isMiddlePanning = false;
    let previousX = 0;
    let previousY = 0;

    const handleMouseDown = (event) => {
      if (event.button !== 1) {
        return;
      }

      event.preventDefault();
      isMiddlePanning = true;
      previousX = event.clientX;
      previousY = event.clientY;
      mapElement.style.cursor = "grabbing";
    };

    const handleMouseMove = (event) => {
      if (!isMiddlePanning) {
        return;
      }

      event.preventDefault();
      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;
      previousX = event.clientX;
      previousY = event.clientY;
      mapRef.current.panBy(-deltaX, -deltaY);
    };

    const stopMiddlePan = () => {
      if (!isMiddlePanning) {
        return;
      }

      isMiddlePanning = false;
      mapElement.style.cursor = "";
    };

    const handleWheel = (event) => {
      if (!event.altKey) {
        return;
      }

      event.preventDefault();
      const currentZoom = mapRef.current.getZoom() ?? zoom;
      const zoomDelta = event.deltaY < 0 ? 1 : -1;
      const nextZoom = Math.min(22, Math.max(1, currentZoom + zoomDelta));
      mapRef.current.setZoom(nextZoom);
    };

    const handleAuxClick = (event) => {
      if (event.button === 1) {
        event.preventDefault();
      }
    };

    mapElement.addEventListener("mousedown", handleMouseDown);
    mapElement.addEventListener("mousemove", handleMouseMove);
    mapElement.addEventListener("mouseup", stopMiddlePan);
    mapElement.addEventListener("mouseleave", stopMiddlePan);
    mapElement.addEventListener("auxclick", handleAuxClick);
    window.addEventListener("mouseup", stopMiddlePan);
    mapElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      mapElement.removeEventListener("mousedown", handleMouseDown);
      mapElement.removeEventListener("mousemove", handleMouseMove);
      mapElement.removeEventListener("mouseup", stopMiddlePan);
      mapElement.removeEventListener("mouseleave", stopMiddlePan);
      mapElement.removeEventListener("auxclick", handleAuxClick);
      window.removeEventListener("mouseup", stopMiddlePan);
      mapElement.removeEventListener("wheel", handleWheel);
    };
  }, [isMapReady, zoom]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !window.google?.maps?.Polygon) {
      return;
    }

    const clearPolygons = () => {
      polygonRefs.current.forEach(({ polygon }) => polygon.setMap(null));
      polygonRefs.current = [];
    };

    clearPolygons();
    setSelectedPolygonId(null);
    onPolygonSelect?.(null);

    const normalizedPolygons = collectPolygonPaths(polygons);

    normalizedPolygons.forEach((path, polygonId) => {
      const polygon = new window.google.maps.Polygon({
        paths: path,
        strokeColor: "#ffffff",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#ffffff",
        fillOpacity: 0,
        clickable: true,
        geodesic: false,
      });

      polygon.setMap(mapRef.current);
      polygon.addListener("click", () => {
        setSelectedPolygonId(polygonId);
        onPolygonSelect?.(polygonId);
      });

      polygonRefs.current.push({ polygonId, polygon });
    });

    return () => {
      clearPolygons();
    };
  }, [polygons, isMapReady]);

  useEffect(() => {
    polygonRefs.current.forEach(({ polygonId, polygon }) => {
      polygon.setOptions({
        fillOpacity: selectedPolygonId === polygonId ? POLYGON_FILL_SELECTED_OPACITY : 0,
      });
    });
  }, [selectedPolygonId]);

  return (
    <div className="side-popover__map-card" aria-label="Mapa satelital">
      {error ? (
        <div className="side-popover__map-fallback">{error}</div>
      ) : (
        <>
          <div className="side-popover__map-canvas" ref={mapElementRef} />
          {isLoading ? <div className="side-popover__map-loading">Cargando mapa satelital...</div> : null}
        </>
      )}
    </div>
  );
};

export default Mapa;
