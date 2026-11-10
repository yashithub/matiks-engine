/**
 * DOM extraction and auto-detection module for Matiks practice sessions.
 * Targets the Matiks 400x400 game board (Expo Web image/container) and provides
 * dual-path extraction: fast DOM text reading (<2ms) and visual canvas capture fallback.
 */

import { cropImage } from "./image-capture.js";
import { assembleVerticalExpression, collapseSpacedDigits } from "../ocr/extract-expression.js";

/**
 * Calculates the exact spatial window on the screen where the math equation resides.
 * Uses the answer box title ("TYPE OUT YOUR ANSWER") and question background image
 * as reliable anchors.
 */
export function getQuestionSpatialBounds() {
  // 1. Primary Anchor: Answer title element directly below the board
  // HTML: <div data-testid="daily-math-answer-title">TYPE OUT YOUR ANSWER</div>
  const answerTitle = document.querySelector('[data-testid="daily-math-answer-title"]');
  if (answerTitle) {
    const ar = answerTitle.getBoundingClientRect();
    return {
      left: Math.max(0, ar.left - 200),
      right: Math.min(window.innerWidth, ar.right + 200),
      top: Math.max(40, ar.top - 460),
      bottom: ar.top - 4
    };
  }

  // 2. Secondary Anchor: Question background grid image
  // HTML: <img class="css-9pa8cd" src="/assets/assets/images/questionBackground...png">
  const bgImg = document.querySelector('img[src*="questionBackground"], [style*="questionBackground"]');
  if (bgImg) {
    const br = bgImg.getBoundingClientRect();
    if (br.width > 80 && br.height > 80) {
      return {
        left: br.left - 15,
        right: br.right + 15,
        top: br.top - 15,
        bottom: br.bottom + 15
      };
    }
  }

  // 3. Fallback: Center of viewport
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  return {
    left: cx - 220,
    right: cx + 220,
    top: cy - 220,
    bottom: cy + 220
  };
}

/**
 * Targets the full Matiks game board container element for capture.
 */
