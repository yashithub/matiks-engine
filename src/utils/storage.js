/**
 * Storage utility for history, settings, and benchmark results.
 * Works seamlessly in standard browser (localStorage) and Chrome Extension (chrome.storage.local).
 */

const STORAGE_KEYS = {
  HISTORY: "matiks_history",
  SETTINGS: "matiks_settings",
  BENCHMARK_RESULTS: "matiks_benchmark_results"
};

const DEFAULT_SETTINGS = {
  defaultMode: "consensus", // "consensus" | "grayscale" | "otsu" | "adaptive"
  psmList: ["7", "13"],
  padding: 28,
  targetWidth: 1400,
  autoCalculate: true,
  charWhitelist: "0123456789+-*/().%=xX×÷−? "
};

export const Storage = {
  getSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to persist settings:", e);
    }
  },

  getHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  addHistoryItem(item) {
    try {
      const current = this.getHistory();
      const updated = [
        {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          timestamp: new Date().toISOString(),
          ...item
        },
        ...current
      ].slice(0, 30); // keep last 30 items
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn("Failed to save history item:", e);
      return [];
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (e) {
      console.warn("Failed to clear history:", e);
    }
  },

  getBenchmarkResults() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BENCHMARK_RESULTS);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  saveBenchmarkResults(data) {
    try {
      localStorage.setItem(STORAGE_KEYS.BENCHMARK_RESULTS, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save benchmark results:", e);
    }
  }
};

