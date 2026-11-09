import { useState, useEffect } from "react";
import Navigation from "./components/Navigation.jsx";
import Dashboard from "./components/Dashboard.jsx";
import OcrLab from "./components/OcrLab.jsx";
import BenchmarkLab from "./components/BenchmarkLab.jsx";
import Settings from "./components/Settings.jsx";
import { Storage } from "./utils/storage.js";
import { terminateOCR } from "./ocr/ocr-engine.js";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState(Storage.getSettings());
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [preloadedLabItem, setPreloadedLabItem] = useState(null);
  const [systemStatus, setSystemStatus] = useState("Engine Ready");

  // Load persistent history and benchmark on mount
  useEffect(() => {
    setHistory(Storage.getHistory());
    setBenchmarkData(Storage.getBenchmarkResults());

    // Worker cleanup on window unload
    const handleUnload = () => {
      terminateOCR();
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  function handleRecordHistory(item) {
    const updated = Storage.addHistoryItem(item);
    setHistory(updated);
  }

  function handleBenchmarkComplete(data) {
    Storage.saveBenchmarkResults(data);
    setBenchmarkData(data);
    setSystemStatus(`Benchmark evaluated (${data.summary.exactMatchRate}% exact)`);
  }

  function handleSaveSettings(newSettings) {
    Storage.saveSettings(newSettings);
    setSettings(newSettings);
  }

  function handleClearHistory() {
    Storage.clearHistory();
    setHistory([]);
  }

  function handleSelectHistoryItem(item) {
    setPreloadedLabItem(item);
    setActiveTab("ocr-lab");
  }

  return (
    <div className="matiks-app">
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        status={systemStatus}
      />

      <main className="content-container">
        {activeTab === "dashboard" && (
          <Dashboard
            history={history}
            benchmarkData={benchmarkData}
            onNavigate={setActiveTab}
            onSelectHistoryItem={handleSelectHistoryItem}
          />
        )}

        {activeTab === "ocr-lab" && (
          <OcrLab
            onRecordHistory={handleRecordHistory}
            preloadedItem={preloadedLabItem}
          />
        )}

        {activeTab === "benchmark" && (
          <BenchmarkLab
            onBenchmarkComplete={handleBenchmarkComplete}
            savedBenchmark={benchmarkData}
          />
        )}

        {activeTab === "settings" && (
          <Settings
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      <footer className="footer-bar">
        <span>MATIKS COMPANION · LOCAL OCR LAB · ZERO EXTERNAL API</span>
        <span>MANIFEST V3 READY</span>
      </footer>
    </div>
  );
}
