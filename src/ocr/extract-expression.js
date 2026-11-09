
export function extractExpression(ocrText) {
  if (!ocrText || typeof ocrText !== "string") {
    throw new Error("No OCR text received");
  }

  const lines = ocrText
    .split(/\n/)
    .map(line => line.trim())
    .filter(Boolean);

  const candidates = [];

  for (const line of lines) {
    // Ignore answer placeholders and equals signs.
    const cleaned = line
      .replace(/[=?]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const candidate = cleaned.match(
      /[\d().+\-*/%×÷−xX\s]+/
    )?.[0]?.trim();

    if (!candidate) continue;

    const digitCount = (candidate.match(/\d/g) || []).length;

    const hasOperator = /[+\-*/%×÷−xX]/.test(candidate);

    if (digitCount >= 2 && hasOperator) {
      candidates.push(candidate);
    }
  }

  if (candidates.length === 0) {
    throw new Error(
      "No arithmetic expression detected. Try a clearer image."
    );
  }

  return candidates.sort(
    (a, b) => b.length - a.length
  )[0];
}
