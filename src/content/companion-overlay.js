/**
 * Floating companion HUD for displaying practice calculations on-screen.
 * Uses isolated Shadow DOM to avoid CSS collisions with host practice websites.
 */

export function showCompanionResult({ expression, answer, ambiguous, conflicts, onDismiss }) {
  const containerId = "matiks-companion-root";
  let host = document.getElementById(containerId);
  if (!host) {
    host = document.createElement("div");
    host.id = containerId;
    document.body.appendChild(host);
  }

  const shadow = host.attachShadow ? (host.shadowRoot || host.attachShadow({ mode: "open" })) : host;
  shadow.innerHTML = "";

  const style = document.createElement("style");
  style.textContent = `
    .badge-card {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 320px;
      background: #0f172a;
      border: 1px solid #1e293b;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6);
      border-radius: 14px;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 18px;
      z-index: 2147483647;
      animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 8px;
    }
    .title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #60a5fa;
      font-weight: 700;
    }
    .close {
      cursor: pointer;
      color: #94a3b8;
      background: none;
      border: none;
      font-size: 18px;
      line-height: 1;
      padding: 0 4px;
    }
    .close:hover { color: #f8fafc; }
    .expr {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 6px;
      font-family: "SFMono-Regular", Consolas, monospace;
    }
    .answer-val {
      font-size: 28px;
      font-weight: 800;
      color: #4ade80;
      margin-bottom: 10px;
    }
    .ambiguous-alert {
      background: rgba(234, 179, 8, 0.15);
      border: 1px solid #eab308;
      color: #fef08a;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      margin-top: 8px;
    }
  `;
  shadow.appendChild(style);

  const card = document.createElement("div");
  card.className = "badge-card";

  card.innerHTML = `
    <div class="header">
      <span class="title">Matiks Companion</span>
      <button class="close">&times;</button>
    </div>
    <div class="expr">${expression || "Unknown Expression"}</div>
    ${
      ambiguous
        ? `<div class="ambiguous-alert">
             ⚠️ Ambiguity detected (${conflicts?.[0]?.description || "Conflicting digits"}). Please verify manually.
           </div>`
        : `<div class="answer-val">${answer !== null && answer !== undefined ? answer : "--"}</div>`
    }
  `;

  card.querySelector(".close").onclick = () => {
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
    if (onDismiss) onDismiss();
  };

  shadow.appendChild(card);
}

