/**
 * Ground truth benchmark dataset containing 100+ diverse arithmetic expressions.
 * Covers: basic ops, operator precedence, parentheses, decimals, negatives,
 * percentages, typography variations, contrast variations, and edge cases.
 */

export const BENCHMARK_DATASET = [
  // 1. Basic Addition & Subtraction (15 items)
  { id: "add-01", expression: "248 + 376", format: "248 + 376 = ?", font: "Arial", size: 36, theme: "light" },
  { id: "add-02", expression: "1429 + 853", format: "1429 + 853", font: "Roboto", size: 32, theme: "light" },
  { id: "add-03", expression: "75 + 89", format: "75 + 89 = ", font: "Segoe UI", size: 40, theme: "light" },
  { id: "add-04", expression: "504 + 692", format: "504 + 692 = ?", font: "Times New Roman", size: 34, theme: "light" },
  { id: "add-05", expression: "888 + 333", format: "888 + 333 = ?", font: "Courier New", size: 30, theme: "dark" },
  { id: "sub-01", expression: "900 - 475", format: "900 - 475 = ?", font: "Arial", size: 36, theme: "light" },
  { id: "sub-02", expression: "1050 - 386", format: "1050 - 386 = ?", font: "Georgia", size: 32, theme: "light" },
  { id: "sub-03", expression: "732 - 198", format: "732 - 198", font: "Consolas", size: 34, theme: "dark" },
  { id: "sub-04", expression: "604 - 208", format: "604 - 208 = ?", font: "Trebuchet MS", size: 38, theme: "light" },
  { id: "sub-05", expression: "1000 - 64", format: "1000 - 64 = ?", font: "Verdana", size: 32, theme: "light" },
  { id: "addsub-01", expression: "125 + 75 - 50", format: "125 + 75 - 50 = ?", font: "Arial", size: 32, theme: "light" },
  { id: "addsub-02", expression: "450 - 120 + 80", format: "450 - 120 + 80 = ?", font: "Segoe UI", size: 34, theme: "dark" },
  { id: "addsub-03", expression: "999 + 1 - 500", format: "999 + 1 - 500 = ?", font: "Times New Roman", size: 30, theme: "light" },
  { id: "addsub-04", expression: "360 - 180 - 90", format: "360 - 180 - 90 = ?", font: "Roboto", size: 36, theme: "light" },
  { id: "addsub-05", expression: "600 + 400 - 250", format: "600 + 400 - 250 = ?", font: "Arial", size: 32, theme: "low-contrast" },

  // 2. Multiplication with ×, x, * (15 items)
  { id: "mul-01", expression: "24 × 16", format: "24 × 16 = ?", font: "Arial", size: 36, theme: "light" },
  { id: "mul-02", expression: "25 × 16", format: "25 × 16 = ?", font: "Segoe UI", size: 36, theme: "light" }, // The user's specific problem case!
  { id: "mul-03", expression: "12 * 12", format: "12 * 12 = ?", font: "Courier New", size: 34, theme: "light" },
  { id: "mul-04", expression: "45 x 18", format: "45 x 18 = ?", font: "Trebuchet MS", size: 32, theme: "dark" },
  { id: "mul-05", expression: "125 × 8", format: "125 × 8 = ?", font: "Georgia", size: 38, theme: "light" },
  { id: "mul-06", expression: "60 × 60", format: "60 × 60 = ?", font: "Times New Roman", size: 34, theme: "light" },
  { id: "mul-07", expression: "35 × 14", format: "35 × 14 = ?", font: "Roboto", size: 36, theme: "light" },
  { id: "mul-08", expression: "72 × 25", format: "72 × 25 = ?", font: "Arial", size: 32, theme: "dark" },
  { id: "mul-09", expression: "99 × 9", format: "99 × 9 = ?", font: "Consolas", size: 36, theme: "light" },
  { id: "mul-10", expression: "18 × 15", format: "18 × 15 = ?", font: "Verdana", size: 30, theme: "low-contrast" },
  { id: "mul-11", expression: "106 × 12", format: "106 × 12 = ?", font: "Segoe UI", size: 32, theme: "light" },
  { id: "mul-12", expression: "84 × 7", format: "84 × 7 = ?", font: "Times New Roman", size: 36, theme: "light" },
  { id: "mul-13", expression: "150 × 4", format: "150 × 4 = ?", font: "Arial", size: 38, theme: "dark" },
  { id: "mul-14", expression: "250 × 16", format: "250 × 16 = ?", font: "Georgia", size: 32, theme: "light" },
  { id: "mul-15", expression: "65 × 60", format: "65 × 60 = ?", font: "Courier New", size: 30, theme: "light" },

  // 3. Division with ÷ and / (15 items)
  { id: "div-01", expression: "864 ÷ 12", format: "864 ÷ 12 = ?", font: "Arial", size: 36, theme: "light" },
  { id: "div-02", expression: "720 ÷ 9", format: "720 ÷ 9 = ?", font: "Roboto", size: 38, theme: "light" },
  { id: "div-03", expression: "144 / 12", format: "144 / 12 = ?", font: "Segoe UI", size: 34, theme: "dark" },
  { id: "div-04", expression: "625 ÷ 25", format: "625 ÷ 25 = ?", font: "Times New Roman", size: 36, theme: "light" },
  { id: "div-05", expression: "1024 ÷ 16", format: "1024 ÷ 16 = ?", font: "Consolas", size: 30, theme: "light" },
  { id: "div-06", expression: "450 / 15", format: "450 / 15 = ?", font: "Georgia", size: 34, theme: "light" },
  { id: "div-07", expression: "960 ÷ 32", format: "960 ÷ 32 = ?", font: "Trebuchet MS", size: 32, theme: "dark" },
  { id: "div-08", expression: "100 ÷ 4", format: "100 ÷ 4 = ?", font: "Arial", size: 40, theme: "light" },
  { id: "div-09", expression: "648 ÷ 8", format: "648 ÷ 8 = ?", font: "Verdana", size: 32, theme: "light" },
  { id: "div-10", expression: "512 ÷ 16", format: "512 ÷ 16 = ?", font: "Courier New", size: 30, theme: "low-contrast" },
  { id: "div-11", expression: "3600 ÷ 60", format: "3600 ÷ 60 = ?", font: "Roboto", size: 36, theme: "light" },
  { id: "div-12", expression: "216 / 6", format: "216 / 6 = ?", font: "Segoe UI", size: 34, theme: "light" },
  { id: "div-13", expression: "810 ÷ 90", format: "810 ÷ 90 = ?", font: "Times New Roman", size: 34, theme: "dark" },
  { id: "div-14", expression: "1250 ÷ 50", format: "1250 ÷ 50 = ?", font: "Arial", size: 32, theme: "light" },
  { id: "div-15", expression: "400 ÷ 8", format: "400 ÷ 8 = ?", font: "Georgia", size: 38, theme: "light" },

  // 4. Operator Precedence & Mixed (15 items)
  { id: "prec-01", expression: "12 + 8 * 5", format: "12 + 8 * 5 = ?", font: "Arial", size: 34, theme: "light" },
  { id: "prec-02", expression: "20 - 4 * 3", format: "20 - 4 * 3 = ?", font: "Roboto", size: 34, theme: "dark" },
  { id: "prec-03", expression: "50 + 100 ÷ 2", format: "50 + 100 ÷ 2 = ?", font: "Segoe UI", size: 32, theme: "light" },
  { id: "prec-04", expression: "15 * 4 - 30", format: "15 * 4 - 30 = ?", font: "Times New Roman", size: 36, theme: "light" },
  { id: "prec-05", expression: "60 ÷ 5 + 8", format: "60 ÷ 5 + 8 = ?", font: "Consolas", size: 32, theme: "light" },
  { id: "prec-06", expression: "100 - 25 * 2", format: "100 - 25 * 2 = ?", font: "Georgia", size: 34, theme: "dark" },
  { id: "prec-07", expression: "18 + 12 ÷ 4", format: "18 + 12 ÷ 4 = ?", font: "Trebuchet MS", size: 36, theme: "light" },
  { id: "prec-08", expression: "6 * 7 + 8 * 9", format: "6 * 7 + 8 * 9 = ?", font: "Arial", size: 30, theme: "light" },
  { id: "prec-09", expression: "120 - 40 ÷ 8", format: "120 - 40 ÷ 8 = ?", font: "Verdana", size: 32, theme: "light" },
  { id: "prec-10", expression: "15 + 45 ÷ 15", format: "15 + 45 ÷ 15 = ?", font: "Roboto", size: 34, theme: "low-contrast" },
  { id: "prec-11", expression: "200 - 50 * 3", format: "200 - 50 * 3 = ?", font: "Segoe UI", size: 34, theme: "light" },
  { id: "prec-12", expression: "16 × 4 + 20", format: "16 × 4 + 20 = ?", font: "Times New Roman", size: 36, theme: "light" },
  { id: "prec-13", expression: "90 ÷ 3 - 15", format: "90 ÷ 3 - 15 = ?", font: "Courier New", size: 30, theme: "dark" },
  { id: "prec-14", expression: "30 + 10 * 10", format: "30 + 10 * 10 = ?", font: "Georgia", size: 34, theme: "light" },
  { id: "prec-15", expression: "80 - 64 ÷ 8", format: "80 - 64 ÷ 8 = ?", font: "Arial", size: 36, theme: "light" },

  // 5. Parentheses & Grouping (15 items)
  { id: "paren-01", expression: "(15 + 5) * 4", format: "(15 + 5) * 4 = ?", font: "Arial", size: 34, theme: "light" },
  { id: "paren-02", expression: "6 * (20 - 8)", format: "6 * (20 - 8) = ?", font: "Roboto", size: 34, theme: "dark" },
  { id: "paren-03", expression: "(100 - 25) ÷ 5", format: "(100 - 25) ÷ 5 = ?", font: "Segoe UI", size: 32, theme: "light" },
  { id: "paren-04", expression: "((2 + 3) * 4) / 2", format: "((2 + 3) * 4) / 2 = ?", font: "Consolas", size: 30, theme: "light" },
  { id: "paren-05", expression: "(40 + 20) * (15 - 5)", format: "(40 + 20) * (15 - 5) = ?", font: "Times New Roman", size: 28, theme: "light" },
  { id: "paren-06", expression: "10 * (12 + 8)", format: "10 * (12 + 8) = ?", font: "Georgia", size: 36, theme: "dark" },
  { id: "paren-07", expression: "(80 - 30) ÷ 10", format: "(80 - 30) ÷ 10 = ?", font: "Trebuchet MS", size: 34, theme: "light" },
  { id: "paren-08", expression: "5 * (6 + 7)", format: "5 * (6 + 7) = ?", font: "Verdana", size: 36, theme: "light" },
  { id: "paren-09", expression: "(18 + 14) * 2", format: "(18 + 14) * 2 = ?", font: "Arial", size: 34, theme: "low-contrast" },
  { id: "paren-10", expression: "4 * (25 + 75)", format: "4 * (25 + 75) = ?", font: "Roboto", size: 36, theme: "light" },
  { id: "paren-11", expression: "(90 - 45) / 9", format: "(90 - 45) / 9 = ?", font: "Segoe UI", size: 34, theme: "dark" },
  { id: "paren-12", expression: "3 * (100 - 35)", format: "3 * (100 - 35) = ?", font: "Times New Roman", size: 32, theme: "light" },
  { id: "paren-13", expression: "(50 + 25) * 4", format: "(50 + 25) * 4 = ?", font: "Courier New", size: 30, theme: "light" },
  { id: "paren-14", expression: "(120 ÷ 4) + 18", format: "(120 ÷ 4) + 18 = ?", font: "Georgia", size: 34, theme: "light" },
  { id: "paren-15", expression: "8 * (14 - 6)", format: "8 * (14 - 6) = ?", font: "Arial", size: 36, theme: "dark" },

  // 6. Decimals & Negatives (15 items)
  { id: "dec-01", expression: "12.5 * 4", format: "12.5 * 4 = ?", font: "Arial", size: 36, theme: "light" },
  { id: "dec-02", expression: "3.75 + 6.25", format: "3.75 + 6.25 = ?", font: "Roboto", size: 34, theme: "light" },
  { id: "dec-03", expression: "45.6 - 12.3", format: "45.6 - 12.3 = ?", font: "Segoe UI", size: 32, theme: "dark" },
  { id: "dec-04", expression: "0.5 * 80", format: "0.5 * 80 = ?", font: "Times New Roman", size: 36, theme: "light" },
  { id: "dec-05", expression: "24.8 ÷ 2", format: "24.8 ÷ 2 = ?", font: "Consolas", size: 34, theme: "light" },
  { id: "neg-01", expression: "-45 + 20", format: "-45 + 20 = ?", font: "Arial", size: 34, theme: "light" },
  { id: "neg-02", expression: "100 - -50", format: "100 - -50 = ?", font: "Roboto", size: 32, theme: "dark" },
  { id: "neg-03", expression: "-5 * 12", format: "-5 * 12 = ?", font: "Georgia", size: 36, theme: "light" },
  { id: "neg-04", expression: "-64 ÷ 8", format: "-64 ÷ 8 = ?", font: "Trebuchet MS", size: 34, theme: "light" },
  { id: "neg-05", expression: "30 + -15", format: "30 + -15 = ?", font: "Verdana", size: 34, theme: "low-contrast" },
  { id: "dec-06", expression: "1.5 * 1.5", format: "1.5 * 1.5 = ?", font: "Arial", size: 36, theme: "light" },
  { id: "dec-07", expression: "99.9 + 0.1", format: "99.9 + 0.1 = ?", font: "Segoe UI", size: 34, theme: "light" },
  { id: "dec-08", expression: "15.75 - 5.5", format: "15.75 - 5.5 = ?", font: "Times New Roman", size: 32, theme: "dark" },
  { id: "neg-06", expression: "-25 - 75", format: "-25 - 75 = ?", font: "Courier New", size: 30, theme: "light" },
  { id: "neg-07", expression: "50 * -4", format: "50 * -4 = ?", font: "Georgia", size: 36, theme: "light" },

  // 7. Percentages (10 items)
  { id: "pct-01", expression: "25% * 800", format: "25% * 800 = ?", font: "Arial", size: 36, theme: "light" },
  { id: "pct-02", expression: "50% * 640", format: "50% * 640 = ?", font: "Roboto", size: 34, theme: "dark" },
  { id: "pct-03", expression: "10% * 1500", format: "10% * 1500 = ?", font: "Segoe UI", size: 32, theme: "light" },
  { id: "pct-04", expression: "75% * 400", format: "75% * 400 = ?", font: "Times New Roman", size: 36, theme: "light" },
  { id: "pct-05", expression: "20% * 50", format: "20% * 50 = ?", font: "Consolas", size: 34, theme: "light" },
  { id: "pct-06", expression: "5% * 200", format: "5% * 200 = ?", font: "Georgia", size: 36, theme: "dark" },
  { id: "pct-07", expression: "30% * 300", format: "30% * 300 = ?", font: "Trebuchet MS", size: 34, theme: "light" },
  { id: "pct-08", expression: "15% * 60", format: "15% * 60 = ?", font: "Verdana", size: 34, theme: "light" },
  { id: "pct-09", expression: "40% * 250", format: "40% * 250 = ?", font: "Arial", size: 36, theme: "low-contrast" },
  { id: "pct-10", expression: "80% * 125", format: "80% * 125 = ?", font: "Roboto", size: 34, theme: "light" },

  // 8. OCR Ambiguity & Stress Cases (10 items)
  // Prone pairs: 6 vs 0, 8 vs 3, 1 vs 7, 5 vs 6
  { id: "stress-01", expression: "608 ÷ 16", format: "608 ÷ 16 = ?", font: "Times New Roman", size: 34, theme: "light" }, // 6, 0, 8
  { id: "stress-02", expression: "38 + 83", format: "38 + 83 = ?", font: "Georgia", size: 36, theme: "light" },   // 3, 8
  { id: "stress-03", expression: "17 × 71", format: "17 × 71 = ?", font: "Courier New", size: 32, theme: "dark" },  // 1, 7
  { id: "stress-04", expression: "56 + 65", format: "56 + 65 = ?", font: "Arial", size: 36, theme: "light" },   // 5, 6
  { id: "stress-05", expression: "906 - 609", format: "906 - 609 = ?", font: "Roboto", size: 34, theme: "light" }, // 9, 0, 6
  { id: "stress-06", expression: "800 - 308", format: "800 - 308 = ?", font: "Segoe UI", size: 34, theme: "dark" }, // 8, 0, 3
  { id: "stress-07", expression: "117 + 771", format: "117 + 771 = ?", font: "Consolas", size: 32, theme: "light" }, // 1, 7
  { id: "stress-08", expression: "680 × 806", format: "680 × 806 = ?", font: "Verdana", size: 30, theme: "light" }, // 6, 8, 0
  { id: "stress-09", expression: "560 ÷ 70", format: "560 ÷ 70 = ?", font: "Times New Roman", size: 36, theme: "low-contrast" }, // 5, 6, 0, 7
  { id: "stress-10", expression: "25 × 16", format: "25 × 16 = ?", font: "Georgia", size: 34, theme: "dark" },     // Problem benchmark across fonts & dark theme

  // 9. Matiks Multi-Line Vertical Problems (stacked layout)
  { id: "matiks-01", expression: "5 + 41 - 3", format: "5\n+ 41\n- 3", font: "Segoe UI", size: 34, theme: "dark" },
  { id: "matiks-02", expression: "25 × 16", format: "25\n× 16", font: "Arial", size: 34, theme: "dark" },
  { id: "matiks-03", expression: "120 - 45 + 15", format: "120\n- 45\n+ 15", font: "Roboto", size: 32, theme: "dark" },
  { id: "matiks-04", expression: "8 * 7 + 4", format: "8\n* 7\n+ 4", font: "Consolas", size: 32, theme: "light" },
  { id: "matiks-05", expression: "60 + 140 - 80", format: "60\n+ 140\n- 80", font: "Trebuchet MS", size: 32, theme: "dark" },
  { id: "matiks-06", expression: "100 - 35", format: "100\n- 35", font: "Verdana", size: 34, theme: "light" },
  { id: "matiks-07", expression: "15 + 25 + 35", format: "15\n+ 25\n+ 35", font: "Segoe UI", size: 30, theme: "dark" },
  { id: "matiks-08", expression: "900 - 450", format: "900\n- 450", font: "Arial", size: 34, theme: "dark" },
  { id: "matiks-09", expression: "48 ÷ 6 + 12", format: "48\n÷ 6\n+ 12", font: "Georgia", size: 32, theme: "light" },
  { id: "matiks-10", expression: "75 + 125 - 50", format: "75\n+ 125\n- 50", font: "Times New Roman", size: 32, theme: "dark" }
];

