import { startRegionSelection, cropImage } from "./image-capture.js";
import { showCompanionResult } from "./companion-overlay.js";
import { preprocessVariants } from "../ocr/image-processor.js";
import { recognizeVariants } from "../ocr/ocr-engine.js";
import { solve } from "../engine/index.js";

// Listen for commands from extension popup or shortcuts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "TRIGGER_CAPTURE") {
    startRegionSelection(
      async (bounds) => {
        // Request background to capture tab
        chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, async (resp) => {
          if (!resp || !resp.success) {
            console.error("Tab capture failed:", resp?.error);
            return;
          }

          try {
            const cropped = await cropImage(resp.dataUrl, bounds);
            const variants = await preprocessVariants(cropped.blob);
            const ocrResult = await recognizeVariants(variants);

            let answer = null;
            if (ocrResult.expression) {
              try {
                answer = solve(ocrResult.expression).answer;
              } catch (e) {
                console.warn("Solve failed:", e.message);
              }
            }

            showCompanionResult({
              expression: ocrResult.expression || ocrResult.candidateExpression,
              answer,
              ambiguous: ocrResult.ambiguous,
              conflicts: ocrResult.conflictReport?.conflicts
            });
          } catch (err) {
            console.error("OCR Pipeline failed on capture:", err);
          }
        });
      },
      () => {
        console.log("Capture canceled");
      }
    );
    sendResponse({ status: "Selection initiated" });
    return true;
  }
});

