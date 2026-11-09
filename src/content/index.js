import { startRegionSelection, cropImage } from "./image-capture.js";
import { showCompanionResult } from "./companion-overlay.js";
import { findCandidateElements, captureElementImage, startElementPicker } from "./dom-extractor.js";
import { preprocessVariants } from "../ocr/image-processor.js";
import { recognizeVariants } from "../ocr/ocr-engine.js";
import { solve } from "../engine/index.js";

let trackedElement = null;
let elementObserver = null;

async function processImageSource(imageBlob) {
  try {
    const variants = await preprocessVariants(imageBlob);
    const ocrResult = await recognizeVariants(variants, { psmList: ["6", "4"] });

    let answer = null;
    const extractedExpr = ocrResult.expression || ocrResult.candidateExpression;

    if (extractedExpr) {
      try {
        answer = solve(extractedExpr).answer;
      } catch (e) {
        console.warn("Solve failed:", e.message);
      }
    }

    showCompanionResult({
      expression: extractedExpr,
      answer,
      ambiguous: ocrResult.ambiguous,
      conflicts: ocrResult.conflictReport?.conflicts
    });
  } catch (err) {
    console.error("Matiks Companion OCR Pipeline failed:", err);
  }
}

async function processElement(el) {
  try {
    trackedElement = el;
    const { blob } = await captureElementImage(el);
    await processImageSource(blob);
  } catch (err) {
    console.error("Failed to capture element:", err);
  }
}

// Listen for commands from extension popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Action 1: Manual Click-and-drag screen crop
  if (request.action === "TRIGGER_CAPTURE") {
    startRegionSelection(
      async (bounds) => {
        chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, async (resp) => {
          if (!resp || !resp.success) return;
          try {
            const cropped = await cropImage(resp.dataUrl, bounds);
            await processImageSource(cropped.blob);
          } catch (err) {
            console.error("Crop error:", err);
          }
        });
      },
      () => console.log("Capture canceled")
    );
    sendResponse({ status: "Selection initiated" });
    return true;
  }

  // Action 2: Click to Pick specific equation DOM element
  if (request.action === "PICK_ELEMENT") {
    startElementPicker(
      (selected) => {
        processElement(selected);
      },
      () => console.log("Picker canceled")
    );
    sendResponse({ status: "Picker started" });
    return true;
  }

  // Action 3: Auto-detect equation in DOM (look for canvas or question container)
  if (request.action === "AUTO_DETECT") {
    const candidates = findCandidateElements();
    if (candidates.length > 0) {
      // Pick the primary candidate (e.g. game canvas)
      processElement(candidates[0].element);
      sendResponse({ status: "Candidate found and processed", count: candidates.length });
    } else {
      // If auto-detection cannot find an obvious container, launch the picker
      startElementPicker((selected) => processElement(selected));
      sendResponse({ status: "Picker launched as fallback" });
    }
    return true;
  }
});
