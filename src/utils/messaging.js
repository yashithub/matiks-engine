/**
 * Abstraction layer for Chrome Extension message passing.
 * Safely falls back to internal event bus in web environments.
 */

export const MessageTypes = {
  CAPTURE_AREA: "CAPTURE_AREA",
  AREA_CAPTURED: "AREA_CAPTURED",
  PROCESS_OCR: "PROCESS_OCR",
  OCR_RESULT: "OCR_RESULT",
  SOLVE_EXPRESSION: "SOLVE_EXPRESSION",
  SOLVE_RESULT: "SOLVE_RESULT",
  PING: "PING"
};

export async function sendMessage(message) {
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response || { success: true });
        }
      });
    });
  }

  // Fallback in web / non-extension context
  return { success: false, error: "Not running in Chrome Extension environment" };
}

export function onMessage(callback) {
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    const listener = (msg, sender, sendResponse) => {
      callback(msg, sender, sendResponse);
      return true; // async response support
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }
  return () => {};
}

