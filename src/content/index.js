import { startRegionSelection, cropImage } from "./image-capture.js";
import { showCompanionResult } from "./companion-overlay.js";
import { findMatiksBoardElement, extractDOMEquation, captureElementImage, startElementPicker } from "./dom-extractor.js";
import { recognizeFast, recognizeVariants } from "../ocr/ocr-engine.js";
import { solve } from "../engine/index.js";

// Active companion state
let isLiveTrackingActive = true;
let isBusySolving = false;
let trackingTimer = null;
let lastSolvedResult = {
  success: false,
  expression: "",
  answer: null,
  ambiguous: false
};

function updateHUD(res) {
  showCompanionResult({
    expression: res?.expression || "Scanning board...",
    answer: res?.answer !== undefined ? res.answer : null,
    ambiguous: res?.ambiguous || false,
    conflicts: res?.conflicts || null,
    isLiveTracking: isLiveTrackingActive,
    onToggleTracking: toggleTracking,
    onManualScan: () => detectAndSolveCurrentEquation(true)
  });
}

/**
 * High-speed single-pass image solver (< 150ms) for real-time live tracking.
 */
async function solveImageFast(imageBlob) {
  const ocrResult = await recognizeFast(imageBlob);
  let answer = null;
  const extractedExpr = ocrResult.expression;

  if (extractedExpr) {
    try {
      answer = solve(extractedExpr).answer;
    } catch (e) {
      console.warn("Solve error:", e.message);
    }
  }

  return {
    success: answer !== null,
    expression: extractedExpr || "",
    answer,
    confidence: ocrResult.confidence,
    ambiguous: false
  };
}

/**
 * Dual-strategy detection:
 * Path 1: Instant DOM text & SVG icon extraction (< 2ms, 100% precision)
 * Path 2: Ultra-fast single-pass visual capture (< 150ms) fallback
 */
async function detectAndSolveCurrentEquation(force = false) {
  // 1. Try DOM text & SVG icon extraction first (takes < 2ms)
  const domExpr = extractDOMEquation();
  if (domExpr) {
    if (!force && domExpr === lastSolvedResult.expression && lastSolvedResult.answer !== null) {
      return lastSolvedResult;
    }

    try {
      const mathRes = solve(domExpr);
      const res = {
        success: true,
        expression: domExpr,
        answer: mathRes.answer,
        source: "DOM",
        ambiguous: false
      };
      lastSolvedResult = res;
      updateHUD(res);
      return res;
    } catch (err) {
      console.warn("DOM expression solve error:", err);
    }
  }

  // 2. Fallback: Fast single-pass visual capture + OCR
  try {
    const board = findMatiksBoardElement();
    const captured = await captureElementImage(board);
    const ocrRes = await solveImageFast(captured.blob);
    if (ocrRes.success) {
      lastSolvedResult = ocrRes;
      updateHUD(ocrRes);
      return ocrRes;
    }
  } catch (err) {
    console.warn("Visual OCR fallback error:", err);
  }

  return {
    success: false,
    error: "Equation could not be resolved from board"
  };
}

function startLiveTracking() {
  isLiveTrackingActive = true;
  updateHUD(lastSolvedResult);

  if (trackingTimer) clearInterval(trackingTimer);

  // Sub-100ms polling loop (every 80ms) for lightning-fast responsiveness
  trackingTimer = setInterval(async () => {
    if (!isLiveTrackingActive || isBusySolving) return;

    // Fast check: did the DOM equation change?
    const domExpr = extractDOMEquation();
    if (domExpr && domExpr !== lastSolvedResult.expression) {
      isBusySolving = true;
      try {
        await detectAndSolveCurrentEquation();
      } finally {
        isBusySolving = false;
      }
    }
  }, 80);
}

function stopLiveTracking() {
  isLiveTrackingActive = false;
  if (trackingTimer) {
    clearInterval(trackingTimer);
    trackingTimer = null;
  }
  updateHUD(lastSolvedResult);
}

function toggleTracking() {
  if (isLiveTrackingActive) {
    stopLiveTracking();
  } else {
    startLiveTracking();
    detectAndSolveCurrentEquation(true);
  }
}

// Low-latency MutationObserver: reacts within 40ms when React renders a new question
let debounceTimer = null;
const observer = new MutationObserver(() => {
  if (!isLiveTrackingActive || isBusySolving) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const domExpr = extractDOMEquation();
    if (domExpr && domExpr !== lastSolvedResult.expression) {
      detectAndSolveCurrentEquation().catch(() => {});
    }
  }, 40);
});

// Auto-start live tracking when page is ready
if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
  startLiveTracking();
} else {
  window.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
    startLiveTracking();
  });
}

// Listen for commands from extension popup, side panel, or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Action: PING (heartbeat check)
  if (request.action === "PING") {
    sendResponse({
      status: "PONG",
      isTracking: isLiveTrackingActive,
      lastSolved: lastSolvedResult
    });
    return true;
  }

  // Action: GET_STATUS
  if (request.action === "GET_STATUS") {
    sendResponse({
      isTracking: isLiveTrackingActive,
      lastSolved: lastSolvedResult
    });
    return true;
  }

  // Action: TOGGLE_TRACKING
  if (request.action === "TOGGLE_TRACKING") {
    toggleTracking();
    sendResponse({
      isTracking: isLiveTrackingActive,
      lastSolved: lastSolvedResult
    });
    return true;
  }

  // Action: AUTO_DETECT & Solve Matiks Board
  if (request.action === "AUTO_DETECT") {
    detectAndSolveCurrentEquation(true)
      .then((res) => sendResponse(res))
      .catch((err) => {
        sendResponse({ success: false, error: err.message || "Failed to detect equation" });
      });
    return true; // async
  }

  // Action: Interactive Element Picker
  if (request.action === "PICK_ELEMENT") {
    startElementPicker(
      (selected) => {
        captureElementImage(selected)
          .then((captured) => solveImageFast(captured.blob))
          .then((res) => {
            if (res.success) {
              lastSolvedResult = res;
              updateHUD(res);
            }
          })
          .catch((err) => console.error(err));
      },
      () => console.log("Picker canceled")
    );
    sendResponse({ status: "Picker started" });
    return true;
  }

  // Action: Manual Drag Crop
  if (request.action === "TRIGGER_CAPTURE") {
    startRegionSelection(
      (bounds) => {
        chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, (resp) => {
          if (!resp || !resp.success) return;
          cropImage(resp.dataUrl, bounds)
            .then((cropped) => solveImageFast(cropped.blob))
            .then((res) => {
              if (res.success) {
                lastSolvedResult = res;
                updateHUD(res);
              }
            })
            .catch((err) => console.error("Crop error:", err));
        });
      },
      () => console.log("Capture canceled")
    );
    sendResponse({ status: "Selection initiated" });
    return true;
  }
});
