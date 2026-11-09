const replacements = [
  [/×/g, "*"],
  [/÷/g, "/"],
  [/[−–—]/g, "-"],
  [/[＋]/g, "+"],
  [/[＊]/g, "*"],
  [/[／]/g, "/"],
  [/[％]/g, "%"],
  [/\bof\b/gi, "*"],
  [/\s+/g, " "]
];

export function normalizeExpression(input){
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

    for(const [pattern, replacement] of replacements){
        expression = expression.replace(pattern, replacement);
    }

    expression = expression.replace(
    /(\d|\))\s*[xX]\s*(?=\d|\()/g,
    "$1 * "
    );
    
    return expression.trim();
}
