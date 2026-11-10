import { useState, useEffect, useRef } from "react";
import { solve } from "../engine/index.js";

export default function PopupApp() {
  const [expression, setExpression] = useState("");
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);

  const trackingIntervalRef = useRef(null);
  const lastSolvedRef = useRef("");

  function handleCalculateManual() {
    try {
      setError("");
      const res = solve(expression);
      setAnswer(res.answer);
      setStatus("Calculated via scratchpad");
    } catch (err) {
      setAnswer(null);
      setError(err.message);
    }
  }

  function handleSolve() {
    if (loading) return;
    setLoading(true);
    setError("");
    setStatus("Scanning Matiks 400x400 board...");

    if (typeof chrome === "undefined" || !chrome.tabs) {
      setLoading(false);
      setError("Requires Chrome Extension context");
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) {
        setLoading(false);
        setError("No active game tab found");
        return;
      }

      function executeSolveMessage() {
        chrome.tabs.sendMessage(tabId, { action: "AUTO_DETECT" }, (resp) => {
          setLoading(false);
          if (chrome.runtime.lastError) {
            setError("Connection error: please refresh your Matiks tab (F5) and try again.");
            setStatus("Disconnected");
            return;
          }

          if (resp && resp.success) {
            setExpression(resp.expression || "");
            setAnswer(resp.answer);
            lastSolvedRef.current = resp.expression || "";
            setStatus(`Solved: ${resp.expression} = ${resp.answer}`);
          } else {
            setError(resp?.error || "Could not detect equation. Make sure you are in a live match.");
            setStatus("Board not detected");
          }
        });
      }

      // Check if content script needs dynamic injection
      chrome.tabs.sendMessage(tabId, { action: "PING" }, () => {
        if (chrome.runtime.lastError) {
          if (chrome.scripting && chrome.scripting.executeScript) {
            chrome.scripting.executeScript(
              { target: { tabId }, files: ["content.js"] },
              () => setTimeout(executeSolveMessage, 150)
            );
          } else {
            setLoading(false);
            setError("Please refresh your Matiks game tab and try again.");
          }
        } else {
          executeSolveMessage();
        }
      });
    });
  }

  function toggleLiveTracking() {
    if (isLiveTracking) {
      setIsLiveTracking(false);
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }
      setStatus("Live tracking stopped");
    } else {
      setIsLiveTracking(true);
      setStatus("Live tracking active (polling every 900ms)...");
      // Initial immediate solve
      handleSolve();
      trackingIntervalRef.current = setInterval(() => {
        handleSolve();
      }, 900);
    }
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, []);

  function startCrop() {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_CAPTURE" });
          window.close(); // For drag crop, close popup so user has full viewport
        }
      });
    }
  }

  function startPicker() {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "PICK_ELEMENT" });
          window.close(); // For element picker, close popup so user can click element
        }
      });
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
      {/* Brand Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ background: "#2563eb", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px" }}>PRO</span>
          <strong style={{ fontSize: "14px", color: "#f8fafc", letterSpacing: "0.5px" }}>MATIKS COMPANION</strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#94a3b8" }}>
          {isLiveTracking && (
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          )}
          <span>{isLiveTracking ? "LIVE" : "IDLE"}</span>
        </div>
      </div>

      {/* Primary Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
        {/* Continuous Live Tracking Toggle */}
        <button
          onClick={toggleLiveTracking}
          style={{
            padding: "11px",
            background: isLiveTracking ? "rgba(220, 38, 38, 0.2)" : "#2563eb",
            color: isLiveTracking ? "#f87171" : "#fff",
            border: isLiveTracking ? "1px solid #dc2626" : "none",
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
          {isLiveTracking ? "⏹ Stop Live Tracking" : "▶ Start Live Tracking (Continuous)"}
        </button>

        {/* Single Solve Button */}
        <button
          onClick={handleSolve}
          disabled={loading || isLiveTracking}
          style={{
            padding: "9px",
            background: "#1e293b",
            color: "#e2e8f0",
            border: "1px solid #334155",
            borderRadius: "8px",
            fontWeight: "600",
            fontSize: "12px",
            cursor: "pointer"
          }}
        >
          {loading ? "Scanning & Solving..." : "⚡ Solve Current Equation"}
        </button>

        {/* Secondary Capture Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <button
            onClick={startPicker}
            style={{
              padding: "7px",
              background: "#0f172a",
              color: "#93c5fd",
              border: "1px solid #1e293b",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "11px",
              cursor: "pointer"
            }}
          >
            🎯 Pick Element
          </button>
          <button
            onClick={startCrop}
            style={{
              padding: "7px",
              background: "#0f172a",
              color: "#93c5fd",
              border: "1px solid #1e293b",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "11px",
              cursor: "pointer"
            }}
          >
            📷 Drag Crop Box
          </button>
        </div>
      </div>

      {/* Answer & Status Card */}
      <div style={{
        padding: "12px",
        background: answer !== null ? "rgba(22, 101, 52, 0.18)" : "#0f172a",
        border: `1px solid ${answer !== null ? "#166534" : "#1e293b"}`,
        borderRadius: "10px",
        textAlign: "center",
        marginBottom: "14px"
      }}>
        <div style={{ fontSize: "10px", color: answer !== null ? "#86efac" : "#64748b", letterSpacing: "1.5px", fontWeight: "800", marginBottom: "4px" }}>
          {expression ? `EQUATION: ${expression}` : "CALCULATED RESULT"}
        </div>
        <div style={{ fontSize: "36px", fontWeight: "800", color: answer !== null ? "#4ade80" : "#64748b", lineHeight: 1.1 }}>
          {answer !== null ? answer : "--"}
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
          {status}
        </div>
      </div>

      {error && (
        <div style={{
          padding: "8px 10px",
          background: "rgba(127, 29, 29, 0.2)",
          border: "1px solid #7f1d1d",
          borderRadius: "6px",
          color: "#fca5a5",
          fontSize: "12px",
          marginBottom: "12px"
        }}>
          {error}
        </div>
      )}

      {/* Quick Scratchpad */}
      <div style={{ borderTop: "1px solid #1e293b", paddingTop: "10px" }}>
        <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
          Manual Scratchpad
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g. 2 × 6"
            style={{
              flex: 1,
              background: "#111927",
              border: "1px solid #1e293b",
              color: "#fff",
              padding: "7px 10px",
              borderRadius: "6px",
              fontSize: "13px",
              fontFamily: "monospace"
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCalculateManual()}
          />
          <button
            onClick={handleCalculateManual}
            style={{
              padding: "7px 12px",
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
      </div>

      {/* Link to Full OCR Lab */}
      <div style={{ marginTop: "12px", textAlign: "center" }}>
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
