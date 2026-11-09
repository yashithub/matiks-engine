/**
 * DOM extraction and auto-detection module for Matiks practice sessions.
 * Allows target element selection, canvas extraction, and bounding-box capture.
 */

import { cropImage } from "./image-capture.js";

/**
 * Searches the DOM for candidate equation containers or canvas elements.
 */
export function findCandidateElements() {
  const candidates = [];

  // 1. Look for game canvas elements
  const canvases = document.querySelectorAll("canvas");
  canvases.forEach((c) => {
    const rect = c.getBoundingClientRect();
    if (rect.width > 80 && rect.height > 80) {
      candidates.push({ element: c, type: "canvas", rect });
    }
  });

  // 2. Look for elements containing math/equation classes or attributes
  const mathSelectors = [
    "[class*='equation']",
    "[class*='question']",
    "[class*='problem']",
    "[class*='board']",
    "[data-testid*='math']",
    "[id*='equation']",
    "[id*='question']"
  ];

  mathSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 50) {
        candidates.push({ element: el, type: "dom", rect });
      }
    });
  });

  return candidates;
}

/**
 * Captures image data from a DOM element.
 * If element is a Canvas, extracts direct image blob;
 * otherwise requests background tab capture and crops to the element's bounding box.
 */
export async function captureElementImage(element) {
  // Option A: Direct canvas extraction (fastest, zero screenshot overhead)
  if (element instanceof HTMLCanvasElement) {
    try {
      const dataUrl = element.toDataURL("image/png");
      return {
        dataUrl,
        blob: await (await fetch(dataUrl)).blob()
      };
    } catch {
      // If canvas is tainted by cross-origin resources, fall back to tab capture
    }
  }

  // Option B: Tab capture cropped to bounding box
  const rect = element.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  const bounds = {
    x: Math.round(rect.left * dpr),
    y: Math.round(rect.top * dpr),
    width: Math.round(rect.width * dpr),
    height: Math.round(rect.height * dpr)
  };

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, async (resp) => {
      if (!resp || !resp.success) {
        reject(new Error(resp?.error || "Failed to capture visible tab"));
        return;
      }
      try {
        const cropped = await cropImage(resp.dataUrl, bounds);
        resolve(cropped);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * Interactive Element Picker: allows user to click on the exact question container on the page.
 */
export function startElementPicker(onElementSelected, onCancel) {
  let hoveredEl = null;

  const overlay = document.createElement("div");
  overlay.id = "matiks-picker-guide";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 20px",
    background: "#0f172a",
    color: "#60a5fa",
    border: "1px solid #3b82f6",
    borderRadius: "20px",
    fontFamily: "Inter, sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    zIndex: "2147483647",
    boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
    pointerEvents: "none"
  });
  overlay.textContent = "Matiks Companion: Click on the equation on screen · Press ESC to cancel";
  document.body.appendChild(overlay);

  const highlightOutline = "2px solid #38bdf8";
  let prevOutline = "";

  function onMouseMove(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === hoveredEl || target.id === "matiks-picker-guide" || target.closest("#matiks-companion-root")) {
      return;
    }

    if (hoveredEl) {
      hoveredEl.style.outline = prevOutline;
    }

    hoveredEl = target;
    prevOutline = target.style.outline;
    target.style.outline = highlightOutline;
  }

  function cleanup() {
    if (hoveredEl) {
      hoveredEl.style.outline = prevOutline;
    }
    window.removeEventListener("mousemove", onMouseMove, true);
    window.removeEventListener("click", onClick, true);
    window.removeEventListener("keydown", onKeyDown, true);
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const selected = hoveredEl;
    cleanup();
    if (selected && onElementSelected) {
      onElementSelected(selected);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      cleanup();
      if (onCancel) onCancel();
    }
  }

  window.addEventListener("mousemove", onMouseMove, true);
  window.addEventListener("click", onClick, true);
  window.addEventListener("keydown", onKeyDown, true);
}

