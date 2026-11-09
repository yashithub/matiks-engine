
import { createWorker } from "tesseract.js";
import { extractExpression } from "./extract-expression.js";

let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng").catch((error) => {
      workerPromise = null;
      throw error;
    });
  }

  return workerPromise;
}

function normalizeCandidate(value) {
  return value
    .toLowerCase()
    .replace(/[×x]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/\s+/g, "")
    .replace(/=$/, "");
}

export async function recognizeVariants(variants) {
  const worker = await getWorker();

  await worker.setParameters({
    tessedit_char_whitelist:
      "0123456789+-*/().%=xX×÷−? ",

    load_system_dawg: "0",
    load_freq_dawg: "0",
    preserve_interword_spaces: "1"
  });

  const attempts = [];

  for (const variant of variants) {
    for (const psm of ["7", "13"]) {
      await worker.setParameters({
        tessedit_pageseg_mode: psm
      });

      const result = await worker.recognize(variant.blob);

      let expression = null;

      try {
        expression = extractExpression(result.data.text);
      } catch {
        // Preserve unsuccessful attempts for diagnostics.
      }

      attempts.push({
        variant: variant.name,
        psm,
        text: result.data.text.trim(),
        expression,
        confidence: result.data.confidence
      });
    }
  }

  const valid = attempts.filter(item => item.expression);

  const groups = new Map();

  for (const item of valid) {
    const key = normalizeCandidate(item.expression);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(item);
  }

  const ranked = [...groups.entries()].sort(
    (a, b) => b[1].length - a[1].length
  );

  const winner = ranked[0];

  const ambiguous =
    !winner ||
    (ranked.length > 1 &&
      winner[1].length === ranked[1][1].length);

  return {
    text: winner?.[1][0].text ?? "",
    expression: ambiguous ? null : winner?.[1][0].expression ?? null,
    confidence: winner
      ? winner[1].reduce((sum, item) => sum + item.confidence, 0)
        / winner[1].length
      : 0,
    ambiguous,
    attempts
  };
}

export async function terminateOCR() {
  if (!workerPromise) return;

  const worker = await workerPromise;
  await worker.terminate();

  workerPromise = null;
}
