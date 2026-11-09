
import { describe, it, expect } from "vitest";

import {
  solve,
  normalizeExpression,
  validateResult
} from "../src/engine/index.js";

describe("Arithmetic Engine", () => {
  describe("Basic operations", () => {
    it("should add numbers", () => {
      expect(solve("248 + 376").answer).toBe(624);
    });

    it("should subtract numbers", () => {
      expect(solve("900 - 475").answer).toBe(425);
    });

    it("should multiply numbers", () => {
      expect(solve("24 × 16").answer).toBe(384);
    });

    it("should divide numbers", () => {
      expect(solve("864 ÷ 12").answer).toBe(72);
    });
  });

  describe("Operator precedence", () => {
    it("should multiply before addition", () => {
      expect(solve("12 + 8 * 5").answer).toBe(52);
    });

    it("should handle parentheses", () => {
      expect(solve("(15 + 5) * 4").answer).toBe(80);
    });

    it("should handle nested parentheses", () => {
      expect(solve("((2 + 3) * 4) / 2").answer).toBe(10);
    });
  });

  describe("Percentages", () => {
    it("should calculate percentage of a number", () => {
      expect(solve("25% of 800").answer).toBe(200);
    });

    it("should calculate postfix percentage", () => {
      expect(solve("50%").answer).toBe(0.5);
    });

    it("should handle percentage in expressions", () => {
      expect(solve("200 * 10%").answer).toBe(20);
    });
  });

  describe("Decimals and signs", () => {
    it("should calculate decimals", () => {
      expect(solve("12.5 * 4").answer).toBe(50);
    });

    it("should handle unary minus", () => {
      expect(solve("-45 + 20").answer).toBe(-25);
    });

    it("should handle negative multiplication", () => {
      expect(solve("-5 * -4").answer).toBe(20);
    });
  });

  describe("Normalization", () => {
    it("should normalize multiplication symbols", () => {
      expect(normalizeExpression("24 × 16")).toBe("24 * 16");
    });

    it("should normalize division symbols", () => {
      expect(normalizeExpression("864 ÷ 12")).toBe("864 / 12");
    });

    it("should normalize x multiplication", () => {
      expect(normalizeExpression("24 x 16")).toBe("24 * 16");
    });

    it("should normalize percentage wording", () => {
      expect(normalizeExpression("25% of 800")).toBe("25% * 800");
    });
  });

  describe("Error handling", () => {
    it("should reject division by zero", () => {
      expect(() => solve("10 / 0")).toThrow("Division by zero");
    });

    it("should reject empty input", () => {
      expect(() => solve("")).toThrow();
    });

    it("should reject invalid characters", () => {
      expect(() => solve("10 + abc")).toThrow();
    });

    it("should reject unmatched parentheses", () => {
      expect(() => solve("(10 + 5")).toThrow();
    });

    it("should reject excessively long input", () => {
      expect(() => solve("1".repeat(201))).toThrow();
    });

    it("should reject malformed expressions", () => {
      expect(() => solve("10 + * 5")).toThrow();
    });
  });

  describe("Validation", () => {
    it("should validate correct results", () => {
      expect(validateResult(100, 100)).toBe(true);
    });

    it("should reject incorrect results", () => {
      expect(validateResult(100, 101)).toBe(false);
    });

    it("should handle floating-point precision", () => {
      expect(validateResult(0.1 + 0.2, 0.3)).toBe(true);
    });

    it("should reject non-finite values", () => {
      expect(validateResult(Infinity, 100)).toBe(false);
    });
  });
});
