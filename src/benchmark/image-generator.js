/**
 * Procedurally generates synthetic arithmetic expression images on HTML5 Canvas.
 * Supports configurable font family, size, contrast, background, and noise.
 */

export function renderBenchmarkImage(item, options = {}) {
  const canvas = document.createElement("canvas");
  const width = options.width || 600;
  const height = options.height || 180;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const theme = item.theme || "light";

  // Background and text colors based on theme
  let bg = "#ffffff";
  let fg = "#111827";

  if (theme === "dark") {
    bg = "#0f172a";
    fg = "#f8fafc";
  } else if (theme === "low-contrast") {
    bg = "#e2e8f0";
    fg = "#64748b"; // lower contrast ratio ~3:1
  }

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Set font
  const fontSize = item.size || 36;
  const fontFamily = item.font || "Arial";
  ctx.font = `600 ${fontSize}px "${fontFamily}", system-ui, sans-serif`;
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textToRender = item.format || item.expression;
  const lines = textToRender.split(/\r?\n/);
  const lineHeight = fontSize * 1.35;
  const totalBlockHeight = lines.length * lineHeight;
  const startY = (height - totalBlockHeight) / 2 + lineHeight / 2;

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, startY + idx * lineHeight);
  });

  // Optional synthetic noise injection
  if (options.addNoise) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const noiseLevel = options.noiseLevel || 0.02;

    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < noiseLevel) {
        const noise = Math.random() < 0.5 ? 0 : 255;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return canvas;
}

/**
 * Converts a generated canvas to an image Blob.
 */
export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas conversion to blob failed"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

