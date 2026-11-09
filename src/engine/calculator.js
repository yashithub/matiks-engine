import { normalizeExpression } from "./normalizer.js";
import { parseExpression } from "./parser.js";

/**
 * Normalizes floating point numbers to eliminate binary rounding noise (e.g. 0.30000000000000004 -> 0.3)
 */
function cleanNumber(num) {
  if (Object.is(num, -0)) return 0;
  if (!Number.isFinite(num)) return num;

  // Exact integer check
  if (Math.abs(num - Math.round(num)) < 1e-12) {
    return Math.round(num);
  }

  // Float precision cleanup: 12 significant digits removes IEEE-754 precision noise
  return parseFloat(num.toPrecision(12));
}

export function calculate(expression) {
  const normalized = normalizeExpression(expression);
  const result = parseExpression(normalized);

  if (!Number.isFinite(result)) {
    throw new Error("Result is not a finite number");
  }

  return {
    originalExpression: expression,
    normalizedExpression: normalized,
    result: cleanNumber(result)
  };
}
