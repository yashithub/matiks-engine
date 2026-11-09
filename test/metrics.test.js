import { describe, it, expect } from "vitest";
import {
  levenshteinDistance,
  computeCER,
  computeDigitAccuracy,
  aggregateMetrics,
  normalizeForEval
} from "../src/benchmark/metrics.js";

describe("Benchmark Evaluation Metrics", () => {
  describe("Levenshtein Distance & CER", () => {
    it("should compute 0 distance for identical strings", () => {
      expect(levenshteinDistance("25*16", "25*16")).toBe(0);
      expect(computeCER("25*16", "25*16")).toBe(0);
    });

    it("should compute distance 1 for 25*16 vs 25*10", () => {
      expect(levenshteinDistance("25*16", "25*10")).toBe(1);
      expect(computeCER("25*16", "25*10")).toBe(0.2); // 1 / 5 = 0.2
    });
  });

  describe("Digit Recognition Accuracy", () => {
    it("should return 1.0 when all digits match", () => {
      expect(computeDigitAccuracy("25*16", "25*16")).toBe(1.0);
    });

    it("should return 0.75 when 1 of 4 digits is wrong", () => {
      // Ground truth has 4 digits: 2, 5, 1, 6
      // Predicted has: 2, 5, 1, 0 -> 3/4 match
      expect(computeDigitAccuracy("25*16", "25*10")).toBe(0.75);
    });
  });

  describe("Evaluation Normalization", () => {
    it("should normalize × to * and strip trailing questions", () => {
      expect(normalizeForEval("25 × 16 = ?")).toBe("25*16");
      expect(normalizeForEval("864 ÷ 12 =")).toBe("864/12");
    });
  });

  describe("Summary Aggregation", () => {
    it("should aggregate accuracy and latency statistics correctly", () => {
      const results = [
        { groundTruth: "25*16", predicted: "25*16", duration: 100 },
        { groundTruth: "25*16", predicted: "25*10", duration: 120 }
      ];
      const summary = aggregateMetrics(results);

      expect(summary.total).toBe(2);
      expect(summary.exactMatchCount).toBe(1);
      expect(summary.exactMatchRate).toBe(50);
      expect(summary.avgLatencyMs).toBe(110);
      expect(summary.medianLatencyMs).toBe(120);
    });
  });
});

