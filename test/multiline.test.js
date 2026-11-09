import { describe, it, expect } from "vitest";
import { extractExpression, assembleVerticalExpression } from "../src/ocr/extract-expression.js";
import { solve } from "../src/engine/index.js";

describe("Matiks Multi-Line Vertical Arithmetic", () => {
  describe("assembleVerticalExpression", () => {
    it("should assemble stacked addition and subtraction (Matiks game format)", () => {
      const lines = ["5", "+ 41", "- 3"];
      const assembled = assembleVerticalExpression(lines);
      expect(assembled).toBe("5 + 41 - 3");
      expect(solve(assembled).answer).toBe(43);
    });

    it("should assemble two-line vertical multiplication", () => {
      const lines = ["25", "× 16"];
      const assembled = assembleVerticalExpression(lines);
      expect(assembled).toBe("25 × 16");
      expect(solve(assembled).answer).toBe(400);
    });

    it("should assemble separate operator lines", () => {
      const lines = ["5", "+", "41", "-", "3"];
      const assembled = assembleVerticalExpression(lines);
      expect(assembled).toBe("5 + 41 - 3");
      expect(solve(assembled).answer).toBe(43);
    });

    it("should strip trailing equals, question marks and underscores", () => {
      const lines = ["  5  ", "+ 41", "- 3", "= ?"];
      const assembled = assembleVerticalExpression(lines);
      expect(assembled).toBe("5 + 41 - 3");
      expect(solve(assembled).answer).toBe(43);
    });

    it("should handle stacked column addition without explicit operator", () => {
      const lines = ["142", "58"];
      const assembled = assembleVerticalExpression(lines);
      expect(assembled).toBe("142 + 58");
      expect(solve(assembled).answer).toBe(200);
    });

    it("should support negative initial numbers and decimals", () => {
      const lines = ["-10", "+ 25", "* 2"];
      const assembled = assembleVerticalExpression(lines);
      expect(assembled).toBe("-10 + 25 * 2");
      expect(solve(assembled).answer).toBe(40);
    });

    it("should normalize underscore OCR artifacts as minus", () => {
      const lines = ["5", "+ 41", "_ 3"];
      const assembled = assembleVerticalExpression(lines);
      expect(assembled).toBe("5 + 41 - 3");
      expect(solve(assembled).answer).toBe(43);
    });

    it("should collapse spaced digits on the same line (+4 1 -> 41)", () => {
      const lines = ["5", "+4 1", "-3"];
      const assembled = assembleVerticalExpression(lines);
      expect(assembled).toBe("5 + 41 - 3");
      expect(solve(assembled).answer).toBe(43);
    });
  });

  describe("extractExpression integration with multi-line OCR", () => {
    it("should extract expression directly from multi-line raw OCR text", () => {
      const ocrOutput = `
        5
        + 41
        - 3
      `;
      const expr = extractExpression(ocrOutput);
      expect(expr).toBe("5 + 41 - 3");
      expect(solve(expr).answer).toBe(43);
    });

    it("should handle tabular digit spacing in raw OCR (+4 1 -> 41)", () => {
      // Exactly matches the OCR output shown in user's screenshot!
      const ocrOutput = "5\n+4 1\n-3";
      const expr = extractExpression(ocrOutput);
      expect(expr).toBe("5 + 41 - 3");
      expect(solve(expr).answer).toBe(43);
    });

    it("should extract from multi-line OCR with noisy margins and prompt", () => {
      const ocrOutput = `
        5
        + 41
        - 3
        =
      `;
      const expr = extractExpression(ocrOutput);
      expect(expr).toBe("5 + 41 - 3");
      expect(solve(expr).answer).toBe(43);
    });

    it("should continue supporting horizontal single-line expressions", () => {
      const ocrOutput = "25 × 16 = ?";
      const expr = extractExpression(ocrOutput);
      expect(expr).toBe("25 × 16");
      expect(solve(expr).answer).toBe(400);
    });
  });
});