export function findMatiksBoardElement() {
  const bgImg = document.querySelector('img[src*="questionBackground"], [style*="questionBackground"]');
  if (bgImg) {
    let curr = bgImg.parentElement;
    while (curr && curr !== document.body) {
      const rect = curr.getBoundingClientRect();
      if (rect.width >= 260 && rect.width <= 540 && rect.height >= 260 && rect.height <= 540) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return bgImg.parentElement || bgImg;
  }

  const answerTitle = document.querySelector('[data-testid="daily-math-answer-title"]');
  if (answerTitle) {
    const ar = answerTitle.getBoundingClientRect();
    const candidates = document.querySelectorAll('div, img, canvas');
    for (const el of candidates) {
      if (el.closest('#matiks-companion-root')) continue;
      const rect = el.getBoundingClientRect();
      if (
        rect.width >= 280 && rect.width <= 500 &&
        rect.height >= 280 && rect.height <= 500 &&
        rect.bottom <= ar.top + 30
      ) {
        return el;
      }
    }
  }

  return document.body;
}

/**
 * Extracts math expression directly from DOM elements inside the question bounds.
 * Reads text nodes, Expo <Text> containers, and SVG math icons in < 2ms with 100% precision.
 * Supports all division representations: '÷', '/', ':', '∕', and SVG divide icons.
 */
export function extractDOMEquation() {
  const bounds = getQuestionSpatialBounds();
  const textItems = [];

  // Query all potential text or icon elements in DOM
  const candidates = document.querySelectorAll('div, span, p, svg');
  for (const el of candidates) {
    if (el.closest('#matiks-companion-root')) continue;
    if (el.closest('#matiks-picker-guide')) continue;

    // Check if element has multiple children; skip parents to avoid duplicated child text
    if (el.children.length > 1 && el.tagName.toLowerCase() !== 'svg') continue;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;

    // Element must fall within the question bounds
    if (
      rect.left < bounds.left ||
      rect.right > bounds.right ||
      rect.top < bounds.top ||
      rect.bottom > bounds.bottom
    ) {
      continue;
    }

    // Check for SVG math icons (e.g. division, multiplication icons)
    const isSvg = el.tagName.toLowerCase() === 'svg' || el.querySelector('svg');
    if (isSvg) {
      const svg = el.tagName.toLowerCase() === 'svg' ? el : el.querySelector('svg');
      const aria = (svg.getAttribute('aria-label') || '').toLowerCase();
      const html = svg.innerHTML.toLowerCase();
      let op = null;

      if (aria.includes('divide') || aria.includes('division') || html.includes('divide')) {
        op = '÷';
      } else if (aria.includes('multiply') || aria.includes('times') || html.includes('multiply')) {
        op = '×';
      } else if (aria.includes('plus') || aria.includes('add') || html.includes('plus')) {
        op = '+';
      } else if (aria.includes('minus') || aria.includes('sub') || html.includes('minus')) {
        op = '-';
      } else {
        // Geometric SVG check: division has 2 distinct circles/dots + bar
        const circles = svg.querySelectorAll('circle, ellipse');
        const paths = svg.querySelectorAll('path, line, rect');
        if (circles.length >= 2 || (paths.length >= 2 && rect.height >= rect.width * 0.7)) {
          op = '÷';
        }
      }

      if (op) {
        textItems.push({
          text: op,
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          height: Math.round(rect.height),
          isOperator: true
        });
      }
      continue;
    }

    // Leaf text extraction
    const raw = el.textContent.trim();
    if (!raw) continue;

    // Avoid counting single-child wrappers whose text equals child text
    if (el.children.length === 1 && el.children[0].textContent.trim() === raw) continue;

    // Ignore non-math UI elements
    if (raw.includes('TYPE OUT') || raw.includes('ANSWER')) continue;
    if (/[a-wy-zA-WY-Z]/.test(raw)) continue;
    if (/\d+:\d{2}/.test(raw)) continue;

    // Must contain math characters
    if (!/[0-9+\-*/×÷:∕−^√()]/.test(raw)) continue;

    // Normalize colon and division slashes to standard division
    const normalizedText = raw.replace(/[:∕]/g, '/');

    textItems.push({
      text: normalizedText,
      top: Math.round(rect.top),
      left: Math.round(rect.left),
      height: Math.round(rect.height),
      isOperator: /[+\-*/×÷−^]/.test(normalizedText)
    });
  }

  // De-duplicate items with identical spatial coordinate and text
  const uniqueItems = [];
  for (const item of textItems) {
    const exists = uniqueItems.some(
      (u) => Math.abs(u.top - item.top) < 6 && Math.abs(u.left - item.left) < 6 && u.text === item.text
    );
    if (!exists) uniqueItems.push(item);
  }

  if (uniqueItems.length === 0) return null;

  // Sort vertically by top coordinate
  uniqueItems.sort((a, b) => a.top - b.top || a.left - b.left);

  // Group tokens into horizontal lines
  const lines = [];
  let currentLine = [];
  let currentTop = null;

  for (const item of uniqueItems) {
    if (currentTop === null || Math.abs(item.top - currentTop) <= Math.max(16, item.height * 0.6)) {
      currentLine.push(item);
      if (currentTop === null) currentTop = item.top;
    } else {
      currentLine.sort((a, b) => a.left - b.left);
      lines.push(currentLine.map((i) => i.text).join(' '));
      currentLine = [item];
      currentTop = item.top;
    }
  }

  if (currentLine.length > 0) {
    currentLine.sort((a, b) => a.left - b.left);
    lines.push(currentLine.map((i) => i.text).join(' '));
  }

  if (lines.length === 0) return null;

  // Single-line expression check (e.g. "36 / 6" or "66 + 9")
  if (lines.length === 1) {
    const single = lines[0].replace(/[–—−]/g, '-').trim();
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

  const bounds = getQuestionSpatialBounds();
  const dpr = window.devicePixelRatio || 1;

  const cropBounds = {
    x: Math.round(bounds.left * dpr),
    y: Math.round(bounds.top * dpr),
    width: Math.round((bounds.right - bounds.left) * dpr),
    height: Math.round((bounds.bottom - bounds.top) * dpr)
  };

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "CAPTURE_VISIBLE_TAB" }, async (resp) => {
      if (!resp || !resp.success) {
        reject(new Error(resp?.error || "Tab capture error"));
        return;
      }
      try {
        const cropped = await cropImage(resp.dataUrl, cropBounds);
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
