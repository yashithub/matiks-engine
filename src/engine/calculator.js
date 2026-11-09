
import { normalizeExpression } from "./normalizer.js";
import { parseExpression } from "./parser.js";

export function calculate(expression) {
  const normalized = normalizeExpression(expression);
  const result = parseExpression(normalized);

  if (!Number.isFinite(result)) {
    throw new Error("Result is not a finite number");
  }

  return {
    originalExpression: expression,
    normalizedExpression: normalized,
    result: Object.is(result, -0) ? 0 : result
  };
}
