import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Upload,
  FileText,
  CheckCircle,
  Copy,
  Download,
  Trash2,
  Table,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { jsonTextToCsv, parseCsv } from "../utils/jsonToCsv";
import CsvGrid from "./CsvGrid";

const SAMPLE_JSON = JSON.stringify(
  [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@example.com",
      active: true,
      address: { city: "Seattle", zip: "98101" },
      tags: ["admin", "beta"],
    },
    {
      id: 2,
      name: "Bob Singh",
      email: "bob@example.com",
      active: false,
      address: { city: "Austin", zip: "73301" },
      tags: ["user"],
    },
    {
      id: 3,
      name: "Carol, Jr.",
      email: "carol@example.com",
      active: true,
      address: { city: "Berlin", zip: "10115" },
      tags: [],
    },
  ],
  null,
  2,
);

const DELIMITER_OPTIONS = [
  { value: ",", label: "Comma (,)" },
  { value: ";", label: "Semicolon (;)" },
  { value: "\t", label: "Tab (\\t)" },
  { value: "|", label: "Pipe (|)" },
];

/**
 * JsonToCsvViewer — converts a JSON document into CSV.
 *
 * Layout mirrors JsonViewer: a left input editor, a center result preview,
 * and a right context panel with conversion options and metadata.
 */
export default function JsonToCsvViewer() {
  const [jsonText, setJsonText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [meta, setMeta] = useState({ rowCount: 0, headers: [], source: "" });

  const [delimiter, setDelimiter] = useState(",");
  const [includeBom, setIncludeBom] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const editorRef = useRef(null);

  /* ---------- Toolbar Actions ---------- */

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setJsonText(e.target.result);
      setCsvText("");
      setParsedRows([]);
      setError("");
      setSuccess("");
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleLoadSample = () => {
    setJsonText(SAMPLE_JSON);
    setCsvText("");
    setParsedRows([]);
    setError("");
    setSuccess("Sample loaded — click Convert to generate CSV.");
  };

  const handleClear = () => {
    setJsonText("");
    setCsvText("");
    setParsedRows([]);
    setError("");
    setSuccess("");
    setMeta({ rowCount: 0, headers: [], source: "" });
  };

  const handleConvert = () => {
    try {
      const result = jsonTextToCsv(jsonText, { delimiter, includeBom });
      setCsvText(result.csv);
      const parsed = parseCsv(result.csv, { delimiter });
      setParsedRows(parsed.rows);
      setError("");
      setSuccess(
        result.rowCount > 0
          ? `Converted ${result.rowCount} row(s) using ${result.source}.`
          : "JSON parsed but no rows were found to convert.",
      );
      setMeta({
        rowCount: result.rowCount,
        headers: result.headers,
        source: result.source,
      });
    } catch (err) {
      setCsvText("");
      setParsedRows([]);
      setError(err.message);
      setSuccess("");
    }
  };

  const handleCopy = async () => {
    if (!csvText) return;
    try {
      await navigator.clipboard.writeText(csvText);
      setSuccess("CSV copied to clipboard.");
    } catch {
      setError("Clipboard access denied.");
    }
  };

  const handleDownload = () => {
    if (!csvText) {
      setError("Convert first before downloading.");
      return;
    }
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)]">
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="csv-file-upload"
              className="hidden"
              accept=".json,application/json"
              onChange={handleUpload}
            />
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all"
              onClick={() => document.getElementById("csv-file-upload").click()}
            >
              <Upload size={14} />
              <span>Upload</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all"
              onClick={handleLoadSample}
            >
              <FileText size={14} />
              <span>Sample</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--accent)] text-white hover:bg-opacity-90 transition-all"
              onClick={handleConvert}
            >
              <CheckCircle size={14} />
              <span>Convert</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all"
              onClick={handleCopy}
            >
              <Copy size={14} />
              <span>Copy</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all"
              onClick={handleDownload}
            >
              <Download size={14} />
              <span>Download</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all"
              onClick={handleClear}
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Status / Error bar */}
        {(error || success) && (
          <div
            className={`px-4 py-2 text-xs border-b border-[var(--border-color)] ${
              error
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {error || success}
          </div>
        )}

        {/* Two-pane: JSON input (left) + CSV output (right) */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-[var(--border-color)]">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
              Input JSON
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="json"
                theme="vs"
                value={jsonText}
                onChange={(v) => {
                  setJsonText(v || "");
                  setError("");
                  setSuccess("");
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider opacity-60 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] flex items-center justify-between">
              <span>CSV Output</span>
              {csvText && (
                <span className="opacity-50 normal-case font-normal tracking-normal">
                  {meta.rowCount} rows · {meta.headers.length} columns
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 overflow-auto">
              <CsvGrid headers={meta.headers} rows={parsedRows} />
            </div>
          </div>
        </div>
      </div>

      {/* Right context panel: options + metadata */}
      <aside
        className={`relative h-full border-l border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-main)] flex flex-col transition-all duration-300 ${
          rightCollapsed ? "w-12" : "w-80"
        }`}
      >
        {/* Floating toggle button — mirrors left NavigationRail */}
        <button
          onClick={() => setRightCollapsed((v) => !v)}
          className="absolute -left-3 top-12 z-50 w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] transition-all shadow-sm cursor-pointer"
          title={rightCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {rightCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {rightCollapsed ? (
          // Collapsed view — just the icon hint
          <div className="flex flex-col items-center pt-16 gap-4 text-[var(--text-muted)]">
            <Table size={16} />
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-[var(--border-color)]">
          <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3 flex items-center gap-2">
            <Table size={12} /> Conversion Options
          </h3>

          <label className="block text-[11px] opacity-70 mb-1">Delimiter</label>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="w-full mb-3 px-2 py-1.5 text-xs rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            {DELIMITER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeBom}
              onChange={(e) => setIncludeBom(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            <span>Include UTF-8 BOM (helps Excel)</span>
          </label>
        </div>

        <div className="p-4 border-b border-[var(--border-color)]">
          <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">Detected Headers</h3>
          {meta.headers.length === 0 ? (
            <p className="text-[11px] opacity-50 italic">No conversion yet.</p>
          ) : (
            <ul className="text-[11px] font-mono space-y-1 max-h-48 overflow-y-auto pr-1">
              {meta.headers.map((h) => (
                <li
                  key={h}
                  className="px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-color)] truncate"
                  title={h}
                >
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">Status</h3>
          <div className="p-3 rounded-md border bg-[var(--bg-primary)] border-[var(--border-color)]">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="opacity-60">Source</span>
              <span className="font-medium">{meta.source || "—"}</span>
            </div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="opacity-60">Rows</span>
              <span className="font-medium">{meta.rowCount}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="opacity-60">Columns</span>
              <span className="font-medium">{meta.headers.length}</span>
            </div>
          </div>
          <p className="text-[10px] opacity-50 mt-3 leading-relaxed">
            Nested objects are flattened with a dot separator. Primitive arrays are
            joined with a semicolon; complex arrays fall back to compact JSON.
          </p>
        </div>
          </div>
        )}
      </aside>
    </div>
  );
}
