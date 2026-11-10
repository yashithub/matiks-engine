import { createWorker } from "tesseract.js";
import { extractExpression } from "./extract-expression.js";

let workerPromise = null;

// Known optical character recognition confusion pairs
const CONFUSION_PAIRS = [
  new Set(["6", "0"]),
  new Set(["8", "3"]),
  new Set(["1", "7"]),
  new Set(["5", "6"]),
  new Set(["8", "0"]),
  new Set(["9", "0"]),
  new Set(["2", "7"])
];

export async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng").catch((error) => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
}

/**
 * Normalizes symbols to canonical math tokens for comparison.
 */
export function normalizeCandidate(value) {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/[×xX]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, "")
    .replace(/=$/, "");
}

/**
 * Checks if two characters belong to a known OCR confusion pair.
 */
function isConfusionPair(charA, charB) {
  if (charA === charB) return false;
  return CONFUSION_PAIRS.some((pair) => pair.has(charA) && pair.has(charB));
}

/**
 * Inspects character-level alignment between candidate expressions
 * to locate specific digit conflicts and known ambiguities.
 */
export function detectCharacterConflicts(candidates) {
  if (candidates.length <= 1) return { hasConflict: false, conflicts: [] };

  const unique = [...new Set(candidates.map((c) => normalizeCandidate(c)))].filter(Boolean);
  if (unique.length <= 1) return { hasConflict: false, conflicts: [] };

  const conflicts = [];
  const reference = unique[0];

  for (let i = 1; i < unique.length; i++) {
    const comp = unique[i];
    const maxLen = Math.max(reference.length, comp.length);

    if (reference.length === comp.length) {
      for (let pos = 0; pos < maxLen; pos++) {
        const charA = reference[pos];
        const charB = comp[pos];
        if (charA !== charB) {
          const isDigit = /\d/.test(charA) && /\d/.test(charB);
          const isConfused = isConfusionPair(charA, charB);
          conflicts.push({
            position: pos,
            charA,
            charB,
            isDigit,
            isKnownConfusion: isConfused,
            description: isConfused
              ? `High-risk confusion between '${charA}' and '${charB}' at character ${pos + 1}`
              : `Disagreement between '${charA}' and '${charB}' at character ${pos + 1}`
          });
        }
      }
    } else {
      // Length mismatch: structural discrepancy
      conflicts.push({
        position: -1,
        charA: reference,
        charB: comp,
        isDigit: false,
        isKnownConfusion: false,
        description: `Structural disagreement: "${reference}" vs "${comp}"`
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    hasKnownConfusion: conflicts.some((c) => c.isKnownConfusion),
    conflicts
  };
}

/**
 * Executes single-pass OCR on an image source.
 */
export async function recognizeImage(source, options = {}) {
  const worker = await getWorker();
  const psm = options.psm || "6"; // PSM 6 handles multi-line blocks (Matiks format) and single lines cleanly

  await worker.setParameters({
    tessedit_char_whitelist: "0123456789+-*/:().%=xX×÷−? \n\r",
    load_system_dawg: "0",
    load_freq_dawg: "0",
    preserve_interword_spaces: "0",
    tessedit_pageseg_mode: psm
  });

  const startTime = performance.now();
  const result = await worker.recognize(source);
  const duration = Math.round(performance.now() - startTime);

  let expression = null;
  try {
    expression = extractExpression(result.data.text);
  } catch {
    // Expression extraction may throw if no arithmetic characters detected
  }

  return {
    text: result.data.text.trim(),
    expression,
    confidence: result.data.confidence,
    duration,
    psm
  };
}

/**
 * Runs multi-pass recognition across preprocessed variants and PSM modes,
 * then performs verification and ambiguity detection.
 */
export async function recognizeVariants(variants, options = {}) {
  const worker = await getWorker();
  const psmList = options.psmList || ["6", "4"];

  await worker.setParameters({
    tessedit_char_whitelist: "0123456789+-*/:().%=xX×÷−? \n\r",
    load_system_dawg: "0",
    load_freq_dawg: "0",
    preserve_interword_spaces: "0"
  });

  const attempts = [];
  const startOverall = performance.now();

  for (const psm of psmList) {
    await worker.setParameters({ tessedit_pageseg_mode: psm });

    for (const variant of variants) {
      const startPass = performance.now();
      const result = await worker.recognize(variant.blob);
      const passDuration = Math.round(performance.now() - startPass);

      let expression = null;
      try {
        expression = extractExpression(result.data.text);
      } catch {
        // preserve null expression for diagnostics
      }

      attempts.push({
        variant: variant.name,
        psm,
        text: result.data.text.trim(),
        expression,
        confidence: result.data.confidence,
        duration: passDuration
      });
    }
  }

  const totalDuration = Math.round(performance.now() - startOverall);
  const validAttempts = attempts.filter((a) => a.expression);

  // Group by canonical expression
  const groups = new Map();
  for (const item of validAttempts) {
    const key = normalizeCandidate(item.expression);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }

  // Sort groups by: count of agreeing passes desc, then avg confidence desc
  const ranked = [...groups.entries()].sort((a, b) => {
    const countDiff = b[1].length - a[1].length;
    if (countDiff !== 0) return countDiff;
    const avgConfA = a[1].reduce((s, x) => s + x.confidence, 0) / a[1].length;
    const avgConfB = b[1].reduce((s, x) => s + x.confidence, 0) / b[1].length;
    return avgConfB - avgConfA;
  });

  const allExpressions = validAttempts.map((a) => a.expression);
  const conflictReport = detectCharacterConflicts(allExpressions);

  const topGroup = ranked[0];
  const hasMultipleCompetingGroups = ranked.length > 1;

  // Ambiguity rules:
  // 1. If any known confusion pair was detected (e.g. 6 vs 0, 8 vs 3) -> AMBIGUOUS
  // 2. If the top candidate does not hold a clear majority (e.g. 3 vs 3, or top candidate < 50% of valid passes) -> AMBIGUOUS
  // 3. If no candidate was found -> AMBIGUOUS
  const isAmbiguous =
    !topGroup ||
    conflictReport.hasKnownConfusion ||
    (hasMultipleCompetingGroups && topGroup[1].length <= validAttempts.length / 2);

  const avgConfidence = topGroup
    ? Math.round((topGroup[1].reduce((sum, item) => sum + item.confidence, 0) / topGroup[1].length) * 10) / 10
    : 0;

  return {
    text: topGroup?.[1][0].text ?? (attempts[0]?.text || ""),
    expression: isAmbiguous ? null : topGroup?.[1][0].expression ?? null,
    candidateExpression: topGroup?.[1][0].expression ?? null,
    confidence: avgConfidence,
    ambiguous: isAmbiguous,
    conflictReport,
    attempts,
    totalDuration
  };
}

/**
 * High-speed single-pass OCR designed specifically for real-time live tracking (< 150ms).
 */
export async function recognizeFast(source) {
  const worker = await getWorker();
  await worker.setParameters({
    tessedit_char_whitelist: "0123456789+-*/:().%=xX×÷−? \n\r",
    load_system_dawg: "0",
    load_freq_dawg: "0",
    preserve_interword_spaces: "0",
    tessedit_pageseg_mode: "6"
  });

  const startTime = performance.now();
  const result = await worker.recognize(source);
  const duration = Math.round(performance.now() - startTime);

  let expression = null;
  try {
    expression = extractExpression(result.data.text);
  } catch {
    // preserve null
  }

  return {
    text: result.data.text.trim(),
    expression,
    confidence: result.data.confidence,
    duration
  };
}

export async function terminateOCR() {
  if (!workerPromise) return;
  try {
    const worker = await workerPromise;
    await worker.terminate();
  } catch {
    // Ignore termination errors on shutdown
  } finally {
    workerPromise = null;
  }
}
