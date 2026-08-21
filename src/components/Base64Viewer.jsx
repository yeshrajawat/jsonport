import React, { useMemo, useState } from "react";
import {
  Lock,
  Copy,
  Trash2,
  ClipboardPaste,
  CheckCircle2,
  AlertTriangle,
  Info,
  Settings2,
  RefreshCcw,
} from "lucide-react";

/* ---------- Helpers ---------- */

const SAMPLE_TEXT = "Hello, JSONPort!";
const SAMPLE_BASE64 = "SGVsbG8sIEpTT05Qb3J0IQ==";

function binaryStringToBytes(bin) {
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
  return bytes;
}

function encodeBase64(text, encoding) {
  if (text == null) return "";
  const bytes =
    encoding === "utf-8"
      ? new TextEncoder().encode(String(text))
      : (() => {
          // Latin1 fallback: treat each char code point as a byte
          const s = String(text);
          const out = new Uint8Array(s.length);
          for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
          return out;
        })();
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function decodeBase64(b64, encoding) {
  const clean = (b64 || "").replace(/\s+/g, "");
  if (!clean) return { ok: true, value: "" };
  // Pad to multiple of 4
  const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4);
  let bin;
  try {
    bin = atob(padded);
  } catch {
    return { ok: false, error: "Input is not valid Base64." };
  }
  const bytes = binaryStringToBytes(bin);
  const value =
    encoding === "utf-8"
      ? new TextDecoder("utf-8", { fatal: false }).decode(bytes)
      : (() => {
          let s = "";
          for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
          return s;
        })();
  return { ok: true, value };
}

function tryAutoDetectBase64(input) {
  if (!input) return false;
  const cleaned = input.replace(/\s+/g, "");
  if (!cleaned) return false;
  if (!/^[A-Za-z0-9+/=_-]+$/.test(cleaned)) return false;
  // Reject if it looks like plain text (too many printable ASCII letters in a row)
  // — heuristic: must have at least one character that is uncommon in prose
  // (digit, +, /, =, -, _) or the padding `=`.
  if (!/[+/=_-]/.test(cleaned)) return false;
  // Reject very short strings
  if (cleaned.length < 4) return false;
  return true;
}

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
    <span className="text-[10px] opacity-50 font-mono">
      {text.length} characters
    </span>
  );
}

function CopyButton({ getValue, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
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
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer"
      title="Copy"
    >
      <Copy size={11} />
      {copied ? "Copied" : label}
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
      title="Paste from clipboard"
    >
      <ClipboardPaste size={11} />
      Paste
    </button>
  );
}

/* ---------- Main component ---------- */

