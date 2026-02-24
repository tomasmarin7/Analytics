import { createRoot } from "react-dom/client";
import Header from "./components/header/Header";
import SidePopover from "./components/SidePopover";
import TimelineControls from "./components/TimelineControls";
import "./index.css";

const App = () => {
  return (
    <div className="app">
      <Header />
      <main className="app__content">
        <SidePopover />
        <TimelineControls />
      </main>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
