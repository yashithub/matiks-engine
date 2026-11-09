import { useState } from "react";

import { preprocessImage } from "./ocr/image-processor.js";
import { recognizeImage } from "./ocr/ocr-engine.js";
import { extractExpression } from "./ocr/extract-expression.js";
import { solve } from "./engine/index.js";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [expression, setExpression] = useState("");
  const [answer, setAnswer] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [ambiguous, setAmbiguous] = useState(false);

  function handleFile(event) {
    const selected = event.target.files?.[0];

    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError("Maximum image size is 10 MB.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));

    setOcrText("");
    setExpression("");
    setAnswer(null);
    setConfidence(null);
    setError("");
    setStatus("Image loaded");
  }

  async function runOCR() {
    if (!file || loading) return;

    setLoading(true);
    setError("");
    setAnswer(null);
    setAttempts([]);
    setExpression("");
    setAmbiguous(false);

    try {
      setStatus("Creating image variants...");

      const variants = await preprocessVariants(file);

      setStatus("Running multiple OCR attempts...");

      const result = await recognizeVariants(variants);

      setAttempts(result.attempts);
      setOcrText(result.text);
      setConfidence(result.confidence);
      setAmbiguous(result.ambiguous);

      if (result.ambiguous) {
        setStatus("Recognition needs verification");
        setError(
          "OCR attempts disagree. Please verify the expression manually.",
        );
      } else if (result.expression) {
        setExpression(result.expression);
        setStatus("Recognition completed");
      } else {
        setStatus("No expression detected");
        setError("Could not identify a valid arithmetic expression.");
      }
    } catch (err) {
      setStatus("Recognition failed");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function calculateAnswer() {
    try {
      setError("");

      const result = solve(expression);

      setAnswer(result.answer);
      setStatus("Calculation completed");
    } catch (err) {
      setAnswer(null);
      setError(err.message);
      setStatus("Invalid expression");
    }
  }

  return (
    <main className="app">
      <header className="header">
        <div>
          <div className="eyebrow">MATHPILOT / DEVELOPMENT LAB</div>
          <h1>Matiks Companion</h1>
          <p>Image recognition and arithmetic testing</p>
        </div>

        <div className="status">
          <span className="status-dot" />
          {status}
        </div>
      </header>

      <section className="panel">
        <h2>01 / Image input</h2>

        <label className="upload">
          <input type="file" accept="image/*" onChange={handleFile} />

          <span className="upload-icon">↑</span>
          <strong>Upload question image</strong>
          <span>PNG, JPG or WebP · Maximum 10 MB</span>
        </label>

        {preview && (
          <div className="preview">
            <img src={preview} alt="Uploaded question" />
          </div>
        )}

        <button onClick={runOCR} disabled={!file || loading}>
          {loading ? "Processing..." : "Run OCR"}
        </button>
      </section>

      <section className="panel">
        <h2>02 / Recognition results</h2>

        <label>Raw OCR output</label>

        <pre className="ocr-output">
          {ocrText || "Waiting for image recognition..."}
        </pre>

        <div className="confidence">
          <span>OCR confidence</span>
          <strong>
            {confidence !== null ? `${confidence.toFixed(1)}%` : "--"}
          </strong>
        </div>

        {confidence !== null && confidence < 70 && (
          <p className="warning">
            Low OCR confidence. Verify the expression manually.
          </p>
        )}
      </section>
      {attempts.length > 0 && (
        <div className="attempts">
          <h3>OCR diagnostics</h3>

          {attempts.map((attempt, index) => (
            <div className="attempt" key={index}>
              <div>
                <strong>
                  {attempt.variant.toUpperCase()} / PSM {attempt.psm}
                </strong>

                <span>{attempt.confidence.toFixed(1)}%</span>
              </div>

              <code>{attempt.expression || "No expression detected"}</code>
            </div>
          ))}
        </div>
      )}
      <section className="panel">
        <h2>03 / Arithmetic engine</h2>

        <label htmlFor="expression">Detected expression (editable)</label>

        <input
          id="expression"
          className="expression-input"
          value={expression}
          onChange={(event) => {
            setExpression(event.target.value);
            setAnswer(null);
          }}
          placeholder="Example: 248 × 16"
        />

        <button
          className="calculate-button"
          onClick={calculateAnswer}
          disabled={!expression.trim() || loading}
        >
          Calculate
        </button>

        {answer !== null && (
          <div className="answer">
            <span>CALCULATED RESULT</span>
            <strong>{answer}</strong>
          </div>
        )}
      </section>

      {error && <div className="error">{error}</div>}

      <footer>MATHPILOT · LOCAL OCR LAB · NO EXTERNAL AI API</footer>
    </main>
  );
}
