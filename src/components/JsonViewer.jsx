import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Type,
  Minimize,
  Copy,
  Download,
  Trash2
} from "lucide-react";
import Editor from "@monaco-editor/react";
import ContextPanel from "./ContextPanel";

/**
 * JsonViewer is the main exploration tool.
 * It manages the JSON state and provides a high-performance code editor.
 */
export default function JsonViewer() {
  const [jsonText, setJsonText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [jsonStatus, setJsonStatus] = useState("unknown");
  const [searchResults, setSearchResults] = useState([]);
  const editorRef = useRef(null);

  /* ---------- Toolbar Action Logic ---------- */

  /**
   * Handles the "Upload" action.
   */
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setJsonText(e.target.result);
      setJsonStatus("unknown");
      setErrorMessage("");
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  /**
   * Loads a predefined sample JSON.
   */
  const handleLoadSample = () => {
    const sample = {
      users: [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" }
      ]
    };
    setJsonText(JSON.stringify(sample, null, 2));
    setJsonStatus("valid");
    setErrorMessage("");
  };

  /**
   * Validates the current JSON text.
   */
  const handleValidate = () => {
    try {
      JSON.parse(jsonText);
      setErrorMessage("JSON validated");
      setJsonStatus("valid");
    } catch (err) {
      setErrorMessage(err.message);
      setJsonStatus("invalid");
    }
  };

  /**
   * Beautifies the JSON with indentation.
   */
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setErrorMessage("");
      setJsonStatus("valid");
    } catch (err) {
      setErrorMessage(err.message);
      setJsonStatus("invalid");
    }
  };

  /**
   * Minifies the JSON into a single line.
   */
  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed));
      setErrorMessage("");
      setJsonStatus("valid");
    } catch (err) {
      setErrorMessage(err.message);
      setJsonStatus("invalid");
    }
  };

  /**
   * Copies JSON to clipboard.
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
  };

  /**
   * Downloads JSON as a file.
   */
  const handleDownload = () => {
    try {
      JSON.parse(jsonText);
      const blob = new Blob([jsonText], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setErrorMessage("Fix JSON before downloading");
    }
  };

  /**
   * Clears all current content.
   */
  const handleClear = () => {
    setJsonText("");
    setErrorMessage("");
    setJsonStatus("unknown");
  };

  /**
   * Performs a search in the JSON text and updates the results list.
   */
  const handleSearch = (term) => {
    if (!term) {
      setSearchResults([]);
      return;
    }

    const lines = jsonText.split("\n");
    const matches = [];
    const lowerTerm = term.toLowerCase();

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lowerTerm)) {
        matches.push({
          line: index + 1,
          content: line.trim(),
        });
      }
    });

    setSearchResults(matches);
  };

  const handleJumpToLine = (line) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.revealLineInCenter(line);
      editor.setPosition({ lineNumber: line, column: 1 });
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Unified Action Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)]">
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".json"
              onChange={handleUpload}
            />
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all" onClick={() => document.getElementById('file-upload').click()}>
              <Upload size={14} />
              <span>Upload</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all" onClick={handleLoadSample}>
              <FileText size={14} />
              <span>Sample</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--accent)] text-white hover:bg-opacity-90 transition-all" onClick={handleValidate}>
              <CheckCircle size={14} />
              <span>Validate</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all" onClick={handleFormat}>
              <Type size={14} />
              <span>Format</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all" onClick={handleMinify}>
              <Minimize size={14} />
              <span>Minify</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all" onClick={handleCopy}>
              <Copy size={14} />
              <span>Copy</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-all" onClick={handleDownload}>
              <Download size={14} />
              <span>Download</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all" onClick={handleClear}>
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
          <Editor
            height="100%"
            defaultLanguage="json"
            theme="vs"
            value={jsonText}
            onChange={(v) => {
              setJsonText(v || "");
              setJsonStatus("unknown");
              setErrorMessage("");
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
      <ContextPanel
        jsonText={jsonText}
        jsonStatus={jsonStatus}
        errorMessage={errorMessage}
        onSearch={handleSearch}
        searchResults={searchResults}
        onResultClick={handleJumpToLine}
      />
    </div>
  );
}
