import React, { useEffect, useState } from "react";
import Widget from "./components/Widget";
import Settings from "./components/Settings";
import "./App.css";

function App() {
  const [mode, setMode] = useState<"widget" | "settings">("widget");

  useEffect(() => {
    // Get the mode from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get("mode");

    if (urlMode === "settings") {
      setMode("settings");
    } else {
      setMode("widget");
    }
  }, []);

  return (
    <div className="app-container draggable">
      {mode === "widget" ? <Widget /> : <Settings />}
    </div>
  );
}

export default App;
