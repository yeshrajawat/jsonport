import { useState, useRef } from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { diffLines } from "diff";
import "../app.css";

export default function JsonDiffViewer() {
  const [sourceJson, setSourceJson] = useState("");
  const [compareJson, setCompareJson] = useState("");
  const [isDiffing, setIsDiffing] = useState(false);
  const [changes, setChanges] = useState([]);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);

  const diffEditorRef = useRef(null);
  const navigate = useNavigate();

  /* ---------- Diff Logic ---------- */
  const computeChanges = (original, modified) => {
    const diff = diffLines(original, modified);
    const changeList = [];
    let modifiedLine = 1;

    diff.forEach((part) => {
      const lines = part.value.split("\n");
      if (lines.length > 1) lines.pop();

      if (part.added) {
        lines.forEach((_, i) => {
          changeList.push({
            line: modifiedLine + i,
            type: "added",
            content: lines[i]?.substring(0, 30) + "...",
          });
        });
        modifiedLine += lines.length;
      } else if (part.removed) {
        changeList.push({
          line: modifiedLine,
          type: "removed",
          content: lines[0]?.substring(0, 30) + "...",
        });
      } else {
        modifiedLine += lines.length;
      }
    });
    return changeList;
  };

  const handleFindDiff = () => {
    // Using raw values directly to avoid any sorting or processing
    setChanges(computeChanges(sourceJson, compareJson));
    setCurrentChangeIndex(0);
    setIsDiffing(true);
  };

  const handleEdit = () => {
    setIsDiffing(false);
  };

  const jumpToChange = (index) => {
    if (!diffEditorRef.current || !changes[index]) return;

    const change = changes[index];
    const editor = diffEditorRef.current;
    const modifiedEditor = editor.getModifiedEditor();

    modifiedEditor.revealLineInCenter(change.line);
    modifiedEditor.setPosition({ lineNumber: change.line, column: 1 });
    modifiedEditor.focus();

    setCurrentChangeIndex(index);
  };

  const goNext = () => {
    const next = (currentChangeIndex + 1) % changes.length;
    jumpToChange(next);
  };

  const goPrev = () => {
    const prev = (currentChangeIndex - 1 + changes.length) % changes.length;
    jumpToChange(prev);
  };

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-left">
          ⚓ JSONPort
          <div className="subtitle">
            Compare and analyze JSON differences
          </div>
        </div>
        <div className="header-nav">
          <button className="btn" onClick={() => navigate("/")}>
            Viewer
          </button>
          <button className="btn" onClick={() => navigate("/diff")}>
            Diff
          </button>
        </div>
      </div>

      <div className="main" style={{ position: "relative" }}>
        {!isDiffing ? (
          <div className="diff-input-container">
            <div className="editor-panel" style={{ flex: 1 }}>
              <div className="panel-header">Source JSON (Left)</div>
              <div className="panel-content" style={{ height: "calc(100% - 30px)" }}>
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  theme="vs"
                  value={sourceJson}
                  onChange={(v) => setSourceJson(v || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
            <div className="editor-panel" style={{ flex: 1 }}>
              <div className="panel-header">Compare JSON (Right)</div>
              <div className="panel-content" style={{ height: "calc(100% - 30px)" }}>
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  theme="vs"
                  value={compareJson}
                  onChange={(v) => setCompareJson(v || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", height: "calc(100vh - 120px)", width: "100%" }}>
            <div className="editor-panel" style={{ flex: 1 }}>
              <div className="panel-header">
                Literal Diff Result
              </div>
              <div className="panel-content" style={{ height: "calc(100% - 30px)" }}>
                <DiffEditor
                  height="100%"
                  language="json"
                  theme="vs"
                  original={sourceJson}
                  modified={compareJson}
                  onMount={(editor) => {
                    diffEditorRef.current = editor;
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: "on",
                    automaticLayout: true,
                    renderSideBySide: true,
                  }}
                />
              </div>
            </div>

            <div className="diff-change-list">
              <div className="panel-header" style={{ background: "#eee" }}>
                Changes ({changes.length})
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {changes.length === 0 ? (
                  <div style={{ padding: "20px", color: "#666", textAlign: "center" }}>
                    No differences found!
                  </div>
                ) : (
                  changes.map((change, index) => (
                    <div
                      key={index}
                      onClick={() => jumpToChange(index)}
                      style={{
                        padding: "10px 15px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        background: currentChangeIndex === index ? "#eef" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "13px",
                        transition: "background 0.2s"
                      }}
                    >
                      <span style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: change.type === "added" ? "#4caf50" : "#f44336",
                        marginRight: "10px",
                        flexShrink: 0
                      }} />
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <strong>Line {change.line}:</strong> {change.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <div className="diff-nav-controls">
          <div className="diff-nav-badge">
            <button className="btn" onClick={goPrev} disabled={changes.length === 0}>
              {"< Prev"}
            </button>
            <span className="diff-nav-count">
              {changes.length > 0 ? `Change ${currentChangeIndex + 1} of ${changes.length}` : "No Changes"}
            </span>
            <button className="btn" onClick={goNext} disabled={changes.length === 0}>
              {"Next >"}
            </button>
          </div>
          <button
            className="btn btn-primary diff-nav-action"
            onClick={isDiffing ? handleEdit : handleFindDiff}
          >
            {isDiffing ? "⬅ Edit JSON" : "Find Diff 🔍"}
          </button>
        </div>
      </div>
    </div>
  );
}
