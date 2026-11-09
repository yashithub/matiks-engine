/**
 * Non-invasive screen region selection overlay for arithmetic capture.
 */

export function startRegionSelection(onSelected, onCancel) {
  // Check if overlay already exists
  if (document.getElementById("matiks-capture-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "matiks-capture-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(10, 15, 26, 0.45)",
    zIndex: "2147483647",
    cursor: "crosshair",
    userSelect: "none"
  });

  const banner = document.createElement("div");
  banner.textContent = "Matiks Companion: Drag to select arithmetic question · Press ESC to cancel";
  Object.assign(banner.style, {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "8px 18px",
    background: "#0f172a",
    color: "#93c5fd",
    border: "1px solid #3b82f6",
    borderRadius: "20px",
    fontFamily: "Inter, sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
    pointerEvents: "none"
  });
  overlay.appendChild(banner);

  const box = document.createElement("div");
  Object.assign(box.style, {
    position: "absolute",
    border: "2px solid #3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    display: "none",
    pointerEvents: "none"
  });
  overlay.appendChild(box);

  let startX = 0;
  let startY = 0;
  let isDragging = false;

  function onMouseDown(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    box.style.left = `${startX}px`;
    box.style.top = `${startY}px`;
    box.style.width = "0px";
    box.style.height = "0px";
    box.style.display = "block";
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const currentX = e.clientX;
    const currentY = e.clientY;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
  }

  function cleanup() {
    window.removeEventListener("keydown", onKeyDown);
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  function onMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;

    const left = parseInt(box.style.left, 10);
    const top = parseInt(box.style.top, 10);
    const width = parseInt(box.style.width, 10);
    const height = parseInt(box.style.height, 10);

    cleanup();

    if (width > 20 && height > 15) {
      const dpr = window.devicePixelRatio || 1;
      onSelected({
        x: Math.round(left * dpr),
        y: Math.round(top * dpr),
        width: Math.round(width * dpr),
        height: Math.round(height * dpr)
      });
    } else if (onCancel) {
      onCancel();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      cleanup();
      if (onCancel) onCancel();
    }
  }

  overlay.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("keydown", onKeyDown);

  document.body.appendChild(overlay);
}

/**
 * Crops a full-page dataURL using canvas and bounding coordinates.
 */
export async function cropImage(dataUrl, bounds) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = bounds.width;
      canvas.height = bounds.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        img,
        bounds.x, bounds.y, bounds.width, bounds.height,
        0, 0, bounds.width, bounds.height
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Crop conversion failed"));
          return;
        }
        resolve({
          blob,
          dataUrl: canvas.toDataURL("image/png")
        });
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load full screenshot for cropping"));
    img.src = dataUrl;
  });
}

