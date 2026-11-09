import { useState, useRef } from "react";
import { preprocessVariants, preprocessImage } from "../ocr/image-processor.js";
import { recognizeVariants, recognizeImage } from "../ocr/ocr-engine.js";
import { solve } from "../engine/index.js";

export default function OcrLab({ onRecordHistory, preloadedItem }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(preloadedItem?.previewUrl || "");
  const [processingMode, setProcessingMode] = useState("consensus"); // "consensus" | "grayscale" | "otsu" | "adaptive"
  const [selectedPsm, setSelectedPsm] = useState("6"); // PSM 6: multi-line & single block
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("Ready for input");

  const [rawText, setRawText] = useState(preloadedItem?.rawText || "");
  const [expression, setExpression] = useState(preloadedItem?.expression || "");
  const [answer, setAnswer] = useState(preloadedItem?.answer ?? null);
  const [confidence, setConfidence] = useState(preloadedItem?.confidence ?? null);
  const [ambiguous, setAmbiguous] = useState(preloadedItem?.ambiguous ?? false);
  const [conflicts, setConflicts] = useState(preloadedItem?.conflicts || []);
  const [attempts, setAttempts] = useState(preloadedItem?.attempts || []);
  const [variantsList, setVariantsList] = useState([]);
  const [activeVariantTab, setActiveVariantTab] = useState("original");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  function handleFileSelect(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Selected file is not an image.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Maximum image size is 10 MB.");
      return;
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const newUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(newUrl);
    setError("");
    setRawText("");
    setExpression("");
    setAnswer(null);
    setConfidence(null);
    setAmbiguous(false);
    setConflicts([]);
    setAttempts([]);
    setVariantsList([]);
    setActiveVariantTab("original");
    setStatusText("Image loaded");
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  async function runRecognition() {
    if ((!file && !previewUrl) || loading) return;

    setLoading(true);
    setError("");
    setAnswer(null);
    setAmbiguous(false);
    setConflicts([]);
    setAttempts([]);

    try {
      const imageSource = file || previewUrl;
      const startTime = performance.now();

      if (processingMode === "consensus") {
        setStatusText("Generating multi-scale variants (Grayscale, Otsu, Adaptive)...");
        const variants = await preprocessVariants(imageSource);
        setVariantsList(variants);

        setStatusText("Running consensus OCR across PSM 6 (Block) & PSM 4 (Column)...");
        const result = await recognizeVariants(variants, { psmList: ["6", "4"] });

        const totalDuration = Math.round(performance.now() - startTime);

        setAttempts(result.attempts);
        setRawText(result.text);
        setConfidence(result.confidence);
        setAmbiguous(result.ambiguous);
        setConflicts(result.conflictReport?.conflicts || []);

        const extracted = result.expression || result.candidateExpression || "";
        setExpression(extracted);

        let calculatedAns = null;
        if (extracted) {
          try {
            const sol = solve(extracted);
            calculatedAns = sol.answer;
            setAnswer(sol.answer);
          } catch (calcErr) {
            // Keep expression for manual adjustment
          }
        }

        if (result.ambiguous) {
          setStatusText("Ambiguity detected — please verify");
          setError("Character-level disagreements detected across passes. Please verify ambiguous digits.");
        } else {
          setStatusText(`Recognition completed in ${totalDuration} ms`);
        }

        onRecordHistory({
          expression: extracted,
          candidateExpression: result.candidateExpression,
          rawText: result.text,
          answer: calculatedAns,
          confidence: result.confidence,
          ambiguous: result.ambiguous,
          conflicts: result.conflictReport?.conflicts || [],
          attempts: result.attempts,
          duration: totalDuration,
          previewUrl
        });

      } else {
        // Single pass mode
        setStatusText(`Preprocessing with ${processingMode} filter...`);
        const preprocessed = await preprocessImage(imageSource, { mode: processingMode });

        setStatusText(`Running single-pass OCR (PSM ${selectedPsm})...`);
        const result = await recognizeImage(preprocessed.blob, { psm: selectedPsm });
        const totalDuration = Math.round(performance.now() - startTime);

        setRawText(result.text);
        setConfidence(result.confidence);
        setExpression(result.expression || "");
        setAttempts([{
          variant: processingMode,
          psm: selectedPsm,
          text: result.text,
          expression: result.expression,
          confidence: result.confidence,
          duration: totalDuration
        }]);

        let calculatedAns = null;
        if (result.expression) {
          try {
            const sol = solve(result.expression);
            calculatedAns = sol.answer;
            setAnswer(sol.answer);
          } catch (calcErr) {
            // Expression error
          }
        }

        setStatusText(`Single pass completed in ${totalDuration} ms`);

        onRecordHistory({
          expression: result.expression,
          candidateExpression: result.expression,
          rawText: result.text,
          answer: calculatedAns,
          confidence: result.confidence,
          ambiguous: false,
          conflicts: [],
          attempts: [{
            variant: processingMode,
            psm: selectedPsm,
            text: result.text,
            expression: result.expression,
            confidence: result.confidence,
            duration: totalDuration
          }],
          duration: totalDuration,
          previewUrl
        });
      }
    } catch (err) {
      setStatusText("Recognition failed");
      setError(err.message || "OCR execution error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleCalculateManual() {
    if (!expression.trim()) return;
    try {
      setError("");
      const sol = solve(expression);
      setAnswer(sol.answer);
      setStatusText("Expression evaluated successfully");
    } catch (err) {
      setAnswer(null);
      setError(`Calculation error: ${err.message}`);
    }
  }

  return (
    <div className="tab-pane ocr-lab-view">
      <div className="section-header">
        <div>
          <h2>OCR Engineering Laboratory</h2>
          <p className="subtitle">High-precision local arithmetic recognition, multi-pass consensus, and character diagnostics.</p>
        </div>
        <div className="status-pill">
          <span className="dot" />
          {statusText}
        </div>
      </div>

      <div className="lab-layout">
        {/* Left column: Image input & controls */}
        <div className="lab-column">
          <div className="card">
            <div className="card-header">
              <h3>01 / Image Input & Preprocessing</h3>
            </div>

            <div
              className={`dropzone ${file ? "has-file" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              <div className="dropzone-icon">📷</div>
              <strong>{file ? file.name : "Drag & drop question image here"}</strong>
              <span>PNG, JPG, WebP · Max 10 MB</span>
            </div>

            {previewUrl && (
              <div className="preview-container">
                <div className="preview-tabs">
                  <button
                    className={`preview-tab-btn ${activeVariantTab === "original" ? "active" : ""}`}
                    onClick={() => setActiveVariantTab("original")}
                  >
                    Original
                  </button>
                  {variantsList.map((v) => (
                    <button
                      key={v.name}
                      className={`preview-tab-btn ${activeVariantTab === v.name ? "active" : ""}`}
                      onClick={() => setActiveVariantTab(v.name)}
                    >
                      {v.name.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="preview-frame">
                  {activeVariantTab === "original" ? (
                    <img src={previewUrl} alt="Original question" />
                  ) : (
                    variantsList.find((v) => v.name === activeVariantTab)?.canvas ? (
                      <img
                        src={variantsList.find((v) => v.name === activeVariantTab).canvas.toDataURL()}
                        alt={`${activeVariantTab} variant`}
                      />
                    ) : null
                  )}
                </div>
              </div>
            )}

            <div className="controls-row">
              <div className="control-group">
                <label>Pipeline Mode</label>
                <select
                  value={processingMode}
                  onChange={(e) => setProcessingMode(e.target.value)}
                  disabled={loading}
                >
                  <option value="consensus">Consensus Multi-Pass (Recommended)</option>
                  <option value="enhanced">Enhanced Grayscale</option>
                  <option value="otsu">Otsu Global Threshold</option>
                  <option value="adaptive">Dynamic Adaptive Threshold</option>
                </select>
              </div>

              {processingMode !== "consensus" && (
                <div className="control-group">
                  <label>Page Segmentation Mode (PSM)</label>
                  <select
                    value={selectedPsm}
                    onChange={(e) => setSelectedPsm(e.target.value)}
                    disabled={loading}
                  >
                    <option value="6">PSM 6 (Uniform Block / Multi-Line)</option>
                    <option value="4">PSM 4 (Single Column of Text)</option>
                    <option value="11">PSM 11 (Sparse Text / Any Order)</option>
                    <option value="7">PSM 7 (Single Text Line)</option>
                  </select>
                </div>
              )}
            </div>

            <button
              className="btn-primary w-full"
              onClick={runRecognition}
              disabled={(!file && !previewUrl) || loading}
            >
              {loading ? "Processing Multi-Pass OCR..." : "⚡ Execute OCR Recognition"}
            </button>
          </div>
        </div>

        {/* Right column: Recognition Output & Arithmetic Engine */}
        <div className="lab-column">
          <div className="card">
            <div className="card-header">
              <h3>02 / Recognition Results</h3>
              {confidence !== null && (
                <span className={`confidence-pill ${confidence >= 85 ? "high" : confidence >= 70 ? "medium" : "low"}`}>
                  Confidence: {confidence.toFixed(1)}%
                </span>
              )}
            </div>

            {ambiguous && (
              <div className="alert alert-warning">
                <strong>⚠️ Ambiguity Warning:</strong> Disagreements detected across passes.
                {conflicts.map((c, i) => (
                  <div key={i} className="conflict-detail">
                    • {c.description}
                  </div>
                ))}
              </div>
            )}

            <div className="output-section">
              <label>Raw OCR Output</label>
              <pre className="terminal-box">{rawText || "Awaiting image OCR execution..."}</pre>
            </div>

            <div className="expression-box">
              <label htmlFor="lab-expr">Extracted Expression (Editable)</label>
              <div className="input-action-group">
                <input
                  id="lab-expr"
                  type="text"
                  className="input-field monospace"
                  value={expression}
                  placeholder="e.g. 25 × 16"
                  onChange={(e) => setExpression(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCalculateManual()}
                />
                <button
                  className="btn-success"
                  onClick={handleCalculateManual}
                  disabled={!expression.trim()}
                >
                  Calculate
                </button>
              </div>
            </div>

            {answer !== null && (
              <div className="result-display">
                <span className="result-tag">CALCULATED RESULT</span>
                <div className="result-number">{answer}</div>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}
          </div>

          {attempts.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3>03 / OCR Pass Diagnostics</h3>
                <span className="badge">{attempts.length} passes</span>
              </div>

              <div className="attempts-list">
                {attempts.map((att, idx) => (
                  <div key={idx} className="attempt-card">
                    <div className="attempt-meta">
                      <span className="variant-label">{att.variant.toUpperCase()} · PSM {att.psm}</span>
                      <span className="attempt-duration">{att.duration} ms</span>
                      <span className="attempt-conf">{att.confidence.toFixed(1)}%</span>
                    </div>
                    <code className="attempt-code">{att.expression || "(No expression detected)"}</code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

