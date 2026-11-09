export default function Dashboard({ history, benchmarkData, onNavigate, onSelectHistoryItem }) {
  // Compute session metrics from actual history
  const total = history.length;
  const avgConfidence = total > 0
    ? Math.round((history.reduce((acc, h) => acc + (h.confidence || 0), 0) / total) * 10) / 10
    : 0;
  const avgDuration = total > 0
    ? Math.round(history.reduce((acc, h) => acc + (h.duration || 0), 0) / total)
    : 0;
  const ambiguousCount = history.filter((h) => h.ambiguous).length;

  return (
    <div className="tab-pane dashboard-view">
      <div className="section-header">
        <div>
          <h2>System Overview</h2>
          <p className="subtitle">Real-time local OCR health, processing metrics, and recent recognition records.</p>
        </div>
        <div className="quick-actions">
          <button className="btn-primary" onClick={() => onNavigate("ocr-lab")}>
            + Open OCR Lab
          </button>
          <button className="btn-secondary" onClick={() => onNavigate("benchmark")}>
            ⚡ Run Benchmark
          </button>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">RECOGNITIONS LOGGED</div>
          <div className="metric-value">{total}</div>
          <div className="metric-meta">Local browser session</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">AVG OCR CONFIDENCE</div>
          <div className="metric-value text-accent">
            {total > 0 ? `${avgConfidence}%` : "--"}
          </div>
          <div className="metric-meta">{total > 0 ? "Measured over recent passes" : "No records yet"}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">AVG PROCESSING LATENCY</div>
          <div className="metric-value">
            {total > 0 ? `${avgDuration} ms` : "--"}
          </div>
          <div className="metric-meta">Multi-pass execution</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">AMBIGUITY ALERTS</div>
          <div className={`metric-value ${ambiguousCount > 0 ? "text-warning" : "text-success"}`}>
            {ambiguousCount}
          </div>
          <div className="metric-meta">Requires manual verification</div>
        </div>
      </div>

      {benchmarkData && benchmarkData.summary && (
        <div className="card benchmark-summary-banner">
          <div className="banner-badge">LATEST BENCHMARK REPORT</div>
          <div className="benchmark-stats-row">
            <div>
              <span className="stat-sub">EXACT MATCH ACCURACY</span>
              <strong className="stat-main">{benchmarkData.summary.exactMatchRate}%</strong>
            </div>
            <div>
              <span className="stat-sub">CHAR ERROR RATE (CER)</span>
              <strong className="stat-main">{benchmarkData.summary.averageCER}</strong>
            </div>
            <div>
              <span className="stat-sub">DIGIT ACCURACY</span>
              <strong className="stat-main">{benchmarkData.summary.averageDigitAccuracy}%</strong>
            </div>
            <div>
              <span className="stat-sub">MEDIAN LATENCY</span>
              <strong className="stat-main">{benchmarkData.summary.medianLatencyMs} ms</strong>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Recent Recognitions</h3>
          <span className="badge">{history.length} items</span>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <p>No recent recognition history yet. Head over to <strong>OCR Lab</strong> to upload an arithmetic question image.</p>
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Expression</th>
                  <th>Answer</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td className="text-muted">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td>
                      <code className="code-badge">{item.expression || item.candidateExpression || "--"}</code>
                    </td>
                    <td className="text-success font-bold">
                      {item.answer !== null && item.answer !== undefined ? item.answer : "--"}
                    </td>
                    <td>
                      <span className={`confidence-pill ${item.confidence >= 85 ? "high" : item.confidence >= 70 ? "medium" : "low"}`}>
                        {item.confidence ? `${item.confidence.toFixed(1)}%` : "--"}
                      </span>
                    </td>
                    <td>
                      {item.ambiguous ? (
                        <span className="badge badge-warning">Ambiguous (6/0)</span>
                      ) : (
                        <span className="badge badge-success">Verified</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-tiny"
                        onClick={() => {
                          onSelectHistoryItem(item);
                          onNavigate("ocr-lab");
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

