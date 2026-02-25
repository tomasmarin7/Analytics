import { useState } from "react";
import { createRoot } from "react-dom/client";
import Header from "../components/header/Header";
import SidePopover from "../components/SidePopover";
import TimelineControls from "../components/TimelineControls";
import "./index.css";

const App = () => {
  const [activeEventId, setActiveEventId] = useState(null);
  const [selectedCuartel, setSelectedCuartel] = useState(null);
  const [selectedYears, setSelectedYears] = useState([]);
  const selectedHuerto = "Huerto";

  const handleTimelineEventToggle = (eventId) => {
    setActiveEventId((current) => (current === eventId ? null : eventId));
  };

  return (
    <div className="app">
      <Header />
      <main className="app__content">
        <SidePopover onSelectedCuartelChange={setSelectedCuartel} />
        <TimelineControls
          activeEventId={activeEventId}
          onTimelineEventToggle={handleTimelineEventToggle}
          selectedHuerto={selectedHuerto}
          selectedCuartel={selectedCuartel}
          selectedYears={selectedYears}
          onSelectedYearsChange={setSelectedYears}
        />
      </main>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
