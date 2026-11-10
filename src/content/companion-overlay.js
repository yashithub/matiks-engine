/**
 * Floating companion HUD for displaying practice calculations on-screen in real time.
 * Uses isolated Shadow DOM to avoid CSS collisions with host game websites.
 * Supports smooth updates, draggability, minimizability, and live tracking status.
 */

let overlayState = {
  minimized: false,
  posX: null,
  posY: null,
  liveTracking: true
};

export function getCompanionContainer() {
  const containerId = "matiks-companion-root";
  let host = document.getElementById(containerId);
  if (!host) {
    host = document.createElement("div");
    host.id = containerId;
    document.body.appendChild(host);
  }
  return host;
}

export function showCompanionResult({
  expression,
  answer,
  ambiguous = false,
  conflicts = null,
  isLiveTracking = true,
  onToggleTracking = null,
  onManualScan = null
}) {
  overlayState.liveTracking = isLiveTracking;
  const host = getCompanionContainer();
  const shadow = host.attachShadow ? (host.shadowRoot || host.attachShadow({ mode: "open" })) : host;

  let existingCard = shadow.querySelector("#matiks-hud-card");
  if (existingCard) {
    // Update contents smoothly without resetting drag position or state
    const exprEl = existingCard.querySelector(".expr");
    const ansEl = existingCard.querySelector(".answer-val");
    const statusDot = existingCard.querySelector(".status-dot");
    const statusText = existingCard.querySelector(".status-text");

    if (exprEl) exprEl.textContent = expression || "Scanning board...";
    if (ansEl) {
      if (ambiguous) {
        ansEl.innerHTML = `<span style="font-size: 16px; color: #facc15;">⚠️ Verify: ${answer}</span>`;
      } else {
        ansEl.textContent = answer !== null && answer !== undefined ? answer : "—";
      }
    }
    if (statusDot) {
      statusDot.className = `status-dot ${isLiveTracking ? "active" : "paused"}`;
    }
    if (statusText) {
      statusText.textContent = isLiveTracking ? "LIVE" : "PAUSED";
    }

    const pillVal = existingCard.querySelector(".min-pill-val");
    if (pillVal) {
      pillVal.textContent = answer !== null && answer !== undefined ? answer : "—";
    }
    return;
  }

  // Initial mount
  shadow.innerHTML = "";

  const style = document.createElement("style");
  style.textContent = `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    .hud-card {
      position: fixed;
      top: 120px;
      right: 36px;
      width: 290px;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(59, 130, 246, 0.4);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.65), 0 0 16px rgba(59, 130, 246, 0.15);
      border-radius: 14px;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
      padding: 14px;
      z-index: 2147483647;
      user-select: none;
      transition: box-shadow 0.2s ease, opacity 0.2s ease;
    }
    .hud-card.minimized {
      width: auto;
      padding: 8px 14px;
      border-radius: 24px;
      background: rgba(15, 23, 42, 0.96);
      cursor: pointer;
    }
    .hud-card.minimized .full-view {
      display: none;
    }
    .hud-card.minimized .min-view {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .min-view {
      display: none;
      font-size: 14px;
      font-weight: 700;
      color: #4ade80;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.7);
      padding-bottom: 8px;
      cursor: move;
    }
    .title-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #60a5fa;
      font-weight: 800;
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(30, 41, 59, 0.8);
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #64748b;
    }
    .status-dot.active {
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
      animation: pulse 1.5s infinite;
    }
    .status-dot.paused {
      background: #eab308;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-icon {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      padding: 2px;
      line-height: 1;
      border-radius: 4px;
    }
    .btn-icon:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.1);
    }
    .expr-container {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(30, 41, 59, 0.9);
      border-radius: 8px;
      padding: 6px 10px;
      margin-bottom: 8px;
    }
    .expr-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 2px;
    }
    .expr {
      font-size: 13px;
      color: #cbd5e1;
      font-family: "SFMono-Regular", Consolas, "Courier New", monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .answer-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: 10px;
      padding: 10px;
      margin-bottom: 8px;
    }
    .answer-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #94a3b8;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .answer-val {
      font-size: 32px;
      font-weight: 900;
      color: #4ade80;
      text-shadow: 0 0 16px rgba(74, 222, 128, 0.35);
      line-height: 1.1;
    }
    .actions-row {
      display: flex;
      gap: 6px;
    }
    .btn-action {
      flex: 1;
      background: #1e293b;
      border: 1px solid #334155;
      color: #cbd5e1;
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.15s ease;
    }
    .btn-action:hover {
      background: #334155;
      color: #f8fafc;
    }
    .btn-action.active {
      border-color: #22c55e;
      color: #4ade80;
    }
  `;
  shadow.appendChild(style);

  const card = document.createElement("div");
  card.id = "matiks-hud-card";
  card.className = "hud-card";

  card.innerHTML = `
    <!-- Minimized View -->
    <div class="min-view">
      <span class="status-dot ${isLiveTracking ? "active" : "paused"}"></span>
      <span style="font-size: 11px; color: #94a3b8;">ANS:</span>
      <span class="min-pill-val">${answer !== null && answer !== undefined ? answer : "—"}</span>
    </div>

    <!-- Full View -->
    <div class="full-view">
      <div class="header">
        <div class="title-row">
          <span class="title">Matiks Companion</span>
          <div class="status-badge">
            <span class="status-dot ${isLiveTracking ? "active" : "paused"}"></span>
            <span class="status-text">${isLiveTracking ? "LIVE" : "PAUSED"}</span>
          </div>
        </div>
        <div class="controls">
          <button class="btn-icon btn-min" title="Minimize to pill">_</button>
          <button class="btn-icon btn-close" title="Hide HUD">&times;</button>
        </div>
      </div>

      <div class="expr-container">
        <div class="expr-label">Current Equation</div>
        <div class="expr">${expression || "Scanning board..."}</div>
      </div>

      <div class="answer-box">
        <div class="answer-label">Calculated Answer</div>
        <div class="answer-val">${answer !== null && answer !== undefined ? answer : "—"}</div>
      </div>

      <div class="actions-row">
        <button class="btn-action btn-toggle ${isLiveTracking ? "active" : ""}">
          ${isLiveTracking ? "● Live Tracking On" : "○ Live Tracking Off"}
        </button>
        <button class="btn-action btn-scan">⚡ Scan</button>
      </div>
    </div>
  `;

  // Dragging logic
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let cardInitialLeft = 0;
  let cardInitialTop = 0;

  const header = card.querySelector(".header");

  header.onmousedown = (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = card.getBoundingClientRect();
    cardInitialLeft = rect.left;
    cardInitialTop = rect.top;

    function onMouseMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const newX = Math.max(10, Math.min(window.innerWidth - card.offsetWidth - 10, cardInitialLeft + dx));
      const newTop = Math.max(10, Math.min(window.innerHeight - card.offsetHeight - 10, cardInitialTop + dy));
      card.style.right = "auto";
      card.style.left = `${newX}px`;
      card.style.top = `${newTop}px`;
      overlayState.posX = newX;
      overlayState.posY = newTop;
    }

    function onMouseUp() {
      isDragging = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Min/Max toggle
  const minBtn = card.querySelector(".btn-min");
  const minView = card.querySelector(".min-view");

  function toggleMinimize() {
    overlayState.minimized = !overlayState.minimized;
    card.classList.toggle("minimized", overlayState.minimized);
  }

  minBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMinimize();
  };

  minView.onclick = () => {
    toggleMinimize();
  };

  // Close HUD
  const closeBtn = card.querySelector(".btn-close");
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
  };

  // Action buttons
  const toggleBtn = card.querySelector(".btn-toggle");
  toggleBtn.onclick = (e) => {
    e.stopPropagation();
    if (onToggleTracking) onToggleTracking();
  };

  const scanBtn = card.querySelector(".btn-scan");
  scanBtn.onclick = (e) => {
    e.stopPropagation();
    if (onManualScan) onManualScan();
  };

  shadow.appendChild(card);
}
