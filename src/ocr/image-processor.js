// Preprocessing pipeline for arithmetic expression OCR

function toBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Image conversion to blob failed"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

/**
 * Converts image buffer to grayscale in-place.
 */
export function grayscale(data) {
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = lum;
    data[i + 1] = lum;
    data[i + 2] = lum;
  }
}

/**
 * Detects whether image background is predominantly dark.
 * Samples perimeter pixels (edges/corners).
 */
export function isDarkBackground(data, width, height) {
  let sampleSum = 0;
  let count = 0;
  const step = Math.max(1, Math.floor(width / 50));

  // Top and bottom borders
  for (let x = 0; x < width; x += step) {
    sampleSum += data[x * 4];
    sampleSum += data[((height - 1) * width + x) * 4];
    count += 2;
  }
  // Left and right borders
  for (let y = 0; y < height; y += step) {
    sampleSum += data[(y * width) * 4];
    sampleSum += data[(y * width + (width - 1)) * 4];
    count += 2;
  }

  const average = count > 0 ? sampleSum / count : 255;
  return average < 128;
}

/**
 * Inverts pixel values in-place (used to ensure dark text on light background).
 */
export function invert(data) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }
}

/**
 * Normalizes contrast via linear min-max histogram stretching.
 */
export function normalizeContrast(data) {
  let min = 255;
  let max = 0;

  for (let i = 0; i < data.length; i += 4) {
    const val = data[i];
    if (val < min) min = val;
    if (val > max) max = val;
  }

  const range = max - min;
  if (range <= 0 || range >= 250) return; // already optimal or flat

  const scale = 255 / range;
  for (let i = 0; i < data.length; i += 4) {
    const stretched = Math.min(255, Math.max(0, (data[i] - min) * scale));
    data[i] = stretched;
    data[i + 1] = stretched;
    data[i + 2] = stretched;
  }
}

/**
 * Applies a 3x3 median filter to eliminate salt-and-pepper noise while preserving edges.
 */
export function medianFilter(data, width, height) {
  const copy = new Uint8ClampedArray(data);
  const window = new Uint8Array(9);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let idx = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          window[idx++] = copy[((y + dy) * width + (x + dx)) * 4];
        }
      }
      window.sort();
      const med = window[4];
      const i = (y * width + x) * 4;
      data[i] = med;
      data[i + 1] = med;
      data[i + 2] = med;
    }
  }
}

/**
 * Computes Otsu's optimal global threshold.
 */
export function otsuThreshold(data) {
  const histogram = new Array(256).fill(0);
  const total = data.length / 4;

  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const value = data[i];
    histogram[value]++;
    sum += value;
  }

  let backgroundWeight = 0;
  let backgroundSum = 0;
  let maxVariance = 0;
  let threshold = 128;

  for (let i = 0; i < 256; i++) {
    backgroundWeight += histogram[i];
    if (!backgroundWeight) continue;

    const foregroundWeight = total - backgroundWeight;
    if (!foregroundWeight) break;

    backgroundSum += i * histogram[i];

    const meanBackground = backgroundSum / backgroundWeight;
    const meanForeground = (sum - backgroundSum) / foregroundWeight;

    const variance =
      backgroundWeight * foregroundWeight * (meanBackground - meanForeground) ** 2;

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }

  return threshold;
}

/**
 * Adaptive local thresholding with scale-dependent radius.
 * Avoids hollowing out thick characters (like 6, 8, 0).
 */
