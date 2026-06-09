import React, { useState, useEffect } from "react";
import { Search, CheckCircle2 } from "lucide-react";

/**
 * ContextPanel provides the intelligence layer for the JSON tool.
 * It displays search results, statistics, and validation status.
 */
export default function ContextPanel({
  jsonText,
  jsonStatus,
  errorMessage,
  onSearch,
  searchResults = [],
  onResultClick
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    size: "0 KB",
    objects: 0,
    arrays: 0,
    depth: 0
  });

  /**
   * Calculates real-time statistics of the JSON content.
   */
  useEffect(() => {
    if (!jsonText) {
      setStats({ size: "0 KB", objects: 0, arrays: 0, depth: 0 });
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const size = (new Blob([jsonText]).size / 1024).toFixed(2) + " KB";
      let objects = 0;
      let arrays = 0;
      let maxDepth = 0;

      const traverse = (obj, depth = 1) => {
        maxDepth = Math.max(maxDepth, depth);
        if (Array.isArray(obj)) {
          arrays++;
          obj.forEach(v => traverse(v, depth + 1));
        } else if (typeof obj === "object" && obj !== null) {
          objects++;
          Object.values(obj).forEach(v => traverse(v, depth + 1));
        }
      };

      traverse(parsed);
      setStats({ size, objects, arrays, depth: maxDepth });
    } catch (e) {
      // Stats are only computed for valid JSON
    }
  }, [jsonText]);

  /**
   * Handles search input changes and triggers the parent's search logic.
   */
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <aside className="w-80 h-full border-l border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      {/* Search Section */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider opacity-60">Search JSON</h3>
        </div >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search key or value..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
          />
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 max-h-48 overflow-y-auto border border-[var(--border-color)] rounded-md bg-[var(--bg-primary)]">
            {searchResults.map((res, idx) => (
              <div
                key={idx}
                onClick={() => onResultClick(res.line)}
                className="p-2 text-[11px] border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--bg-tertiary)] cursor-pointer transition-colors truncate"
              >
                <span className="opacity-50 mr-2">{res.line}</span>
                <span className="font-mono">{res.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics Section */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">Statistics</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <div className="text-[10px] opacity-60 mb-1">Size</div>
            <div className="text-sm font-semibold">{stats.size}</div>
          </div>
          <div className="p-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <div className="text-[10px] opacity-60 mb-1">Objects</div>
            <div className="text-sm font-semibold">{stats.objects}</div>
          </div>
          <div className="p-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <div className="text-[10px] opacity-60 mb-1">Arrays</div>
            <div className="text-sm font-semibold">{stats.arrays}</div>
          </div>
          <div className="p-2 rounded-md bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <div className="text-[10px] opacity-60 mb-1">Depth</div>
            <div className="text-sm font-semibold">{stats.depth}</div>
          </div>
        </div>
      </div>

      {/* Validation Section */}
      <div className="p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">Validation</h3>
        <div className={`p-3 rounded-md border flex items-start gap-3 transition-all ${
          jsonStatus === "valid"
            ? "bg-green-50 border-green-200 text-green-800"
            : jsonStatus === "invalid"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-slate-50 border-slate-200 text-slate-600"
        }`}>
          <CheckCircle2
            size={16}
            className={jsonStatus === "valid" ? "text-green-600" : "text-slate-400"}
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold">
              {jsonStatus === "valid" ? "Valid JSON" :
               jsonStatus === "invalid" ? "Invalid JSON" : "Awaiting validation"}
            </span>
            <span className="text-[11px] opacity-80 leading-relaxed">
              {jsonStatus === "valid"
                ? "JSON is valid and well formatted."
                : errorMessage || "Awaiting validation..."}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
