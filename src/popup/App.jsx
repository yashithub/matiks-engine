import { useState, useEffect } from "react";
import { solve } from "../engine/index.js";

export default function PopupApp() {
  const [expression, setExpression] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready");

  function handleCalculate() {
    try {
      setError("");
      const res = solve(expression);
      setAnswer(res.answer);
    } catch (err) {
      setAnswer(null);
      setError(err.message);
    }
  }

  function triggerScreenCapture() {
    setStatus("Select area on page...");
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_CAPTURE" }, () => {
            window.close();
          });
        }
      });
    } else {
      setError("Screen capture requires Chrome Extension context");
    }
  }

  return (
    <div style={{
      width: "320px",
      padding: "16px",
      background: "#090d14",
      color: "#f1f5f9",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <strong style={{ fontSize: "14px", color: "#60a5fa" }}>MATIKS COMPANION</strong>
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>MV3</span>
      </div>

      <button
        onClick={triggerScreenCapture}
        style={{
          width: "100%",
          padding: "10px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: "12px"
        }}
      >
        📷 Capture Arithmetic Region
      </button>

      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>Quick Calculate</div>
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        <input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="e.g. 25 × 16"
          style={{
            flex: 1,
            background: "#111927",
            border: "1px solid #1e293b",
            color: "#fff",
            padding: "8px 10px",
            borderRadius: "6px",
            fontSize: "13px"
          }}
          onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
        />
        <button
          onClick={handleCalculate}
          style={{
            padding: "8px 14px",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          =
        </button>
      </div>

      {answer !== null && (
        <div style={{
          padding: "10px",
          background: "rgba(22, 101, 52, 0.15)",
          border: "1px solid #166534",
          borderRadius: "6px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "10px", color: "#86efac", letterSpacing: "1px" }}>RESULT</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#4ade80" }}>{answer}</div>
        </div>
      )}

      {error && (
        <div style={{
          padding: "8px",
          background: "rgba(127, 29, 29, 0.2)",
          border: "1px solid #7f1d1d",
          borderRadius: "6px",
          color: "#fca5a5",
          fontSize: "12px"
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
