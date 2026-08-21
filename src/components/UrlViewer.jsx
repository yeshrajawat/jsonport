import React, { useMemo, useState } from "react";
import {
  Link2,
  Copy,
  Trash2,
  ClipboardPaste,
  AlertTriangle,
  Info,
  Settings2,
  RefreshCcw,
  ListTree,
  Search,
} from "lucide-react";

/* ---------- Helpers ---------- */

const SAMPLE_URL = "https://example.com/search?q=hello world&sort=asc";
const SAMPLE_ENCODED =
  "https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26sort%3Dasc";

function encodeFullUrl(input) {
  // encodeURI keeps URL structure characters while encoding the rest
  return encodeURI(input);
}

function encodeComponent(input) {
  return encodeURIComponent(input);
}

function decodeFullUrl(input) {
  try {
    return decodeURIComponent(input);
  } catch {
    return { ok: false, error: "Input is not a valid URL-encoded string." };
  }
}

function parseUrl(input) {
  try {
    const u = new URL(input);
    const params = [];
    u.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
    return {
      ok: true,
      protocol: u.protocol,
      host: u.host,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      params,
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
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

export default function UrlViewer() {
  const [mode, setMode] = useState("encode"); // "encode" | "decode"
  const [subTab, setSubTab] = useState("decode"); // for decode screen: "decode" | "inspect"
  const [encodeInput, setEncodeInput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [encodeMode, setEncodeMode] = useState("full"); // "full" | "component"

  const encodedOutput = useMemo(() => {
    if (!encodeInput) return { value: "", ok: true };
    try {
      const v =
        encodeMode === "full" ? encodeFullUrl(encodeInput) : encodeComponent(encodeInput);
      return { value: v, ok: true };
    } catch (e) {
      return { value: "", ok: false, error: e.message };
    }
  }, [encodeInput, encodeMode]);

  const decodedOutput = useMemo(() => {
    if (!decodeInput) return { value: "", ok: true };
    const r = decodeFullUrl(decodeInput);
    if (typeof r === "string") return { value: r, ok: true };
    return r;
  }, [decodeInput]);

  const parsed = useMemo(() => {
    if (!decodedOutput.ok || !decodedOutput.value) return null;
    return parseUrl(decodedOutput.value);
  }, [decodedOutput]);

  /* ---------- Toolbar handlers ---------- */

  const handleClear = () => {
    if (mode === "encode") setEncodeInput("");
    else setDecodeInput("");
  };

  const handleLoadSample = () => {
    if (mode === "encode") setEncodeInput(SAMPLE_URL);
    else setDecodeInput(SAMPLE_ENCODED);
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
                <Link2 size={20} />
              </span>
              <h1 className="text-2xl font-bold text-[var(--text-main)]">
                URL {mode === "encode" ? "Encoder" : "Decoder"}
              </h1>
            </div>
            <p className="text-xs opacity-60">
              {mode === "encode"
                ? "Encode URLs and query parameters."
                : "Decode URLs and view components."}
            </p>
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

          {/* Decode sub-tabs */}
          {mode === "decode" && (
            <div className="flex gap-1 border-b border-[var(--border-color)] -mx-4 px-4 mb-3 -mt-2">
              {[
                { id: "decode", label: "Decode" },
                { id: "inspect", label: "Inspect" },
              ].map((t) => {
                const active = t.id === subTab;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSubTab(t.id)}
                    className={`relative px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
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
          )}

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
                if (mode === "encode") navigator.clipboard.writeText(encodedOutput.value || "");
                else navigator.clipboard.writeText(decodedOutput.value || "");
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
                  Input{mode === "decode" ? " (Encoded URL)" : ""}
                </label>
                <PasteButton
                  onPaste={(v) =>
                    mode === "encode" ? setEncodeInput(v) : setDecodeInput(v)
                  }
                />
              </div>
              <textarea
                value={mode === "encode" ? encodeInput : decodeInput}
                onChange={(e) =>
                  mode === "encode" ? setEncodeInput(e.target.value) : setDecodeInput(e.target.value)
                }
                spellCheck={false}
                placeholder={
                  mode === "encode"
                    ? "Enter a URL or string to encode…"
                    : "Paste an encoded URL to decode…"
                }
                className="w-full h-40 px-3 py-2 text-xs font-mono rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] outline-none focus:ring-2 resize-y"
                style={{ "--tw-ring-color": "var(--accent-soft, rgba(194, 65, 12, 0.45))" }}
              />
              <div className="flex items-center justify-between mt-1">
                <CharCount text={mode === "encode" ? encodeInput : decodeInput} />
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
                {mode === "encode" ? "Output (Encoded)" : "Decoded URL"}
              </label>
              <textarea
                readOnly
                value={mode === "encode" ? encodedOutput.value : decodedOutput.value || ""}
                placeholder={
                  mode === "encode"
                    ? "Encoded URL appears here"
                    : "Decoded URL appears here"
                }
                className="w-full h-40 px-3 py-2 text-xs font-mono rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] outline-none resize-y"
              />
              <div className="flex items-center justify-between mt-1">
                <CharCount
                  text={mode === "encode" ? encodedOutput.value : decodedOutput.value || ""}
                />
                <CopyButton
                  getValue={() =>
                    mode === "encode" ? encodedOutput.value : decodedOutput.value
                  }
                />
              </div>

              {mode === "decode" && decodeInput && !decodedOutput.ok && (
                <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{decodedOutput.error}</span>
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
              {mode === "encode" ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="opacity-70 w-24">Encode mode:</span>
                  <select
                    value={encodeMode}
                    onChange={(e) => setEncodeMode(e.target.value)}
                    className="px-2 py-1 text-xs rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  >
                    <option value="full">Full URL</option>
                    <option value="component">Component</option>
                  </select>
                </div>
              ) : (
                <p className="text-[11px] opacity-60">
                  Decoding uses <code className="font-mono">decodeURIComponent</code>.
                </p>
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
                    About URL encoding
                  </div>
                  <div className="opacity-80">
                    URL encoding converts special characters into a format that can be
                    safely transmitted over the internet.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* URL Components panel (decode mode) */}
      {mode === "decode" && subTab === "inspect" && (
        <div className="px-6 pb-6">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2">
              <ListTree size={12} /> URL Components
            </h3>
            {!parsed ? (
              <p className="text-[11px] opacity-50 italic">
                Decode a URL above to see its components here.
              </p>
            ) : !parsed.ok ? (
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{parsed.error}</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Protocol", value: parsed.protocol || "—" },
                    { label: "Host", value: parsed.host || "—" },
                    { label: "Hostname", value: parsed.hostname || "—" },
                    { label: "Port", value: parsed.port || "—" },
                    { label: "Path", value: parsed.pathname || "—" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2"
                    >
                      <div className="text-[10px] uppercase tracking-wider opacity-50">
                        {row.label}
                      </div>
                      <div className="text-xs font-mono truncate" title={row.value}>
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>

                <h4 className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-2 flex items-center gap-2">
                  <Search size={11} /> Query Parameters
                </h4>
                {parsed.params.length === 0 ? (
                  <p className="text-[11px] opacity-50 italic">No query parameters found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[10px] uppercase tracking-wider opacity-60 border-b border-[var(--border-color)]">
                          <th className="py-1.5 pr-3 font-semibold">Key</th>
                          <th className="py-1.5 font-semibold">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.params.map((p, i) => (
                          <tr
                            key={`${p.key}-${i}`}
                            className="border-b border-[var(--border-color)] last:border-b-0"
                          >
                            <td className="py-1.5 pr-3 font-mono">{p.key}</td>
                            <td className="py-1.5 font-mono break-all">{p.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
