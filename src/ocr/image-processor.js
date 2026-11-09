
function toBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Image conversion failed"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function grayscale(data) {
  for (let i = 0; i < data.length; i += 4) {
    const value =
      0.299 * data[i] +
      0.587 * data[i + 1] +
      0.114 * data[i + 2];

    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
}

function otsuThreshold(data) {
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
    const meanForeground =
      (sum - backgroundSum) / foregroundWeight;

    const variance =
      backgroundWeight *
      foregroundWeight *
      (meanBackground - meanForeground) ** 2;

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }

  return threshold;
}

function adaptiveThreshold(data, width, height) {
  // Integral image for efficient local mean calculation.
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

  const radius = 15;
  const offset = 10;

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

      const sum =
        integral[d] - integral[b] - integral[c] + integral[a];

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

export async function preprocessVariants(file) {
  const image = await createImageBitmap(file);

  const scale = Math.max(3, Math.min(4, 1600 / image.width));

  const canvas = document.createElement("canvas");

  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true
  });

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  const original = ctx.getImageData(
    0, 0, canvas.width, canvas.height
  );

  // Variant A: grayscale, preserving character details.
  const grayCanvas = document.createElement("canvas");
  grayCanvas.width = canvas.width;
  grayCanvas.height = canvas.height;

  const grayCtx = grayCanvas.getContext("2d");
  const grayData = new ImageData(
    new Uint8ClampedArray(original.data),
    canvas.width,
    canvas.height
  );

  grayscale(grayData.data);
  grayCtx.putImageData(grayData, 0, 0);

  // Variant B: Otsu threshold.
  const otsuCanvas = document.createElement("canvas");
  otsuCanvas.width = canvas.width;
  otsuCanvas.height = canvas.height;

  const otsuCtx = otsuCanvas.getContext("2d");
  const otsuData = new ImageData(
    new Uint8ClampedArray(grayData.data),
    canvas.width,
    canvas.height
  );

  const threshold = otsuThreshold(otsuData.data);

  for (let i = 0; i < otsuData.data.length; i += 4) {
    const value = otsuData.data[i] < threshold ? 0 : 255;

    otsuData.data[i] = value;
    otsuData.data[i + 1] = value;
    otsuData.data[i + 2] = value;
  }

  otsuCtx.putImageData(otsuData, 0, 0);

  // Variant C: adaptive threshold.
  const adaptiveCanvas = document.createElement("canvas");
  adaptiveCanvas.width = canvas.width;
  adaptiveCanvas.height = canvas.height;

  const adaptiveCtx = adaptiveCanvas.getContext("2d");
  const adaptiveData = new ImageData(
    new Uint8ClampedArray(grayData.data),
    canvas.width,
    canvas.height
  );

  adaptiveThreshold(
    adaptiveData.data,
    canvas.width,
    canvas.height
  );

  adaptiveCtx.putImageData(adaptiveData, 0, 0);

  return [
    { name: "grayscale", blob: await toBlob(grayCanvas) },
    { name: "otsu", blob: await toBlob(otsuCanvas) },
    { name: "adaptive", blob: await toBlob(adaptiveCanvas) }
  ];
}
