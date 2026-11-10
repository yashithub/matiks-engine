/**
 * DOM extraction and auto-detection module for Matiks practice sessions.
 * Targets the Matiks 400x400 game board (Expo Web image/container) and provides
 * dual-path extraction: fast DOM text reading (0ms) and visual canvas capture fallback.
 */

import { cropImage } from "./image-capture.js";
import { assembleVerticalExpression, collapseSpacedDigits } from "../ocr/extract-expression.js";

/**
 * Targets the full Matiks game board element containing both the background
 * and the equation text overlay.
 */
export function findMatiksBoardElement() {
  // 1. Direct hit via the background grid image
  // HTML: <img class="css-9pa8cd" src="/assets/assets/images/questionBackground...png">
  const bgImg = document.querySelector('img[src*="questionBackground"], [style*="questionBackground"]');
  if (bgImg) {
    let curr = bgImg.parentElement;
    while (curr && curr !== document.body) {
      const rect = curr.getBoundingClientRect();
      if (rect.width >= 280 && rect.width <= 520 && rect.height >= 280 && rect.height <= 520) {
        return curr;
      }
      curr = curr.parentElement;
    }
    // Fallback to the image itself if parent container not resolved
    const imgRect = bgImg.getBoundingClientRect();
    if (imgRect.width > 100 && imgRect.height > 100) {
      return bgImg;
    }
  }

  // 2. Relative hit: element located directly above the answer box
  // HTML: <div data-testid="daily-math-answer-title">TYPE OUT YOUR ANSWER</div>
  const answerTitle = document.querySelector('[data-testid="daily-math-answer-title"]');
  if (answerTitle) {
    const answerRect = answerTitle.getBoundingClientRect();
    const candidates = document.querySelectorAll('div, img, canvas');
    for (const el of candidates) {
      if (el.closest('#matiks-companion-root')) continue;
      const rect = el.getBoundingClientRect();
      if (
        rect.width >= 300 && rect.width <= 500 &&
        rect.height >= 300 && rect.height <= 500 &&
        rect.bottom <= answerRect.top + 30
      ) {
        return el;
      }
    }
  }

  // 3. Expo image container around 400x400
  const expoImgs = document.querySelectorAll('[data-expoimage="true"]');
  for (const el of expoImgs) {
    const rect = el.getBoundingClientRect();
    if (rect.width >= 280 && rect.width <= 520 && rect.height >= 280 && rect.height <= 520) {
      return el;
    }
  }

  // 4. Central 400x400 board container in viewport
  const viewH = window.innerHeight;
  const elements = document.querySelectorAll("div, img, canvas");
  for (const el of elements) {
    if (el.closest('#matiks-companion-root')) continue;
    const rect = el.getBoundingClientRect();
    if (
      rect.width >= 350 && rect.width <= 450 &&
      rect.height >= 350 && rect.height <= 450 &&
      rect.top > 60 && rect.bottom < viewH - 30
    ) {
      return el;
    }
  }

  return null;
}

/**
 * Extracts math expression directly from DOM text elements inside the board.
 * React Native Web (Expo) renders <Text> elements as <div dir="auto" class="css-146c3p1 ...">.
 * Returns assembled canonical math expression (e.g. "5 + 41 - 3" or "66 + 9"), or null.
 */
export function extractDOMEquation(boardElement) {
  if (!boardElement) return null;

  // Gather all text inside the board container
  const walker = document.createTreeWalker(
    boardElement,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textItems = [];
  let node;
  while ((node = walker.nextNode())) {
    const raw = node.textContent.trim();
    if (!raw) continue;

    // Reject non-math UI elements
    if (raw.includes("TYPE OUT") || raw.includes("ANSWER")) continue;
    // Skip if it contains letters (except 'x' or 'X' as multiplication)
    if (/[a-wy-zA-WY-Z]/.test(raw)) continue;
    // Skip timer strings like "0:52"
    if (/\d+:\d{2}/.test(raw)) continue;
    // Must contain at least a digit or math operator
    if (!/[0-9+\-*/×÷−^√()]/.test(raw)) continue;

    // Measure position using a DOM range
    const range = document.createRange();
    range.selectNode(node);
    const rect = range.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
      textItems.push({
        text: raw,
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        height: Math.round(rect.height)
      });
    }
  }

  if (textItems.length === 0) return null;

  // Sort vertically by top coordinate
  textItems.sort((a, b) => a.top - b.top || a.left - b.left);

  // Group text items into lines based on vertical proximity
  const lines = [];
  let currentLine = [];
  let currentTop = null;

  for (const item of textItems) {
    if (currentTop === null || Math.abs(item.top - currentTop) <= Math.max(16, item.height * 0.6)) {
      currentLine.push(item);
      if (currentTop === null) currentTop = item.top;
    } else {
      currentLine.sort((a, b) => a.left - b.left);
      lines.push(currentLine.map((i) => i.text).join(" "));
      currentLine = [item];
      currentTop = item.top;
    }
  }

  if (currentLine.length > 0) {
    currentLine.sort((a, b) => a.left - b.left);
    lines.push(currentLine.map((i) => i.text).join(" "));
  }

  if (lines.length === 0) return null;

  // If a single line already has digits and operator (e.g. "66 + 9")
  if (lines.length === 1) {
    const single = lines[0].replace(/[–—−]/g, "-").trim();
    if (/\d+.*[+\-*/×÷^].*\d+/.test(single)) {
      return single;
    }
  }

  // Multi-line vertical column assembly
  return assembleVerticalExpression(lines);
}

/**
 * Captures image data from a DOM element using the extension background tab capture.
 */
export async function captureElementImage(element) {
  if (element instanceof HTMLCanvasElement) {
    try {
      const dataUrl = element.toDataURL("image/png");
      const resp = await fetch(dataUrl);
      return { dataUrl, blob: await resp.blob() };
    } catch {
      // Fallback to tab capture
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
 * Interactive Element Picker with ESC to cancel.
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
