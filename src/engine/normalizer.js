const replacements = [
  [/×/g, "*"],
  [/÷/g, "/"],
  [/[:∕⁄]/g, "/"],
  [/[−–—]/g, "-"],
  [/[＋]/g, "+"],
  [/[＊]/g, "*"],
  [/[／]/g, "/"],
  [/[％]/g, "%"],
  [/\*\*/g, "^"],
  [/√/g, "sqrt "],
  [/\bof\b/gi, "*"],
  [/\s+/g, " "]
];

export function normalizeExpression(input) {
  if (typeof input !== "string") {
    throw new TypeError("Expression must be a string");
  }

  let expression = input.trim();
  if (!expression) {
    throw new Error("Expression cannot be empty");
  }
  if (expression.length > 200) {
    throw new Error("Expression is too long");
  }

  for (const [pattern, replacement] of replacements) {
    expression = expression.replace(pattern, replacement);
  }

  // Convert implicit multiplication like "24 x 16", "2(3)", "(3)2", or "(2)(3)"
  expression = expression.replace(/(\d|\))\s*[xX]\s*(?=\d|\()/g, "$1 * ");
  expression = expression.replace(/(\d)\s*\(/g, "$1 * (");
  expression = expression.replace(/\)\s*(\d)/g, ") * $1");
  expression = expression.replace(/\)\s*\(/g, ") * (");

  return expression.trim();
}
