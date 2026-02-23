import { createRoot } from "react-dom/client";
import Header from "./components/Header";
import SidePopover from "./components/SidePopover";
import LowerDotsBridge from "./components/LowerDotsBridge";
import "./index.css";

const App = () => {
  return (
    <div className="app">
      <Header />
      <main className="app__content">
        <SidePopover />
        <LowerDotsBridge />
      </main>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
