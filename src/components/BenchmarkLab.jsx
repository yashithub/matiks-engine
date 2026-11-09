import { useState } from "react";
import { BENCHMARK_DATASET } from "../benchmark/dataset.js";
import { runBenchmark } from "../benchmark/runner.js";

export default function BenchmarkLab({ onBenchmarkComplete, savedBenchmark }) {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("consensus"); // "consensus" | "grayscale" | "otsu" | "adaptive"
  const [subsetSize, setSubsetSize] = useState(25); // 25, 50, or 100
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [benchmarkResult, setBenchmarkResult] = useState(savedBenchmark || null);
  const [liveResults, setLiveResults] = useState([]);
  const [filterMismatchOnly, setFilterMismatchOnly] = useState(false);

  async function handleStartBenchmark() {
    if (running) return;

    setRunning(true);
    setLiveResults([]);
    const testSet = BENCHMARK_DATASET.slice(0, subsetSize);
    setProgress({ current: 0, total: testSet.length });

    try {
      const report = await runBenchmark({
        dataset: testSet,
        mode,
        onProgress: ({ current, total, result }) => {
          setProgress({ current, total });
          setLiveResults((prev) => [result, ...prev]);
        }
      });

      setBenchmarkResult(report);
      onBenchmarkComplete(report);
    } catch (err) {
      console.error("Benchmark failed:", err);
    } finally {
      setRunning(false);
    }
  }

  function handleExportJson() {
    if (!benchmarkResult) return;
    const blob = new Blob([JSON.stringify(benchmarkResult, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matiks-benchmark-${benchmarkResult.mode}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const displayedList = filterMismatchOnly
    ? (benchmarkResult?.results || liveResults).filter((r) => !r.isExact)
    : (benchmarkResult?.results || liveResults);

  return (
    <div className="tab-pane benchmark-view">
      <div className="section-header">
        <div>
          <h2>Benchmark & Accuracy Lab</h2>
          <p className="subtitle">Systematic ground-truth evaluation across 100+ typography, contrast, and operator permutations.</p>
        </div>
        {benchmarkResult && (
          <button className="btn-secondary" onClick={handleExportJson}>
            💾 Export Benchmark JSON
          </button>
        )}
      </div>

      <div className="card benchmark-controls-card">
        <div className="benchmark-controls-grid">
          <div className="control-group">
            <label>Recognition Pipeline</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={running}
            >
              <option value="consensus">Consensus Multi-Pass (Recommended)</option>
              <option value="grayscale">Enhanced Grayscale</option>
              <option value="otsu">Otsu Global Threshold</option>
              <option value="adaptive">Dynamic Adaptive Threshold</option>
            </select>
          </div>

          <div className="control-group">
            <label>Dataset Sample Count</label>
            <select
              value={subsetSize}
              onChange={(e) => setSubsetSize(Number(e.target.value))}
              disabled={running}
            >
              <option value="15">Quick Smoke Test (15 samples)</option>
              <option value="25">Standard Evaluation (25 samples)</option>
              <option value="50">Extended Evaluation (50 samples)</option>
              <option value="100">Full 100-Item Ground-Truth Suite</option>
            </select>
          </div>

          <div className="control-group action-col">
            <label>&nbsp;</label>
            <button
              className="btn-primary w-full"
              onClick={handleStartBenchmark}
              disabled={running}
            >
              {running ? `Running... (${progress.current}/${progress.total})` : "⚡ Execute Benchmark"}
            </button>
          </div>
        </div>

        {running && (
          <div className="progress-container">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <div className="progress-text">
              Processing sample {progress.current} of {progress.total} · Mode: {mode}
            </div>
          </div>
        )}
      </div>

      {benchmarkResult?.summary && (
        <div className="metric-grid">
          <div className="metric-card">
            <div className="metric-label">EXACT MATCH ACCURACY</div>
            <div className={`metric-value ${benchmarkResult.summary.exactMatchRate >= 80 ? "text-success" : "text-warning"}`}>
              {benchmarkResult.summary.exactMatchRate}%
            </div>
            <div className="metric-meta">{benchmarkResult.summary.exactMatchCount} of {benchmarkResult.summary.total} exact matches</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">CHARACTER ERROR RATE</div>
            <div className="metric-value text-accent">
              {benchmarkResult.summary.averageCER}
            </div>
            <div className="metric-meta">Normalized Levenshtein / length</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">DIGIT RECOGNITION ACCURACY</div>
            <div className="metric-value text-success">
              {benchmarkResult.summary.averageDigitAccuracy}%
            </div>
            <div className="metric-meta">Correctly detected digits</div>
          </div>

          <div className="metric-card">
            <div className="metric-label">MEDIAN LATENCY</div>
            <div className="metric-value">
              {benchmarkResult.summary.medianLatencyMs} ms
            </div>
            <div className="metric-meta">P90: {benchmarkResult.summary.p90LatencyMs} ms · Avg: {benchmarkResult.summary.avgLatencyMs} ms</div>
          </div>
        </div>
      )}

      {displayedList.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Test Case Iterations</h3>
            <div className="header-filters">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filterMismatchOnly}
                  onChange={(e) => setFilterMismatchOnly(e.target.checked)}
                />
                Show Mismatches Only
              </label>
              <span className="badge">{displayedList.length} shown</span>
            </div>
          </div>

          <div className="history-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ground Truth</th>
                  <th>Predicted</th>
                  <th>Font & Theme</th>
                  <th>Latency</th>
                  <th>CER</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {displayedList.map((item) => (
                  <tr key={item.id} className={item.isExact ? "row-success" : "row-mismatch"}>
                    <td className="text-muted font-mono">{item.id}</td>
                    <td><code className="code-badge">{item.groundTruth}</code></td>
                    <td>
                      <code className={`code-badge ${item.isExact ? "text-success" : "text-danger"}`}>
                        {item.predicted || "(None)"}
                      </code>
                    </td>
                    <td className="text-muted">{item.font} · {item.theme}</td>
                    <td>{item.duration} ms</td>
                    <td>{item.cer.toFixed(2)}</td>
                    <td>
                      {item.isExact ? (
                        <span className="badge badge-success">EXACT</span>
                      ) : item.isAmbiguous ? (
                        <span className="badge badge-warning">FLAGGED</span>
                      ) : (
                        <span className="badge badge-danger">MISMATCH</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

