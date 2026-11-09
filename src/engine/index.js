
export { normalizeExpression } from "./normalizer.js";

export {
  tokenize,
  parseExpression
} from "./parser.js";

export { calculate } from "./calculator.js";

export { validateResult } from "./validator.js";

import { calculate } from "./calculator.js";

export function solve(expression) {
  const {
    originalExpression,
    normalizedExpression,
    result
  } = calculate(expression);

  return {
    success: true,
    originalExpression,
    normalizedExpression,
    answer: result
  };
}
