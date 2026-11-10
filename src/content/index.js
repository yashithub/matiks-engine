import { startRegionSelection, cropImage } from "./image-capture.js";
import { showCompanionResult } from "./companion-overlay.js";
import { findMatiksBoardElement, captureElementImage, startElementPicker } from "./dom-extractor.js";
import { preprocessVariants } from "../ocr/image-processor.js";
import { recognizeVariants } from "../ocr/ocr-engine.js";
import { solve } from "../engine/index.js";

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

  showCompanionResult({
    expression: extractedExpr,
    answer,
    ambiguous: ocrResult.ambiguous,
    conflicts: ocrResult.conflictReport?.conflicts
  });

  return {
    success: answer !== null,
    expression: extractedExpr,
    answer,
    confidence: ocrResult.confidence,
    ambiguous: ocrResult.ambiguous
  };
}

// Listen for commands from extension popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Action 1: Auto-Detect & Solve Matiks Board
  if (request.action === "AUTO_DETECT") {
    const board = findMatiksBoardElement();

    if (!board) {
      sendResponse({
        success: false,
        error: "Matiks 400x400 game board not found on this page. Make sure you are in a match (play?phase=playing)."
      });
      return true;
    }

    captureElementImage(board)
      .then((captured) => solveImageBlob(captured.blob))
      .then((res) => sendResponse(res))
      .catch((err) => {
        console.error("Auto-detect failed:", err);
        sendResponse({ success: false, error: err.message || "Failed to capture board" });
      });

    return true; // async response
  }

  // Action 2: Interactive Element Picker
  if (request.action === "PICK_ELEMENT") {
    startElementPicker(
      (selected) => {
        captureElementImage(selected)
          .then((captured) => solveImageBlob(captured.blob))
          .then((res) => {
            console.log("Picked element solved:", res);
          })
          .catch((err) => console.error(err));
      },
      () => console.log("Picker canceled")
    );
    sendResponse({ status: "Picker started" });
    return true;
  }

  // Action 3: Manual Drag Crop
  if (request.action === "TRIGGER_CAPTURE") {
    startRegionSelection(
      (bounds) => {
        chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, (resp) => {
          if (!resp || !resp.success) return;
          cropImage(resp.dataUrl, bounds)
            .then((cropped) => solveImageBlob(cropped.blob))
            .then((res) => console.log("Crop solved:", res))
            .catch((err) => console.error("Crop error:", err));
        });
      },
      () => console.log("Capture canceled")
    );
    sendResponse({ status: "Selection initiated" });
    return true;
  }
});
