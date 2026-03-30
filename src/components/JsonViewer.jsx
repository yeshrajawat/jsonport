import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { jsonrepair } from "jsonrepair";
import "../app.css";
import { diffChars } from "diff";

export default function JsonViewer() {

  const [jsonText, setJsonText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [jsonIndex, setJsonIndex] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [jsonStatus, setJsonStatus] = useState("unknown");
  const [repairChanges, setRepairChanges] = useState([]);
const [panelMode, setPanelMode] = useState("search"); 
// "search" | "repairs"

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB  
  const [stats, setStats] = useState({
    objects:0,
    arrays:0,
    depth:0
  });


  useEffect(()=>{

    if(!searchTerm){
      setResults([]);
      return;
    }
  
    const term = searchTerm.toLowerCase();
  
    const matches = jsonIndex.filter(item =>
      item.pathLower.includes(term) ||
      item.valueLower.includes(term)
    );
  
    setPanelMode("search");
    setResults(matches);
  
  },[searchTerm]);
  const editorRef = useRef(null);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
  }

  /* ---------- JSON Stats ---------- */

  const computeStats = (json) => {

    let objects = 0;
    let arrays = 0;
    let maxDepth = 0;

    function traverse(obj, depth = 1){

      maxDepth = Math.max(maxDepth, depth);

      if(Array.isArray(obj)){
        arrays++;
        obj.forEach(v=>traverse(v,depth+1));
      }
      else if(typeof obj === "object" && obj !== null){
        objects++;
        Object.values(obj).forEach(v=>traverse(v,depth+1));
      }

    }

    traverse(json);

    setStats({
      objects,
      arrays,
      depth:maxDepth
    });

  };

  /* ---------- Build JSON Index ---------- */

  const buildIndex = (json) => {

    const index = [];

    function traverse(obj,path=""){

      if(Array.isArray(obj)){

        obj.forEach((item,i)=>{
          traverse(item,`${path}[${i}]`);
        });

      }
      else if(typeof obj === "object" && obj !== null){

        Object.entries(obj).forEach(([key,value])=>{

          const newPath = path ? `${path}.${key}` : key;

          index.push({
            path:newPath,
            value:value,
            pathLower:newPath.toLowerCase(),
            valueLower:String(value).toLowerCase()
          });

          traverse(value,newPath);

        });

      }

    }

    traverse(json);

    setJsonIndex(index);

  };

  /* ---------- Validate ---------- */

  const handleValidate = () => {

    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    try {

      const parsed = JSON.parse(jsonText);

      setErrorMessage("JSON validated");
      setJsonStatus("valid");

      monaco.editor.setModelMarkers(model,"json",[]);

      computeStats(parsed);
      buildIndex(parsed);

    } catch (err) {

      setErrorMessage(err.message);
      setJsonStatus("invalid");

      const match = err.message.match(/position\s(\d+)/i);
      if(!match) return;

      const pos = parseInt(match[1],10);

      const position = model.getPositionAt(pos);

      const line = position.lineNumber;
      const column = position.column;

      monaco.editor.setModelMarkers(model,"json",[{
        startLineNumber:line,
        startColumn:column,
        endLineNumber:line,
        endColumn:column+1,
        message:err.message,
        severity:monaco.MarkerSeverity.Error
      }]);

      editor.setPosition({
        lineNumber:line,
        column:column
      });

      editor.revealLineInCenter(line);
      editor.focus();

    }
  };

  /* ---------- Repair JSON ---------- */

  const goToRepair = (line, column) => {

    const editor = editorRef.current;
    if(!editor) return;
  
    editor.setPosition({
      lineNumber: line,
      column: column
    });
  
    editor.revealLineInCenter(line);
    editor.focus();
  
  };
  const handleRepair = () => {

    try{
  
      const original = jsonText;
  
      const repaired = repairJson(original);
  
      const repairs = computeRepairChanges(original, repaired);
  
      const parsed = JSON.parse(repaired);
  
      const formatted = JSON.stringify(parsed,null,2);
  
      setJsonText(formatted);
  
      setRepairChanges(repairs);
  
      setPanelMode("repairs");
  
      setJsonStatus("valid");
      setErrorMessage("✔ JSON repaired successfully");
  
      computeStats(parsed);
      buildIndex(parsed);
  
      // highlight the repaired parts
      highlightRepairs(original, repaired);
  
    }
    catch(err){
      setErrorMessage("⚠ Could not repair this JSON");
    }
  
  };

  function repairJson(input){

    let text = input;
  
    // normalize quotes
    text = text.replace(/'/g,'"');
  
    // fix broken keys
    text = text.replace(/"([^"]+):/g,'"$1":');
  
    // add quotes around keys
    text = text.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g,'$1"$2":');
  
    // missing commas
    text = text.replace(/"\s*\n\s*"/g,'",\n"');
  
    // remove trailing commas
    text = text.replace(/,\s*([}\]])/g,'$1');
  
    // final repair
    return jsonrepair(text);
  
  }

  const computeRepairChanges = (original, repaired) => {

    const editor = editorRef.current;
    if(!editor) return [];
  
    const model = editor.getModel();
    if(!model) return [];
  
    const changes = diffChars(original, repaired);
  
    let pointer = 0;
    const repairs = [];
  
    changes.forEach(part => {
  
      if(part.added){
  
        const start = model.getPositionAt(pointer);
  
        repairs.push({
          line: start.lineNumber,
          column: start.column,
          after: part.value
        });
  
      }
  
      if(!part.removed){
        pointer += part.value.length;
      }
  
    });
  
    return repairs;
  };
  const highlightRepairs = (original, repaired) => {

    const editor = editorRef.current;
    if(!editor) return;
  
    const model = editor.getModel();
    if(!model) return;
  
    const changes = diffChars(original, repaired);
  
    let pointer = 0;
  
    const decorations = [];
  
    changes.forEach(part => {
  
      if(part.added){
  
        const start = model.getPositionAt(pointer);
        const end = model.getPositionAt(pointer + part.value.length);
  
        decorations.push({
          range:new monaco.Range(
            start.lineNumber,
            start.column,
            end.lineNumber,
            end.column
          ),
          options:{
            inlineClassName:"json-repair-highlight"
          }
        });
  
      }
  
      if(!part.removed){
        pointer += part.value.length;
      }
  
    });
  
    const ids = editor.deltaDecorations([], decorations);
  
    // Remove highlight after 5 seconds
    setTimeout(()=>{
      editor.deltaDecorations(ids, []);
    },5000);
  
  };
  /* ---------- Format ---------- */

  const handleFormat = () => {

    try{

      const parsed = JSON.parse(jsonText);

      setJsonText(JSON.stringify(parsed,null,2));
      setErrorMessage("");
      setJsonStatus("valid");

      computeStats(parsed);
      buildIndex(parsed);

    }
    catch(err){
      setErrorMessage(err.message);
      setJsonStatus("invalid");
    }

  };

  /* ---------- Minify ---------- */

  const handleMinify = () => {

    try{

      const parsed = JSON.parse(jsonText);

      setJsonText(JSON.stringify(parsed));
      setErrorMessage("");
      setJsonStatus("valid");

      computeStats(parsed);
      buildIndex(parsed);

    }
    catch(err){
      setErrorMessage(err.message);
      setJsonStatus("invalid");
    }

  };

  /* ---------- Copy ---------- */

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
  };

  /* ---------- Copy JSON Path ---------- */

  const copyPath = (path) => {
    navigator.clipboard.writeText(path);
  };

  /* ---------- Download ---------- */

  const handleDownload = () => {

    try{

      JSON.parse(jsonText);

      const blob = new Blob([jsonText],{type:"application/json"});

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");

      a.href = url;
      a.download = "data.json";

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      URL.revokeObjectURL(url);

    }
    catch{
      setErrorMessage("Fix JSON before downloading");
    }

  };

  /* ---------- Clear ---------- */

  const handleClear = ()=>{
    setJsonText("");
    setResults([]);
    setJsonIndex([]);
    setErrorMessage("");
    setJsonStatus("unknown");
  };

  /* ---------- Upload ---------- */

  const handleUpload = (event)=>{

    const file = event.target.files[0];
    if(!file) return;
  
    const reader = new FileReader();
  
    reader.onload = (e)=>{
  
      const text = e.target.result;
  
      setJsonText(text);
      setJsonStatus("unknown");
      setErrorMessage("");
      setResults([]);
      setJsonIndex([]);
  
    };
  
    reader.readAsText(file);
  
    // Important: reset input so same file can be uploaded again
    event.target.value = "";
  };

  /* ---------- Load Sample ---------- */

  const handleLoadSample = ()=>{

    const sample = {
      users:[
        {id:1,name:"Alice",email:"alice@example.com"},
        {id:2,name:"Bob",email:"bob@example.com"}
      ]
    };

    const formatted = JSON.stringify(sample,null,2);

    setJsonText(formatted);
    setJsonStatus("valid");

    computeStats(sample);
    buildIndex(sample);

  };

  /* ---------- Fast Search ---------- */

  const handleSearch = ()=>{

    if(jsonStatus !== "valid"){
      setErrorMessage("Validate JSON before searching");
      return;
    }
  
    if(!searchTerm){
      setResults([]);
      return;setTimeout
    }
  
    // switch panel to search results
    setPanelMode("search");
  
    const term = searchTerm.toLowerCase();
  
    const matches = jsonIndex.filter(item =>
      item.pathLower.includes(term) ||
      item.valueLower.includes(term)
    );
  
    setPanelMode("search");
    setResults(matches);
  
  };

  return (

    <div className="app-container">

      <div className="header">
        ⚓ JSONPort
        <div className="subtitle">
          Explore • Validate • Transform JSON
        </div>
      </div>

      <div className="toolbar">

        <label className="btn upload-btn">
          ⬆ Upload JSON
          <input type="file" accept=".json" onChange={handleUpload} hidden/>
        </label>

        <button className="btn" onClick={handleLoadSample}>Load Sample</button>

        <button className="btn btn-primary" onClick={handleValidate}>Validate</button>

        {jsonStatus !== "valid" && (
          <button className="btn" onClick={handleRepair}>
            Repair JSON
          </button>
        )}

        <button className="btn" onClick={handleFormat}>Format</button>

        <button className="btn" onClick={handleMinify}>Minify</button>

        <button className="btn" onClick={handleCopy}>Copy</button>

        <button className="btn" onClick={handleDownload}>Download</button>

        <button className="btn" onClick={handleClear}>Clear</button>

        <input
          className="search-input"
          placeholder="Search JSON..."
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
        />

        <button className="btn" onClick={handleSearch}>Find</button>

      </div>

      {errorMessage && (
        <div className={`error-bar ${jsonStatus === "valid" ? "success" : ""}`}>
          {jsonStatus === "valid" ? "✔" : "⚠"} {errorMessage}
        </div>
      )}

      <div className="main">

        <div className="editor-panel">

        <div className="panel-header">
  JSON • {(jsonText.length/1024).toFixed(2)} KB • {jsonText.split("\n").length} lines
  • {stats.objects} objects • {stats.arrays} arrays • depth {stats.depth}
</div>

          <div className="panel-content">

            <Editor
              height="100%"
              defaultLanguage="json"
              theme="vs"
              value={jsonText}
              onMount={handleEditorDidMount}
              onChange={(value)=>{
                setJsonText(value || "");
                setJsonStatus("unknown");
                setErrorMessage("");
              }}
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

{panelMode === "search" ? "Search Results" : "Repair Changes"}

<span className="result-count">
  {panelMode === "search"
    ? `${results.length} matches`
    : `${repairChanges.length} repairs`
  }
</span>

</div>

<div className="results-list">

{panelMode === "search" && results.map((r,index)=>(

  <div key={index} className="result-item">

    <div className="result-meta">
      {r.path}

      <span
        className="copy-path"
        onClick={()=>copyPath(r.path)}
      >
        📋
      </span>
    </div>

    <div className="result-code">
      {JSON.stringify(r.value)}
    </div>

  </div>

))}

{panelMode === "repairs" && repairChanges.map((r,index)=>(

  <div
    key={index}
    className="result-item"
    onClick={()=>goToRepair(r.line,r.column)}
  >

    <div className="result-meta">
      Line {r.line}
    </div>

    <div className="result-code">
      Added → {r.after}
    </div>

  </div>

))}

</div>

        </div>

      </div>

    </div>

  );
}