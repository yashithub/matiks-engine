# Matiks Companion

A high-accuracy, client-side OCR and arithmetic companion engineered for speed-math practice, arithmetic experimentation, and developer benchmarking.

---

## Architecture Overview

```text
matiks-companion/
├── src/
│   ├── engine/                # Safe recursive-descent math parser (zero eval)
│   │   ├── calculator.js      # Float normalization & evaluation
│   │   ├── normalizer.js      # Unicode & implicit multiplication normalization
│   │   ├── parser.js          # Grammar, precedence, powers & sqrt
│   │   ├── validator.js       # Epsilon tolerance validation
│   │   └── index.js
│   │
│   ├── ocr/                   # Local OCR pipeline & verification
│   │   ├── image-processor.js # Auto-crop, dynamic scaling, quiet zone, thresholding
│   │   ├── ocr-engine.js      # Multi-pass consensus & ambiguity detection
│   │   └── extract-expression.js # Vertical multi-line assembly & spaced digit collapse
│   │
│   ├── benchmark/             # Ground-truth benchmark framework
│   │   ├── dataset.js         # 100+ ground truth test permutations
│   │   ├── image-generator.js # Procedural canvas rendering
│   │   ├── metrics.js         # CER, Levenshtein, digit accuracy, latency percentiles
│   │   └── runner.js          # Automated benchmark execution
│   │
│   ├── components/            # Dark-themed developer tool UI
│   │   ├── Navigation.jsx
│   │   ├── Dashboard.jsx
│   │   ├── OcrLab.jsx
│   │   ├── BenchmarkLab.jsx
│   │   └── Settings.jsx
│   │
│   ├── background/            # Manifest V3 service worker
│   │   └── service-worker.js
│   ├── content/               # Non-invasive page crop & Shadow DOM HUD
│   │   ├── image-capture.js
│   │   ├── companion-overlay.js
│   │   └── index.js
│   ├── popup/                 # Extension popup interface
│   │   └── App.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── style.css
│
├── test/                      # Vitest automated test suites (63 tests)
│   ├── arithmetic.test.js
│   ├── multiline.test.js
│   ├── ocr-ambiguity.test.js
│   └── metrics.test.js
│
├── public/                    # Manifest V3 assets & icons
│   ├── manifest.json
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── index.html
├── vite.config.js
└── package.json
```

---

## Features

- **Multi-Line & Vertical Arithmetic Recognition**: Specifically engineered for Matiks column arithmetic (`5 \n + 41 \n - 3` $\to$ `5 + 41 - 3 = 43`).
- **Tabular Kerning Defense**: Automatically collapses wide-spaced digits (`+4 1` $\to$ `+41`).
- **Dynamic Bounding-Box Scaling**: Crops floating text from game viewports and scales glyphs to optimal neural net height ($\sim 115\text{px}$).
- **Consensus & Ambiguity Layer**: Flags known optical confusion pairs (`6` vs `0`, `8` vs `3`, `1` vs `7`) rather than silently trusting OCR confidence scores.
- **Safe Math Engine**: Recursive-descent parser supporting powers (`^`, `**`), square roots (`sqrt`, `√`), percentages, parentheses, and float stabilization.
- **100% Local & Offline**: Operates via WebAssembly with zero external AI API dependencies.

---

## Getting Started

### 1. Run Automated Test Suite
```bash
npm run test
```
Executes all 63 automated tests covering the arithmetic parser, multi-line vertical assembly, ambiguity detection, and benchmark metrics.

### 2. Launch Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build Production Extension & Web App
```bash
npm run build
```
Generates the optimized web application and Chrome Manifest V3 extension bundle inside `dist/`.

---

## Installing the Chrome Extension (Manifest V3)

1. Run `npm run build` to generate the `dist/` directory.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `dist` folder in this repository.
5. Click the Matiks Companion extension icon in your Chrome toolbar to capture screen regions or solve arithmetic expressions on any practice page.