export default function Base64Viewer() {
  const [mode, setMode] = useState("encode"); // "encode" | "decode"
  const [encodeInput, setEncodeInput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [encoding, setEncoding] = useState("utf-8");
  const [autoDetect, setAutoDetect] = useState(true);

  const encodedOutput = useMemo(() => {
    if (!encodeInput) return { value: "", ok: true };
    try {
      return { value: encodeBase64(encodeInput, encoding), ok: true };
    } catch (e) {
      return { value: "", ok: false, error: e.message };
    }
  }, [encodeInput, encoding]);

  const decodedOutput = useMemo(() => {
    if (!decodeInput) return { value: "", ok: true, autoDetected: false };
    // If auto-detect is on, also try to detect on every change; otherwise pass-through
    if (autoDetect && !tryAutoDetectBase64(decodeInput)) {
      return { value: "", ok: true, autoDetected: false, hint: "Awaiting valid Base64 input" };
    }
    const res = decodeBase64(decodeInput, encoding);
    return { ...res, autoDetected: autoDetect };
  }, [decodeInput, encoding, autoDetect]);

  /* ---------- Toolbar handlers ---------- */

  const handleClear = () => {
    if (mode === "encode") setEncodeInput("");
    else setDecodeInput("");
  };

  const handleLoadSample = () => {
    if (mode === "encode") setEncodeInput(SAMPLE_TEXT);
    else setDecodeInput(SAMPLE_BASE64);
  };

  const handleSwap = () => {
    if (mode === "encode") {
      setDecodeInput(encodedOutput.value || "");
      setMode("decode");
    } else {
      setEncodeInput(decodedOutput.value || "");
      setMode("encode");
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
                <Lock size={20} />
              </span>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">Base64</h1>
            </div>
            <p className="text-xs opacity-60">Encode and decode Base64 strings.</p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-6 py-4">
        <Card>
          <Tabs
            tabs={[
              { id: "encode", label: "Encode" },
              { id: "decode", label: "Decode" },
            ]}
            value={mode}
            onChange={setMode}
          />

          {/* Toolbar (per the reference) */}
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
                if (mode === "encode") {
                  navigator.clipboard.writeText(encodedOutput.value || "");
                } else {
                  navigator.clipboard.writeText(decodedOutput.value || "");
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
                  Input{mode === "decode" ? " (Base64)" : ""}
                </label>
                <PasteButton
                  onPaste={(v) => (mode === "encode" ? setEncodeInput(v) : setDecodeInput(v))}
                />
              </div>
              <textarea
                value={mode === "encode" ? encodeInput : decodeInput}
                onChange={(e) =>
                  mode === "encode" ? setEncodeInput(e.target.value) : setDecodeInput(e.target.value)
                }
                spellCheck={false}
                placeholder={mode === "encode" ? "Type or paste text to encode…" : "Paste Base64 to decode…"}
                className="w-full h-44 px-3 py-2 text-xs font-mono rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] outline-none focus:ring-2 resize-y"
                style={{ "--tw-ring-color": "var(--accent-soft, rgba(194, 65, 12, 0.45))" }}
              />
              <div className="flex items-center justify-between mt-1">
                <CharCount text={mode === "encode" ? encodeInput : decodeInput} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadSample}
                    className="text-[10px] opacity-60 hover:opacity-100 underline cursor-pointer"
                    title="Load sample"
                  >
                    Load sample
                  </button>
                  <button
                    onClick={handleSwap}
                    className="flex items-center gap-1 text-[10px] opacity-60 hover:opacity-100 cursor-pointer"
                    title="Swap to the other direction"
                  >
                    <RefreshCcw size={10} /> Swap
                  </button>
                </div>
              </div>
            </div>

            {/* Output */}
            <div className="flex flex-col">
              <label className="text-[11px] font-semibold opacity-70 mb-1">
                Output{mode === "encode" ? " (Base64)" : " (Decoded)"}
              </label>
              <textarea
                readOnly
                value={
                  mode === "encode"
                    ? encodedOutput.value
                    : decodedOutput.ok
                    ? decodedOutput.value
                    : ""
                }
                placeholder={mode === "encode" ? "Encoded result appears here" : "Decoded result appears here"}
                className="w-full h-44 px-3 py-2 text-xs font-mono rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] outline-none resize-y"
              />
              <div className="flex items-center justify-between mt-1">
                <CharCount
                  text={
                    mode === "encode"
                      ? encodedOutput.value
                      : decodedOutput.ok
                      ? decodedOutput.value
                      : ""
                  }
                />
                <CopyButton
                  getValue={() =>
                    mode === "encode" ? encodedOutput.value : decodedOutput.value
                  }
                />
              </div>

              {/* Status row */}
              {mode === "decode" && decodeInput && (
                <div className="mt-3">
                  {!decodedOutput.ok ? (
                    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>{decodedOutput.error}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                      <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">Decoded successfully</div>
                        <div className="opacity-70">
                          {autoDetect && decodedOutput.autoDetected
                            ? "Auto-detected Base64 input."
                            : "The decoded content is plain text."}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Options + info row */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2 flex items-center gap-2">
                <Settings2 size={12} /> Options
              </h3>
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="opacity-70 w-20">Encoding:</span>
                <select
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value)}
                  className="px-2 py-1 text-xs rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="utf-8">UTF-8</option>
                  <option value="latin1">Latin-1</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="opacity-70 w-20">Variant:</span>
                <select
                  value="rfc4648"
                  onChange={() => {}}
                  className="px-2 py-1 text-xs rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  <option value="rfc4648">Base64 (RFC 4648)</option>
                </select>
              </div>
              {mode === "decode" && (
                <label className="flex items-center gap-2 text-xs mt-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoDetect}
                    onChange={(e) => setAutoDetect(e.target.checked)}
                    className="accent-[var(--accent)]"
                  />
                  Auto-detect Base64URL
                </label>
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
                <Info size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                <div>
                  <div className="font-semibold mb-0.5" style={{ color: "var(--accent)" }}>
                    What is Base64?
                  </div>
                  <div className="opacity-80">
                    Base64 is a way to encode binary data into ASCII characters so it
                    can be transmitted over text-based protocols.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
