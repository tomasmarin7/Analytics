import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Header from "../components/header/Header";
import SidePopover from "../components/SidePopover";
import DateSidePopover from "../components/DateSidePopover";
import TimelineControls from "../components/TimelineControls";
import "./index.css";

const App = () => {
  const [activeEventIds, setActiveEventIds] = useState([]);
  const [selectedCuartel, setSelectedCuartel] = useState(null);
  const [selectedYears, setSelectedYears] = useState([]);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const selectedHuerto = "Huerto";

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    const syncViewportMetrics = () => {
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const rootStyle = document.documentElement.style;

      rootStyle.setProperty("--app-viewport-height", `${viewportHeight}px`);
      rootStyle.setProperty("--app-viewport-width", `${viewportWidth}px`);
    };

    syncViewportMetrics();
    window.addEventListener("resize", syncViewportMetrics);
    window.visualViewport?.addEventListener("resize", syncViewportMetrics);

    return () => {
      window.removeEventListener("resize", syncViewportMetrics);
      window.visualViewport?.removeEventListener("resize", syncViewportMetrics);
    };
  }, []);

  const handleTimelineEventToggle = (eventId) => {
    setActiveEventIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  };

  return (
    <div className="app">
      <Header />
      <main className="app__content">
        <SidePopover onSelectedCuartelChange={setSelectedCuartel} />
        <DateSidePopover currentDate={currentDate} onCurrentDateChange={setCurrentDate} />
        <TimelineControls
          activeEventIds={activeEventIds}
          onTimelineEventToggle={handleTimelineEventToggle}
          selectedHuerto={selectedHuerto}
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
          onSelectedYearsChange={setSelectedYears}
          currentDate={currentDate}
        />
      </main>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
