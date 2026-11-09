import { solve } from "../engine/index.js";

// Chrome Manifest V3 Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("Matiks Companion MV3 Service Worker installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ status: "ok", timestamp: Date.now() });
    return true;
  }

  if (message.type === "CAPTURE_VISIBLE_TAB") {
    chrome.tabs.captureVisibleTab(
      sender.tab ? sender.tab.windowId : null,
      { format: "png" },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true, dataUrl });
        }
      }
    );
    return true;
  }

  if (message.type === "SOLVE_EXPRESSION") {
    try {
      const result = solve(message.expression);
      sendResponse({ success: true, result });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    return true;
  }
});

