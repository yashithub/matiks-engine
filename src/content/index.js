import { startRegionSelection, cropImage } from "./image-capture.js";
import { showCompanionResult } from "./companion-overlay.js";
import { findMatiksBoardElement, extractDOMEquation, captureElementImage, startElementPicker } from "./dom-extractor.js";
import { preprocessVariants } from "../ocr/image-processor.js";
import { recognizeVariants } from "../ocr/ocr-engine.js";
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

async function solveImageBlob(imageBlob) {
  const variants = await preprocessVariants(imageBlob);
  const ocrResult = await recognizeVariants(variants, { psmList: ["6", "4"] });

  let answer = null;
  const extractedExpr = ocrResult.expression || ocrResult.candidateExpression;

  if (extractedExpr) {
    try {
      answer = solve(extractedExpr).answer;
    } catch (e) {
      console.warn("Solve error:", e.message);
    }
  }

  const result = {
    success: answer !== null,
    expression: extractedExpr || "",
    answer,
    confidence: ocrResult.confidence,
    ambiguous: ocrResult.ambiguous,
    conflicts: ocrResult.conflictReport?.conflicts
  };

  return result;
}

/**
 * Dual-strategy detection:
 * Path 1: Instant DOM text extraction (0ms, 100% precision)
 * Path 2: Tab visual capture + OCR consensus fallback
 */
async function detectAndSolveCurrentEquation(force = false) {
  const board = findMatiksBoardElement();
  if (!board) {
    return {
      success: false,
      error: "Matiks 400x400 game board not detected. Make sure you are in a match."
    };
  }

  // 1. Try DOM text extraction first
  const domExpr = extractDOMEquation(board);
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

  // 2. Fallback to visual capture + OCR
  try {
    const captured = await captureElementImage(board);
    const ocrRes = await solveImageBlob(captured.blob);
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

  trackingTimer = setInterval(async () => {
    if (!isLiveTrackingActive || isBusySolving) return;

    const board = findMatiksBoardElement();
    if (!board) return;

    // Check if new equation appeared in DOM
    const domExpr = extractDOMEquation(board);
    if (domExpr && domExpr !== lastSolvedResult.expression) {
      isBusySolving = true;
      try {
        await detectAndSolveCurrentEquation();
      } finally {
        isBusySolving = false;
      }
    }
  }, 400);
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

// Observe DOM mutations to react instantly when a new equation is rendered
let debounceTimer = null;
const observer = new MutationObserver(() => {
  if (!isLiveTrackingActive || isBusySolving) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const board = findMatiksBoardElement();
    if (board) {
      const domExpr = extractDOMEquation(board);
      if (domExpr && domExpr !== lastSolvedResult.expression) {
        detectAndSolveCurrentEquation().catch(() => {});
      }
    }
  }, 150);
});

// Auto-start live tracking when page has loaded
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
          .then((captured) => solveImageBlob(captured.blob))
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
            .then((cropped) => solveImageBlob(cropped.blob))
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
