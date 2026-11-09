/**
 * Evaluates OCR performance against ground truth expressions.
 */

/**
 * Computes classic Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Computes Character Error Rate (CER).
 * CER = Levenshtein Distance / length of ground truth.
 */
export function computeCER(groundTruth, predicted) {
  if (!groundTruth || groundTruth.length === 0) {
    return predicted && predicted.length > 0 ? 1 : 0;
  }
  const dist = levenshteinDistance(groundTruth, predicted || "");
  return Math.min(1, dist / groundTruth.length);
}

/**
 * Normalizes expression for fair mathematical comparison.
 */
export function normalizeForEval(expr) {
  if (!expr) return "";
  return expr
    .replace(/[×xX]/g, "*")
    .replace(/[÷]/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, "")
    .replace(/=.*$/, "")
    .replace(/\?.*$/, "");
}

/**
 * Computes Digit Recognition Accuracy (% of ground-truth digits correctly recognized).
 */
export function computeDigitAccuracy(groundTruth, predicted) {
  const gtDigits = (groundTruth.match(/\d/g) || []);
  if (gtDigits.length === 0) return 1.0;

  const predDigits = (predicted.match(/\d/g) || []);
  let matches = 0;
  const minLen = Math.min(gtDigits.length, predDigits.length);

  for (let i = 0; i < minLen; i++) {
    if (gtDigits[i] === predDigits[i]) {
      matches++;
    }
  }

  return matches / gtDigits.length;
}

/**
 * Computes aggregate summary statistics for a benchmark run.
 */
export function aggregateMetrics(results) {
  if (!results || results.length === 0) {
    return {
      total: 0,
      exactMatchCount: 0,
      exactMatchRate: 0,
      averageCER: 0,
      averageDigitAccuracy: 0,
      falsePositiveRate: 0,
      avgLatencyMs: 0,
      medianLatencyMs: 0,
      p90LatencyMs: 0
    };
  }

  let exactMatches = 0;
  let totalCER = 0;
  let totalDigitAcc = 0;
  let falsePositives = 0;
  const latencies = [];

  for (const item of results) {
    const normGT = normalizeForEval(item.groundTruth);
    const normPred = normalizeForEval(item.predicted);

    const isExact = normGT === normPred && normGT.length > 0;
    if (isExact) exactMatches++;

    const cer = computeCER(normGT, normPred);
    totalCER += cer;

    const digitAcc = computeDigitAccuracy(normGT, normPred);
    totalDigitAcc += digitAcc;

    // False positive: predicted expression when none existed, or high-confidence hallucination
    if (!normGT && normPred) {
      falsePositives++;
    }

    if (typeof item.duration === "number") {
      latencies.push(item.duration);
    }
  }

  latencies.sort((a, b) => a - b);
  const n = results.length;

  const avgLatency = latencies.length > 0
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : 0;

  const medianLatency = latencies.length > 0
    ? latencies[Math.floor(latencies.length / 2)]
    : 0;

  const p90Latency = latencies.length > 0
    ? latencies[Math.floor(latencies.length * 0.9)]
    : 0;

  return {
    total: n,
    exactMatchCount: exactMatches,
    exactMatchRate: Math.round((exactMatches / n) * 1000) / 10, // percentage e.g. 94.2%
    averageCER: Math.round((totalCER / n) * 1000) / 1000,
    averageDigitAccuracy: Math.round((totalDigitAcc / n) * 1000) / 10,
    falsePositiveRate: Math.round((falsePositives / n) * 1000) / 10,
    avgLatencyMs: avgLatency,
    medianLatencyMs: medianLatency,
    p90LatencyMs: p90Latency
  };
}

