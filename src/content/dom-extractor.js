/**
 * DOM extraction and auto-detection module for Matiks practice sessions.
 * Accurately targets the Matiks 400x400 game board (Expo Web image/container).
 */

import { cropImage } from "./image-capture.js";

/**
 * Targets the Matiks game board element based on the Expo Web DOM hierarchy.
 */
export function findMatiksBoardElement() {
  // 1. Direct hit: The question background grid image
  // HTML: <img class="css-9pa8cd" src="/assets/assets/images/questionBackground....png">
  const bgImg = document.querySelector('img[src*="questionBackground"]');
  if (bgImg) {
    const rect = bgImg.getBoundingClientRect();
    if (rect.width > 100 && rect.height > 100) {
      return bgImg;
    }
  }

  // 2. Expo image container around 400x400
  const expoImgs = document.querySelectorAll('[data-expoimage="true"]');
  for (const el of expoImgs) {
    const rect = el.getBoundingClientRect();
    if (rect.width >= 300 && rect.width <= 500 && rect.height >= 300 && rect.height <= 500) {
      return el;
    }
  }

  // 3. Central 400x400 board container in viewport
  const viewH = window.innerHeight;
  const viewW = window.innerWidth;
  const elements = document.querySelectorAll("div, img, canvas");

  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    if (
      rect.width >= 350 && rect.width <= 450 &&
      rect.height >= 350 && rect.height <= 450 &&
      rect.top > 80 && rect.bottom < viewH - 40
    ) {
      return el;
    }
  }

  return null;
}

/**
 * Captures image data from a DOM element.
 */
export async function captureElementImage(element) {
  if (element instanceof HTMLCanvasElement) {
    try {
      const dataUrl = element.toDataURL("image/png");
      const resp = await fetch(dataUrl);
      return { dataUrl, blob: await resp.blob() };
    } catch {
      // Fallback
    }
  }

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
        reject(new Error(resp?.error || "Tab capture error"));
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
 * Interactive Element Picker.
 */
export function startElementPicker(onElementSelected, onCancel) {
  let hoveredEl = null;

  const overlay = document.createElement("div");
  overlay.id = "matiks-picker-guide";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 24px",
    background: "#090d16",
    color: "#60a5fa",
    border: "2px solid #3b82f6",
    borderRadius: "24px",
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: "700",
    zIndex: "2147483647",
    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    pointerEvents: "none"
  });
  overlay.textContent = "🎯 Click on the equation on your screen · Press ESC to cancel";
  document.body.appendChild(overlay);

  const highlightOutline = "3px solid #38bdf8";
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
