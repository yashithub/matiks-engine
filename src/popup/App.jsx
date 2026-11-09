import { useState } from "react";
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

  function sendTabAction(actionName) {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: actionName }, () => {
            window.close(); // Close popup so user can view HUD on page
          });
        }
      });
    } else {
      setError("Requires Chrome Extension context");
    }
  }

  return (
    <div style={{
      width: "330px",
      padding: "16px",
      background: "#090d14",
      color: "#f1f5f9",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ background: "#2563eb", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px" }}>PRO</span>
          <strong style={{ fontSize: "14px", color: "#f8fafc", letterSpacing: "0.5px" }}>MATIKS COMPANION</strong>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b" }}>MV3</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => sendTabAction("AUTO_DETECT")}
          style={{
            padding: "11px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "700",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px"
          }}
        >
          ⚡ Auto-Detect & Solve Equation
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <button
            onClick={() => sendTabAction("PICK_ELEMENT")}
            style={{
              padding: "9px",
              background: "#1e293b",
              color: "#93c5fd",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            🎯 Pick Element
          </button>
          <button
            onClick={() => sendTabAction("TRIGGER_CAPTURE")}
            style={{
              padding: "9px",
              background: "#1e293b",
              color: "#93c5fd",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            📷 Drag Crop Box
          </button>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: "12px" }}>
        <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
          Quick Scratchpad
        </div>
        <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
          <input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g. 5 + 41 - 3"
            style={{
              flex: 1,
              background: "#111927",
              border: "1px solid #1e293b",
              color: "#fff",
              padding: "8px 10px",
              borderRadius: "6px",
              fontSize: "13px",
              fontFamily: "monospace"
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
              fontWeight: "700",
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
            <div style={{ fontSize: "10px", color: "#86efac", letterSpacing: "1.5px", fontWeight: "800" }}>RESULT</div>
            <div style={{ fontSize: "24px", fontWeight: "800", color: "#4ade80" }}>{answer}</div>
          </div>
        )}

        {error && (
          <div style={{
            padding: "8px",
            background: "rgba(127, 29, 29, 0.2)",
            border: "1px solid #7f1d1d",
            borderRadius: "6px",
            color: "#fca5a5",
            fontSize: "12px",
            marginTop: "6px"
          }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid #1e293b", marginTop: "12px", paddingTop: "10px", textAlign: "center" }}>
        <button
          onClick={() => {
            if (typeof chrome !== "undefined" && chrome.tabs) {
              chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
            } else {
              window.open("/index.html", "_blank");
            }
          }}
          style={{
            background: "none",
            border: "none",
            color: "#60a5fa",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          ↗ Open Full OCR Lab & Benchmark Suite
        </button>
      </div>
    </div>
  );
}
