import { BENCHMARK_DATASET } from "./dataset.js";
import { renderBenchmarkImage, canvasToBlob } from "./image-generator.js";
import { preprocessImage, preprocessVariants } from "../ocr/image-processor.js";
import { recognizeImage, recognizeVariants } from "../ocr/ocr-engine.js";
import { aggregateMetrics, computeCER, computeDigitAccuracy, normalizeForEval } from "./metrics.js";

/**
 * Executes an automated benchmark run across test images.
 * @param {Object} options
 * @param {Array} options.dataset - Custom or subset dataset (defaults to full 100)
 * @param {string} options.mode - "consensus" | "grayscale" | "otsu" | "adaptive"
 * @param {Function} options.onProgress - Progress callback ({ current, total, item, result })
 */
export async function runBenchmark(options = {}) {
  const dataset = options.dataset || BENCHMARK_DATASET;
  const mode = options.mode || "consensus";
  const onProgress = options.onProgress || (() => {});

  const results = [];

  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i];
    const canvas = renderBenchmarkImage(item);
    const blob = await canvasToBlob(canvas);

    let predicted = "";
    let duration = 0;
    let confidence = 0;
    let isAmbiguous = false;

    const startTime = performance.now();

    if (mode === "consensus") {
      const variants = await preprocessVariants(blob);
      const res = await recognizeVariants(variants, { psmList: ["7", "13"] });
      predicted = res.expression || res.candidateExpression || "";
      confidence = res.confidence;
      isAmbiguous = res.ambiguous;
      duration = Math.round(performance.now() - startTime);
    } else {
      // Single pass mode
      const preprocessed = await preprocessImage(blob, { mode });
      const res = await recognizeImage(preprocessed.blob, { psm: "7" });
      predicted = res.expression || "";
      confidence = res.confidence;
      duration = Math.round(performance.now() - startTime);
    }

    const normGT = normalizeForEval(item.expression);
    const normPred = normalizeForEval(predicted);
    const isExact = normGT === normPred && normGT.length > 0;
    const cer = computeCER(normGT, normPred);
    const digitAcc = computeDigitAccuracy(normGT, normPred);

    const itemResult = {
      id: item.id,
      expression: item.expression,
      groundTruth: item.expression,
      predicted,
      confidence,
      duration,
      isExact,
      cer,
      digitAcc,
      isAmbiguous,
      font: item.font,
      theme: item.theme
    };

    results.push(itemResult);
    onProgress({
      current: i + 1,
      total: dataset.length,
      item,
      result: itemResult
    });
  }

  const summary = aggregateMetrics(results);

  return {
    mode,
    timestamp: new Date().toISOString(),
    summary,
    results
  };
}