export function adaptiveThreshold(data, width, height, customRadius, customOffset) {
  const integral = new Float64Array((width + 1) * (height + 1));

  for (let y = 1; y <= height; y++) {
    let rowSum = 0;
    for (let x = 1; x <= width; x++) {
      const value = data[((y - 1) * width + (x - 1)) * 4];
      rowSum += value;
      integral[y * (width + 1) + x] =
        integral[(y - 1) * (width + 1) + x] + rowSum;
    }
  }

  // Window radius proportional to dimension, minimum 20px
  const radius = customRadius || Math.max(20, Math.min(50, Math.round(width / 35)));
  const offset = customOffset ?? 8;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - radius);
      const y1 = Math.max(0, y - radius);
      const x2 = Math.min(width - 1, x + radius);
      const y2 = Math.min(height - 1, y + radius);

      const a = y1 * (width + 1) + x1;
      const b = y1 * (width + 1) + x2 + 1;
      const c = (y2 + 1) * (width + 1) + x1;
      const d = (y2 + 1) * (width + 1) + x2 + 1;

      const sum = integral[d] - integral[b] - integral[c] + integral[a];
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);
      const mean = sum / count;

      const index = (y * width + x) * 4;
      const value = data[index] < mean - offset ? 0 : 255;

      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
    }
  }
}

/**
 * Auto-crops excess background borders around detected text glyphs,
 * focusing directly on the equation characters (critical for game screenshots).
 */
export function autoCropCanvas(canvas, padding = 36) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // In inverted image, text is dark glyphs (< 160)
      if (data[idx] < 160) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If text not found or spans nearly the whole canvas, keep canvas
  if (!found || (maxX - minX < 15) || (maxY - minY < 15)) {
    return canvas;
  }

  const rawCropW = maxX - minX + 1;
  const rawCropH = maxY - minY + 1;

  // Scale the cropped glyph region so characters have optimal neural net height (~80-120px per character)
  // Target total text box height around 450-550px for multi-line arithmetic
  const scale = Math.max(1.0, Math.min(5.5, 480 / Math.max(rawCropH, 50)));

  const scaledW = Math.round(rawCropW * scale);
  const scaledH = Math.round(rawCropH * scale);

  const finalW = scaledW + padding * 2;
  const finalH = scaledH + padding * 2;

  const cropped = document.createElement("canvas");
  cropped.width = finalW;
  cropped.height = finalH;
  const cctx = cropped.getContext("2d");
  cctx.imageSmoothingEnabled = true;
  cctx.imageSmoothingQuality = "high";

  // Pure white quiet zone
  cctx.fillStyle = "#ffffff";
  cctx.fillRect(0, 0, finalW, finalH);

  // Draw scaled cropped region centered inside quiet zone
  cctx.drawImage(
    canvas,
    minX, minY, rawCropW, rawCropH,
    padding, padding, scaledW, scaledH
  );

  return cropped;
}

/**
 * Adds a uniform quiet-zone padding around the image.
 * Tesseract's segmentation works significantly better with >= 24px white border.
 */
export function addQuietZone(canvas, padding = 32) {
  const paddedCanvas = document.createElement("canvas");
  paddedCanvas.width = canvas.width + padding * 2;
  paddedCanvas.height = canvas.height + padding * 2;

  const ctx = paddedCanvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
  ctx.drawImage(canvas, padding, padding);

  return paddedCanvas;
}

/**
 * Preprocesses a single image with selected settings.
 */
export async function preprocessImage(source, options = {}) {
  const mode = options.mode || "grayscale"; // "grayscale" | "otsu" | "adaptive" | "enhanced"
  const padding = options.padding ?? 28;

  const image = source instanceof ImageBitmap
    ? source
    : await createImageBitmap(source);

  // Target width around 1200-1600px for optimal glyph heights
  const targetWidth = options.targetWidth || 1400;
  const scale = options.scale || Math.max(1.5, Math.min(4, targetWidth / image.width));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  if (!(source instanceof ImageBitmap)) {
    image.close();
  }

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // 1. Grayscale
  grayscale(imgData.data);

  // 2. Check and correct background inversion
  if (isDarkBackground(imgData.data, canvas.width, canvas.height)) {
    invert(imgData.data);
  }

  // 3. Normalize contrast
  normalizeContrast(imgData.data);

  // 4. Apply mode-specific thresholding
  if (mode === "otsu") {
    const threshold = otsuThreshold(imgData.data);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const value = imgData.data[i] < threshold ? 0 : 255;
      imgData.data[i] = value;
      imgData.data[i + 1] = value;
      imgData.data[i + 2] = value;
    }
  } else if (mode === "adaptive") {
    adaptiveThreshold(imgData.data, canvas.width, canvas.height);
  } else if (mode === "enhanced") {
    // High-contrast clean grayscale with noise removal
    medianFilter(imgData.data, canvas.width, canvas.height);
  }

  ctx.putImageData(imgData, 0, 0);

  // 5. Auto-crop excess background and add quiet zone padding
  const cropped = autoCropCanvas(canvas, padding);
  const blob = await toBlob(cropped);

  return {
    canvas: cropped,
    blob,
    width: cropped.width,
    height: cropped.height
  };
}

