import { describe, it, expect } from "vitest";
import { normalizeCandidate, detectCharacterConflicts } from "../src/ocr/ocr-engine.js";
import { extractExpression } from "../src/ocr/extract-expression.js";

describe("OCR Disagreement & Ambiguity Detection", () => {
  it("should normalize math symbols uniformly", () => {
    expect(normalizeCandidate("25 × 16 = ?")).toBe("25*16=?");
    expect(normalizeCandidate("25 x 16")).toBe("25*16");
    expect(normalizeCandidate("864 ÷ 12")).toBe("864/12");
    expect(normalizeCandidate("100 − 50")).toBe("100-50");
  });

  it("should detect known 6 vs 0 confusion as high-risk ambiguity", () => {
    // Exactly the user's reported problem case!
    const candidates = ["25 * 16", "25 * 10"];
    const report = detectCharacterConflicts(candidates);

    expect(report.hasConflict).toBe(true);
    expect(report.hasKnownConfusion).toBe(true);
    expect(report.conflicts.length).toBeGreaterThan(0);
    expect(report.conflicts[0].charA).toBe("6");
    expect(report.conflicts[0].charB).toBe("0");
    expect(report.conflicts[0].isKnownConfusion).toBe(true);
  });

  it("should detect known 8 vs 3 confusion", () => {
    const candidates = ["38 + 80", "33 + 80"];
    const report = detectCharacterConflicts(candidates);

    expect(report.hasConflict).toBe(true);
    expect(report.hasKnownConfusion).toBe(true);
  });

  it("should report no conflict when attempts agree", () => {
    const candidates = ["25 × 16", "25 * 16", "25 x 16"];
    const report = detectCharacterConflicts(candidates);

    expect(report.hasConflict).toBe(false);
    expect(report.conflicts).toHaveLength(0);
  });
});

describe("Expression Extractor", () => {
  it("should extract expression before equals sign", () => {
    expect(extractExpression("25 × 16 = ?")).toBe("25 × 16");
    expect(extractExpression("100 + 200 =")).toBe("100 + 200");
    expect(extractExpression("50 * 4 = 200")).toBe("50 * 4");
  });

  it("should support negative numbers and decimals", () => {
    expect(extractExpression("-45 + 20 = ?")).toBe("-45 + 20");
    expect(extractExpression("12.5 * 4 = ?")).toBe("12.5 * 4");
  });

  it("should support percentages", () => {
    expect(extractExpression("25% * 800")).toBe("25% * 800");
  });

  it("should reject non-arithmetic text", () => {
    expect(() => extractExpression("hello world")).toThrow();
  });
});

