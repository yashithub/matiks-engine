/**
 * Merges digits separated only by spaces on the same line.
 * In math formulas, spaced digits on a single line (e.g. "4 1" or "+4 1")
 * are tabular kerning artifacts of the same multi-digit number ("41" or "+41").
 */
export function collapseSpacedDigits(str) {
  if (!str) return "";
  let prev = str;
  while (true) {
    const next = prev.replace(/(\d)\s+(\d)/g, (match, d1, d2) => d1 + d2);
    if (next === prev) break;
    prev = next;
  }
  return prev;
}

/**
 * Assembles multi-line vertical math problems (like Matiks game format) into a single expression.
 * Handles formats like:
 *   5
 * + 41
 * - 3
 * -> "5 + 41 - 3"
 *
 *   25
 * × 16
 * -> "25 × 16"
 *
 *   5
 *   +
 *   41
 * -> "5 + 41"
 */
export function assembleVerticalExpression(lines) {
  const cleanTokens = [];

  for (const rawLine of lines) {
    // 1. Collapse spaced digits within the line (e.g. "+4 1" -> "+41")
    let line = collapseSpacedDigits(rawLine);

    // 2. Normalize dashes and underscores to minus, strip equals/prompts
    line = line
      .replace(/[–—−_]/g, "-")
      .replace(/[:∕]/g, "/")
      .replace(/[=?#~]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!line) continue;

    // Match numbers, operators, decimals, parentheses
    const matched = line.match(/(?:[+\-*/%×÷−xX^()]+|\d+(?:\.\d+)?|\.\d+)/g);
    if (matched) {
      cleanTokens.push(...matched);
    }
  }

  if (cleanTokens.length < 2) return null;

  // Reconstruct string with canonical spacing
  let reconstructed = "";
  for (let i = 0; i < cleanTokens.length; i++) {
    const token = cleanTokens[i];
    const prev = i > 0 ? cleanTokens[i - 1] : null;

    if (!prev) {
      reconstructed += token;
    } else {
      const prevIsNum = /^\d/.test(prev);
      const currIsNum = /^\d/.test(token);

      if (prevIsNum && currIsNum) {
        // Two numbers stacked vertically with no explicit operator (standard column addition)
        reconstructed += " + " + token;
      } else if (i === 1 && prev === "-" && currIsNum) {
        // Unary minus at the beginning: "-10" instead of "- 10"
        reconstructed += token;
      } else if (/[+\-*/%×÷−xX^]/.test(token) || /[+\-*/%×÷−xX^]/.test(prev)) {
        reconstructed += " " + token;
      } else {
        reconstructed += " " + token;
      }
    }
  }

  reconstructed = reconstructed.trim();

  // Strip any trailing operator that was left hanging
  reconstructed = reconstructed.replace(/[+\-*/%×÷−xX^]+$/, "").trim();

  const digitCount = (reconstructed.match(/\d/g) || []).length;
  const hasOperator = /[+\-*/%×÷−xX^]/.test(reconstructed);

  if (digitCount >= 2 && hasOperator) {
    return reconstructed;
  }

  return null;
}

/**
 * Extracts and cleans a valid arithmetic expression from raw OCR text.
 * Automatically detects whether OCR output is a multi-line vertical problem
 * (e.g. Matiks format: 5 \n + 41 \n - 3) or a horizontal single-line problem.
 */
export function extractExpression(ocrText) {
  if (!ocrText || typeof ocrText !== "string") {
    throw new Error("No OCR text received");
  }

  // Pre-normalize spaced digits across rows (e.g. "+4 1" -> "+41")
  const normalizedOcr = collapseSpacedDigits(ocrText);

  const lines = normalizedOcr
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error("No arithmetic expression detected. Try a clearer image.");
  }

  // 1. Try vertical multi-line assembly first if more than 1 non-empty line exists
  const mathLines = lines.filter((line) => {
    const cleaned = line.replace(/[–—−_]/g, "-").replace(/[:∕]/g, "/").replace(/[=?#~]/g, "").trim();
    return /[\d+\-*/%×÷−xX^]/.test(cleaned);
  });

  if (mathLines.length > 1) {
    const verticalCandidate = assembleVerticalExpression(mathLines);
    if (verticalCandidate) {
      return verticalCandidate;
    }
  }

  // 2. Fallback: Search line-by-line for horizontal expressions (e.g. "25 × 16 = ?")
  const candidates = [];

  for (const line of lines) {
    let expressionPart = line;

    if (expressionPart.includes("=")) {
      const parts = expressionPart.split("=");
      const before = parts[0].trim();
      const after = parts.slice(1).join("=").trim();

      if (/[+\-*/%×÷−xX^]/.test(before)) {
        expressionPart = before;
      } else if (/[+\-*/%×÷−xX^]/.test(after)) {
        expressionPart = after;
      } else {
        expressionPart = before;
      }
    }

    let cleaned = expressionPart
      .replace(/[?_#~]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const match = cleaned.match(/[-+*/%×÷−xX\d().\s^]+/);
    if (!match) continue;

    let candidate = match[0].trim();
    candidate = candidate.replace(/[+\-*/×÷xX^]+$/, "").trim();

    const digits = (candidate.match(/\d/g) || []).length;
    const hasOperator = /[+\-*/%×÷−xX^]/.test(candidate);

    if ((digits >= 2 && hasOperator) || (digits >= 1 && /%/.test(candidate))) {
      candidates.push({
        expression: candidate,
        digits,
        length: candidate.length
      });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.digits - a.digits || b.length - a.length);
    return candidates[0].expression;
  }

  // 3. Final attempt: Even if only 1 math line was found, try vertical assemble
  if (mathLines.length > 0) {
    const fallback = assembleVerticalExpression(mathLines);
    if (fallback) return fallback;
  }

  throw new Error("No arithmetic expression detected. Try a clearer image.");
}