/**
 * Creates diverse preprocessing variants designed to catch edge cases
 * (e.g. grayscale preserves antialiasing for 6 vs 0, Otsu eliminates noise, Adaptive handles lighting gradients).
 */
export async function preprocessVariants(source) {
  const image = await createImageBitmap(source);

  const targetWidth = 1400;
  const scale = Math.max(1.8, Math.min(3.5, targetWidth / image.width));

  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = Math.round(image.width * scale);
  baseCanvas.height = Math.round(image.height * scale);

  const ctx = baseCanvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
  ctx.drawImage(image, 0, 0, baseCanvas.width, baseCanvas.height);
  image.close();

  const originalData = ctx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
  grayscale(originalData.data);

  // Invert if dark background
  if (isDarkBackground(originalData.data, baseCanvas.width, baseCanvas.height)) {
    invert(originalData.data);
  }

  normalizeContrast(originalData.data);
  ctx.putImageData(originalData, 0, 0);

  // Auto-crop excess background margins around the numbers
  const croppedCanvas = autoCropCanvas(baseCanvas, 28);
  const croppedCtx = croppedCanvas.getContext("2d", { willReadFrequently: true });
  const workingData = croppedCtx.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);

  // Variant 1: Enhanced Grayscale (clean antialiased glyphs, highest fidelity for Tesseract LSTM)
  const grayCanvas = document.createElement("canvas");
  grayCanvas.width = croppedCanvas.width;
  grayCanvas.height = croppedCanvas.height;
  const grayCtx = grayCanvas.getContext("2d");
  const grayData = new ImageData(
    new Uint8ClampedArray(workingData.data),
    croppedCanvas.width,
    croppedCanvas.height
  );
  grayCtx.putImageData(grayData, 0, 0);

  // Variant 2: Otsu Global Threshold
  const otsuCanvas = document.createElement("canvas");
  otsuCanvas.width = croppedCanvas.width;
  otsuCanvas.height = croppedCanvas.height;
  const otsuCtx = otsuCanvas.getContext("2d");
  const otsuData = new ImageData(
    new Uint8ClampedArray(workingData.data),
    croppedCanvas.width,
    croppedCanvas.height
  );
  const threshold = otsuThreshold(otsuData.data);
  for (let i = 0; i < otsuData.data.length; i += 4) {
    const val = otsuData.data[i] < threshold ? 0 : 255;
    otsuData.data[i] = val;
    otsuData.data[i + 1] = val;
    otsuData.data[i + 2] = val;
  }
  otsuCtx.putImageData(otsuData, 0, 0);

  // Variant 3: Adaptive Threshold with stroke-preserving dynamic window
  const adaptiveCanvas = document.createElement("canvas");
  adaptiveCanvas.width = croppedCanvas.width;
  adaptiveCanvas.height = croppedCanvas.height;
  const adaptiveCtx = adaptiveCanvas.getContext("2d");
  const adaptiveData = new ImageData(
    new Uint8ClampedArray(workingData.data),
    croppedCanvas.width,
    croppedCanvas.height
  );
  adaptiveThreshold(adaptiveData.data, croppedCanvas.width, croppedCanvas.height);
  adaptiveCtx.putImageData(adaptiveData, 0, 0);

  return [
    { name: "grayscale", blob: await toBlob(grayCanvas), canvas: grayCanvas },
    { name: "otsu", blob: await toBlob(otsuCanvas), canvas: otsuCanvas },
    { name: "adaptive", blob: await toBlob(adaptiveCanvas), canvas: adaptiveCanvas }
  ];
}
