import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import "../app.css";

export default function JsonViewer() {

  const [jsonText, setJsonText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const editorRef = useRef(null);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  /* ---------- Validate JSON ---------- */

  const handleValidate = () => {

    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    try {

      JSON.parse(jsonText);

      setErrorMessage("JSON validated");

      monaco.editor.setModelMarkers(model, "json", []);

    } catch (err) {

      setErrorMessage(err.message);

      const match = err.message.match(/position\s(\d+)/i);
      if (!match) return;

      const pos = parseInt(match[1], 10);

      const position = model.getPositionAt(pos);

      const line = position.lineNumber;
      const column = position.column;

      monaco.editor.setModelMarkers(model, "json", [
        {
          startLineNumber: line,
          startColumn: column,
          endLineNumber: line,
          endColumn: column + 1,
          message: err.message,
          severity: monaco.MarkerSeverity.Error
        }
      ]);

      editor.setPosition({
        lineNumber: line,
        column: column
      });

      editor.revealLineInCenter(line);

      editor.focus();
    }
  };

  /* ---------- Format ---------- */

  const handleFormat = () => {

    try {

      const parsed = JSON.parse(jsonText);

      setJsonText(JSON.stringify(parsed, null, 2));

      setErrorMessage("");

    } catch (err) {

      setErrorMessage(err.message);

    }

  };

  /* ---------- Minify ---------- */

  const handleMinify = () => {

    try {

      const parsed = JSON.parse(jsonText);

      setJsonText(JSON.stringify(parsed));

      setErrorMessage("");

    } catch (err) {

      setErrorMessage(err.message);

    }

  };

  /* ---------- Copy ---------- */

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
  };

  /* ---------- Download JSON ---------- */

  const handleDownload = () => {

    if (!jsonText) return;

    try {

      JSON.parse(jsonText);

      const blob = new Blob([jsonText], {
        type: "application/json"
      });

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

  /* ---------- Clear ---------- */

  const handleClear = () => {
    setJsonText("");
    setResults([]);
    setErrorMessage("");
  };

  /* ---------- Upload ---------- */

  const handleUpload = (event) => {

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      setJsonText(e.target.result);
    };

    reader.readAsText(file);
  };

  /* ---------- Load Sample ---------- */

  const handleLoadSample = () => {

    const sample = {
      users: [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" }
      ]
    };

    setJsonText(JSON.stringify(sample, null, 2));
  };

  /* ---------- Search ---------- */

  const handleSearch = () => {

    if (!searchTerm) {
      setResults([]);
      return;
    }
  
    let parsed;
  
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setErrorMessage("Invalid JSON — cannot search paths");
      return;
    }
  
    const resultsList = [];
  
    function traverse(obj, path = "") {
  
      if (Array.isArray(obj)) {
  
        obj.forEach((item, index) => {
          traverse(item, `${path}[${index}]`);
        });
  
      } else if (typeof obj === "object" && obj !== null) {
  
        Object.keys(obj).forEach(key => {
  
          const newPath = path ? `${path}.${key}` : key;
  
          if (key.toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(obj[key]).toLowerCase().includes(searchTerm.toLowerCase())) {
  
            resultsList.push({
              path: newPath,
              value: obj[key]
            });
  
          }
  
          traverse(obj[key], newPath);
  
        });
  
      }
  
    }
  
    traverse(parsed);
  
    const editor = editorRef.current;
    const model = editor.getModel();
  
    const matches = model.findMatches(
      searchTerm,
      true,
      false,
      false,
      null,
      true
    );
  
    const formatted = resultsList.map((r, i) => {
  
      const match = matches[i];
  
      return {
        line: match?.range.startLineNumber || 0,
        column: match?.range.startColumn || 0,
        text: model.getLineContent(match?.range.startLineNumber || 1),
        path: r.path
      };
  
    });
  
    setResults(formatted);
  
  };
  /* ---------- Jump to result ---------- */

  const jumpToResult = (line, column) => {

    const editor = editorRef.current;

    editor.revealLineInCenter(line);

    editor.setSelection({
      startLineNumber: line,
      startColumn: column,
      endLineNumber: line,
      endColumn: column + searchTerm.length
    });

    editor.focus();
  };

  return (

    <div className="app-container">

      {/* Header */}

      <div className="header">
        ⚓ JSONPort
        <div className="subtitle">
          Explore • Validate • Transform JSON
        </div>
      </div>

      <div className="toolbar">

        <label className="btn upload-btn">
          ⬆ Upload JSON
          <input
            type="file"
            accept=".json"
            onChange={handleUpload}
            hidden
          />
        </label>

        <button className="btn" onClick={handleLoadSample}>
          Load Sample
        </button>

        <button className="btn btn-primary" onClick={handleValidate}>
          Validate
        </button>

        <button className="btn" onClick={handleFormat}>
          Format
        </button>

        <button className="btn" onClick={handleMinify}>
          Minify
        </button>

        <button className="btn" onClick={handleCopy}>
          Copy
        </button>

        <button className="btn" onClick={handleDownload}>
          Download
        </button>

        <button className="btn" onClick={handleClear}>
          Clear
        </button>

        <input
          className="search-input"
          placeholder="Search JSON..."
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
        />

        <button className="btn" onClick={handleSearch}>
          Find
        </button>

      </div>

      {errorMessage && (
        <div className={`error-bar ${errorMessage === "JSON validated" ? "success" : ""}`}>
          {errorMessage === "JSON validated" ? "✔" : "⚠"} {errorMessage}
        </div>
      )}

      <div className="main">

        <div className="editor-panel">

          <div className="panel-header">
            JSON • {(jsonText.length/1024).toFixed(2)} KB • {jsonText.split("\n").length} lines
          </div>

          <div className="panel-content">

            <Editor
              height="100%"
              defaultLanguage="json"
              theme="vs"
              value={jsonText}
              onMount={handleEditorDidMount}
              onChange={(value)=>setJsonText(value || "")}
              options={{
                minimap:{enabled:false},
                fontSize:14,
                automaticLayout:true,
                wordWrap:"on"
              }}
            />

          </div>

        </div>

        <div className="viewer-panel">

          <div className="panel-header">
            Search Results
            <span className="result-count">{results.length} matches</span>
          </div>

          <div className="results-list">

            {results.map((r,index)=>(

              <div
                key={index}
                className="result-item"
                onClick={()=>jumpToResult(r.line,r.column)}
              >

                <div className="result-meta">
                  {r.path}
                </div>

                <div
                  className="result-code"
                  dangerouslySetInnerHTML={{
                    __html:r.text.replace(
                      new RegExp(searchTerm,"gi"),
                      `<mark>${searchTerm}</mark>`
                    )
                  }}
                />

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  );
}