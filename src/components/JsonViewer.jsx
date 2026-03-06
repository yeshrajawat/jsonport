import { useState, useRef } from "react";
import ReactJson from "@microlink/react-json-view";
import "../app.css";

export default function JsonViewer() {

  const [jsonText, setJsonText] = useState("");
  const [jsonData, setJsonData] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);

  const textareaRef = useRef(null);

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonData(parsed);
      alert("Valid JSON ✅");
    } catch {
      alert("Invalid JSON ❌");
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      alert("Invalid JSON");
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed));
    } catch {
      alert("Invalid JSON");
    }
  };

  const handleClear = () => {
    setJsonText("");
    setJsonData(null);
    setMatches([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
  };

  // SEARCH TEXT
  const handleSearch = () => {

    if (!searchTerm) return;

    const regex = new RegExp(searchTerm, "gi");
    const found = [];
    let match;

    while ((match = regex.exec(jsonText))) {
      found.push(match.index);
    }

    setMatches(found);
    setCurrentMatch(0);

    highlightMatch(found[0]);
  };

  const highlightMatch = (index) => {

    const textarea = textareaRef.current;

    if (!textarea || index === undefined) return;

    textarea.focus();
    textarea.setSelectionRange(index, index + searchTerm.length);

  };

  const nextMatch = () => {

    if (matches.length === 0) return;

    const next = (currentMatch + 1) % matches.length;
    setCurrentMatch(next);

    highlightMatch(matches[next]);
  };

  const prevMatch = () => {

    if (matches.length === 0) return;

    const prev =
      (currentMatch - 1 + matches.length) % matches.length;

    setCurrentMatch(prev);

    highlightMatch(matches[prev]);
  };

  return (

    <div className="app-container">

      <div className="header">
        ⚡ Fast JSON Explorer
      </div>

      <div className="toolbar">

        <button className="btn btn-validate" onClick={handleValidate}>
          Validate
        </button>

        <button className="btn btn-format" onClick={handleFormat}>
          Format
        </button>

        <button className="btn btn-minify" onClick={handleMinify}>
          Minify
        </button>

        <button className="btn btn-copy" onClick={handleCopy}>
          Copy
        </button>

        <button className="btn btn-clear" onClick={handleClear}>
          Clear
        </button>

        <input
          className="search-input"
          placeholder="Search in JSON..."
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
        />

        <button className="btn" onClick={handleSearch}>
          Find
        </button>

        <button className="btn" onClick={prevMatch}>
          ↑
        </button>

        <button className="btn" onClick={nextMatch}>
          ↓
        </button>

      </div>

      <div className="main">

        <div className="editor-panel">

          <textarea
            ref={textareaRef}
            className="json-editor"
            value={jsonText}
            onChange={(e)=>setJsonText(e.target.value)}
            placeholder="Paste JSON here..."
          />

        </div>

        <div className="viewer-panel">

          {jsonData && (

            <ReactJson
              src={jsonData}
              name={false}
              collapsed={1}
              displayDataTypes={false}
              theme="monokai"
            />

          )}

        </div>

      </div>

      {matches.length > 0 && (

        <div className="status-bar">
          Match {currentMatch + 1} of {matches.length}
        </div>

      )}

    </div>

  );
}