import React, { useMemo, useState } from "react";
import {
  Code2,
  Copy,
  Trash2,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  Info,
  Settings2,
  Lightbulb,
  RefreshCcw,
} from "lucide-react";

/* ---------- Helpers ---------- */

const SAMPLE_STRING = '{"name":"John","age":25,"skills":["Java","JavaScript"],"active":true}';
const SAMPLE_JSON = JSON.stringify(
  {
    name: "John",
    age: 25,
    skills: ["Java", "JavaScript"],
    active: true,
  },
  null,
  2,
);

/* ---------- Small UI primitives ---------- */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}

function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 border-b border-[var(--border-color)] -mx-4 px-4 mb-4">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`relative px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
              active
                ? "text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
            }`}
          >
            {t.label}
            {active && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-[var(--accent)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function CharCount({ text }) {
  return (
    <span className="text-[10px] opacity-50 font-mono">{text.length} characters</span>
  );
}

function CopyButton({ getValue }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    const v = getValue();
    if (!v) return;
    try {
      await navigator.clipboard.writeText(v);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
    >
      <Copy size={11} /> {copied ? "Copied" : "Copy"}
    </button>
  );
}

function PasteButton({ onPaste }) {
  const handle = async () => {
    try {
      const v = await navigator.clipboard.readText();
      onPaste(v || "");
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
    >
      <ClipboardPaste size={11} /> Paste
    </button>
  );
}

/* ---------- Main component ---------- */

export default function StringJsonViewer() {
  const [mode, setMode] = useState("string-to-json"); // "string-to-json" | "json-to-string"
  const [stringInput, setStringInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");

  // JSON → String options
  const [minify, setMinify] = useState(false);
  const [escapeSpecial, setEscapeSpecial] = useState(true);

  const stringToJsonResult = useMemo(() => {
    if (!stringInput.trim())
      return { value: "", pretty: "", ok: true, lines: 0 };
    try {
      const parsed = JSON.parse(stringInput);
      const pretty = JSON.stringify(parsed, null, 2);
      const lines = pretty ? pretty.split("\n").length : 0;
      return { value: parsed, pretty, ok: true, lines };
    } catch (e) {
      return { value: null, pretty: "", ok: false, error: e.message, lines: 0 };
    }
  }, [stringInput]);

  const jsonToStringResult = useMemo(() => {
    if (!jsonInput.trim())
      return { value: "", ok: true };
    try {
      const parsed = JSON.parse(jsonInput);
      const value = JSON.stringify(
        parsed,
        null,
        minify ? 0 : 0, // we always emit single-line for the "string" output
      );
      // For "JSON → String" the reference shows the stringified form on a single line.
      // If escapeSpecial is off, we attempt to unescape common characters for display.
      const display = escapeSpecial
        ? value
        : value
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, "\\");
      return { value: display, ok: true };
    } catch (e) {
      return { value: "", ok: false, error: e.message };
    }
  }, [jsonInput, minify, escapeSpecial]);

  /* ---------- Toolbar handlers ---------- */

  const handleClear = () => {
    if (mode === "string-to-json") setStringInput("");
    else setJsonInput("");
  };

  const handleLoadSample = () => {
    if (mode === "string-to-json") setStringInput(SAMPLE_STRING);
    else setJsonInput(SAMPLE_JSON);
  };

  const handleSwap = () => {
    if (mode === "string-to-json") {
      setJsonInput(stringToJsonResult.pretty || "");
      setMode("json-to-string");
    } else {
      // Try to reconstruct a string from the JSON input
      if (jsonToStringResult.ok) {
        setStringInput(JSON.stringify(JSON.parse(jsonInput || "null")));
        setMode("string-to-json");
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent-soft, rgba(194, 65, 12, 0.10))", color: "var(--accent)" }}
              >
                <Code2 size={20} />
              </span>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">
                String ⇄ JSON
              </h1>
            </div>
            <p className="text-xs opacity-60">
              {mode === "string-to-json"
                ? "Convert a string to JSON."
                : "Convert a JSON document into a string."}
            </p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-6 py-4">
        <Card>
          <Tabs
            tabs={[
              { id: "string-to-json", label: "String → JSON" },
              { id: "json-to-string", label: "JSON → String" },
            ]}
            value={mode}
            onChange={setMode}
          />

          {/* Toolbar */}
          <div className="flex items-center justify-end gap-2 mb-3">
            <button
              className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-all cursor-pointer"
              onClick={handleClear}
            >
              <Trash2 size={11} /> Clear
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
              onClick={() => {
                if (mode === "string-to-json") {
                  navigator.clipboard.writeText(stringToJsonResult.pretty || "");
                } else {
                  navigator.clipboard.writeText(jsonToStringResult.value || "");
                }
              }}
            >
              <Copy size={11} /> Copy Result
            </button>
          </div>

          {/* Input + Output grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold opacity-70">
                  Input {mode === "string-to-json" ? "(String)" : "(JSON)"}
                </label>
                <PasteButton
                  onPaste={(v) =>
                    mode === "string-to-json" ? setStringInput(v) : setJsonInput(v)
                  }
                />
              </div>
              <textarea
                value={mode === "string-to-json" ? stringInput : jsonInput}
                onChange={(e) =>
                  mode === "string-to-json"
                    ? setStringInput(e.target.value)
                    : setJsonInput(e.target.value)
                }
                spellCheck={false}
                placeholder={
                  mode === "string-to-json"
                    ? "Paste a JSON-encoded string…"
                    : "Paste a JSON document…"
                }
                className="w-full h-56 px-3 py-2 text-xs font-mono rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] outline-none focus:ring-2 resize-y"
                style={{ "--tw-ring-color": "var(--accent-soft, rgba(194, 65, 12, 0.45))" }}
              />
              <div className="flex items-center justify-between mt-1">
                <CharCount text={mode === "string-to-json" ? stringInput : jsonInput} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadSample}
                    className="text-[10px] opacity-60 hover:opacity-100 underline cursor-pointer"
                  >
                    Load sample
                  </button>
                  <button
                    onClick={handleSwap}
                    className="flex items-center gap-1 text-[10px] opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    <RefreshCcw size={10} /> Swap
                  </button>
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold opacity-70 mb-1">
                Output {mode === "string-to-json" ? "(JSON)" : "(String)"}
              </label>
              <textarea
                readOnly
                value={
                  mode === "string-to-json"
                    ? stringToJsonResult.pretty
                    : jsonToStringResult.value
                }
                placeholder={
                  mode === "string-to-json"
                    ? "Pretty-printed JSON appears here"
                    : "JSON-as-string appears here"
                }
                className="w-full h-56 px-3 py-2 text-xs font-mono rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] outline-none resize-y"
              />
              <div className="flex items-center justify-between mt-1">
                {mode === "string-to-json" ? (
                  <span className="text-[10px] opacity-50 font-mono">
                    Pretty · {stringToJsonResult.lines} lines
                  </span>
                ) : (
                  <CharCount text={jsonToStringResult.value || ""} />
                )}
                <CopyButton
                  getValue={() =>
                    mode === "string-to-json"
                      ? stringToJsonResult.pretty
                      : jsonToStringResult.value
                  }
                />
              </div>

              {/* Status row */}
              {mode === "string-to-json" && stringInput && (
                <div className="mt-3">
                  {!stringToJsonResult.ok ? (
                    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>{stringToJsonResult.error}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                      <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Converted successfully</div>
                        <div className="opacity-70">Valid JSON.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mode === "json-to-string" && jsonInput && !jsonToStringResult.ok && (
                <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{jsonToStringResult.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Options + Tips row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 flex items-center gap-2">
                <Settings2 size={12} /> Options
              </h3>
              {mode === "string-to-json" ? (
                <p className="text-[11px] opacity-60">
                  Strings are parsed and pretty-printed with 2-space indentation.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={minify}
                      onChange={(e) => setMinify(e.target.checked)}
                      className="accent-[var(--accent)]"
                    />
                    Minify JSON
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={escapeSpecial}
                      onChange={(e) => setEscapeSpecial(e.target.checked)}
                      className="accent-[var(--accent)]"
                    />
                    Escape special characters
                  </label>
                </div>
              )}
            </div>
            <div
              className="rounded-md p-3 text-xs leading-relaxed"
              style={{
                background: "var(--accent-soft, rgba(194, 65, 12, 0.08))",
                border: "1px solid var(--accent-border, rgba(194, 65, 12, 0.30))",
                color: "var(--text-main)",
              }}
            >
              <div className="flex items-start gap-2">
                <Lightbulb size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                <div>
                  <div className="font-semibold mb-1" style={{ color: "var(--accent)" }}>
                    Tips
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 opacity-90">
                    <li>Supports escaped JSON strings</li>
                    <li>Automatically validates JSON</li>
                    <li>Use JSON → String to convert back</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
