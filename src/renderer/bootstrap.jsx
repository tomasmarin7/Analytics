import { useState } from "react";
import { createRoot } from "react-dom/client";
import Header from "../components/header/Header";
import SidePopover from "../components/SidePopover";
import TimelineControls from "../components/TimelineControls";
import FoliarAnalysisPanel from "../components/foliarAnalysis/FoliarAnalysisPanel";
import { FOLIAR_ANALYSIS_EVENT_ID } from "../components/timeline/eventMarker/eventsConfig";
import "./index.css";

const App = () => {
  const [activeEventId, setActiveEventId] = useState(null);

  const handleTimelineEventToggle = (eventId) => {
    setActiveEventId((current) => (current === eventId ? null : eventId));
  };

  return (
    <div className="app">
      <Header />
      <main className="app__content">
        {activeEventId === FOLIAR_ANALYSIS_EVENT_ID && <FoliarAnalysisPanel />}
        <SidePopover />
        <TimelineControls activeEventId={activeEventId} onTimelineEventToggle={handleTimelineEventToggle} />
      </main>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
