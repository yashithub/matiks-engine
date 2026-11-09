import { useState } from "react";
import { terminateOCR } from "../ocr/ocr-engine.js";

export default function Settings({ settings, onSaveSettings, onClearHistory }) {
  const [current, setCurrent] = useState({ ...settings });
  const [savedNotice, setSavedNotice] = useState(false);
  const [workerNotice, setWorkerNotice] = useState("");

  function handleChange(key, value) {
    setCurrent((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSaveSettings(current);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  }

  async function handleRestartWorker() {
    try {
      setWorkerNotice("Terminating worker instance...");
      await terminateOCR();
      setWorkerNotice("Worker terminated. It will cleanly re-initialize on next recognition.");
      setTimeout(() => setWorkerNotice(""), 3500);
    } catch (e) {
      setWorkerNotice(`Error resetting worker: ${e.message}`);
    }
  }

  return (
    <div className="tab-pane settings-view">
      <div className="section-header">
        <div>
          <h2>System Configuration</h2>
          <p className="subtitle">Tune OCR pipeline parameters, image filters, and manage local storage cache.</p>
        </div>
        <button className="btn-primary" onClick={handleSave}>
          💾 Save Changes
        </button>
      </div>

      {savedNotice && (
        <div className="alert alert-success">
          Settings successfully saved to local browser storage.
        </div>
      )}

      {workerNotice && (
        <div className="alert alert-warning">
          {workerNotice}
        </div>
      )}

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <h3>OCR Engine Settings</h3>
          </div>

          <div className="settings-field">
            <label>Character Whitelist</label>
            <input
              type="text"
              className="input-field monospace"
              value={current.charWhitelist}
              onChange={(e) => handleChange("charWhitelist", e.target.value)}
            />
            <span className="field-hint">Restricts Tesseract glyph detection to arithmetic tokens.</span>
          </div>

          <div className="settings-field">
            <label>Default Recognition Pipeline</label>
            <select
              value={current.defaultMode}
              onChange={(e) => handleChange("defaultMode", e.target.value)}
            >
              <option value="consensus">Consensus Multi-Pass (Verification Layer)</option>
              <option value="grayscale">Enhanced Grayscale</option>
              <option value="otsu">Otsu Global Threshold</option>
              <option value="adaptive">Dynamic Adaptive Threshold</option>
            </select>
            <span className="field-hint">Initial mode applied when uploading new images.</span>
          </div>

          <div className="settings-field">
            <label>Worker Lifecycle Management</label>
            <button className="btn-secondary" onClick={handleRestartWorker}>
              🔄 Recycle Tesseract Worker
            </button>
            <span className="field-hint">Releases worker memory and resets internal Tesseract engine state.</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Image Preprocessing Tuning</h3>
          </div>

          <div className="settings-field">
            <label>Quiet Zone Padding (px)</label>
            <input
              type="number"
              min="0"
              max="80"
              className="input-field"
              value={current.padding}
              onChange={(e) => handleChange("padding", Number(e.target.value))}
            />
            <span className="field-hint">Uniform whitespace border around characters (Tesseract needs $\ge$24px).</span>
          </div>

          <div className="settings-field">
            <label>Normalized Target Width (px)</label>
            <input
              type="number"
              min="600"
              max="2400"
              step="100"
              className="input-field"
              value={current.targetWidth}
              onChange={(e) => handleChange("targetWidth", Number(e.target.value))}
            />
            <span className="field-hint">Scales glyph heights to ~35-50px for optimal neural net extraction.</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Local Data & Cache</h3>
          </div>

          <p className="text-muted text-sm">
            All recognition histories and benchmark evaluations are stored privately on your local browser. No cloud analytics or third-party APIs are called.
          </p>

          <div className="mt-4">
            <button
              className="btn-danger"
              onClick={() => {
                if (confirm("Are you sure you want to clear your local recognition history?")) {
                  onClearHistory();
                }
              }}
            >
              🗑️ Clear Local History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

