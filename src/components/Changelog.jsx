import React from "react";

/**
 * High-fidelity Changelog page. Colors follow JSONPort's theme accent
 * (var(--accent)) so the page reads as part of the rest of the app.
 */
export default function Changelog() {
  const updates = [
    {
      version: "v2.1.0",
      date: "August 21, 2026",
      tag: "Latest",
      changes: {
        added: [
          "JWT Decoder — inspect header, payload and signature of JSON Web Tokens with token-status, claims and permissions overview",
          "Base64 encoder/decoder with UTF-8 / Latin-1 modes and Base64URL auto-detect",
          "URL encoder/decoder with full-URL and component modes plus a URL-components inspector",
          "String ⇄ JSON converter for round-tripping JSON-encoded strings and JSON documents",
          "Dedicated Docs page to guide new users through the toolset",
        ],
        improved: [
          "Unified 3-column IDE layout across all tools",
          "Consistent toolbar and copy/clear/sample actions across Encode/Decode tools",
          "Theme-aware color tokens (CSS variables) applied to all newly added tools",
        ],
        fixed: [
          "Color scheme inconsistencies in newly added tools now follow the global theme",
          "Changelog and Docs pages now align with the rest of the app's accent palette",
        ],
      },
    },
    {
      version: "v2.0.0",
      date: "June 9, 2026",
      changes: {
        added: [
          "Complete UI overhaul with 3-column IDE layout",
          "Integrated Monaco Editor for high-performance editing",
          "Refreshed iconography and overall UX",
        ],
        improved: [],
        fixed: [],
      },
    },
    {
      version: "v1.5.0",
      date: "May 12, 2026",
      changes: {
        added: [
          "Integrated JSON Diff tool for side-by-side comparison",
          "Added 'Sample JSON' loader for testing",
        ],
        improved: [
          "Improved formatting algorithms",
          "Better handling of special characters",
        ],
        fixed: [
          "Fixed download filename issues",
        ],
      },
    },
    {
      version: "v1.0.0",
      date: "April 1, 2026",
      changes: {
        added: [
          "Initial release of JSONPort",
          "JSON Viewer with syntax highlighting",
          "JSON Validator with line error reporting",
          "JSON Formatter (Beautify and Minify)",
          "File upload support",
        ],
        improved: [],
        fixed: [],
      },
    },
  ];

  return (
    <div className="flex h-full bg-[var(--bg-primary)]">
      <main className="flex-1 overflow-y-auto p-12 bg-[var(--bg-primary)] text-[var(--text-main)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-baseline mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">Changelog</h1>
              <p className="opacity-60">Stay up to date with the latest features, improvements and fixes.</p>
            </div>
          </div>

          <div className="space-y-16">
            {updates.map((update) => (
              <div key={update.version} className="border-b border-[var(--border-color)] pb-12 last:border-0">
                <div className="flex items-center gap-3 mb-6">
                  {update.tag && (
                    <span className="bg-[var(--accent)] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                      {update.tag}
                    </span>
                  )}
                  <h2 className="text-xl font-bold">{update.version}</h2>
                  <span className="text-sm opacity-50 ml-auto">{update.date}</span>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {/* Added Column */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-3">Added</h3>
                    <ul className="space-y-2">
                      {update.changes.added.map((change, idx) => (
                        <li key={idx} className="text-sm opacity-80 flex gap-2">
                          <span className="text-[var(--accent)]">•</span> {change}
                        </li>
                      ))}
                      {update.changes.added.length === 0 && <li className="text-xs opacity-40 italic">None</li>}
                    </ul>
                  </div>

                  {/* Improved Column */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-3">Improved</h3>
                    <ul className="space-y-2">
                      {update.changes.improved.map((change, idx) => (
                        <li key={idx} className="text-sm opacity-80 flex gap-2">
                          <span className="text-[var(--accent)] opacity-70">•</span> {change}
                        </li>
                      ))}
                      {update.changes.improved.length === 0 && <li className="text-xs opacity-40 italic">None</li>}
                    </ul>
                  </div>

                  {/* Fixed Column */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-3">Fixed</h3>
                    <ul className="space-y-2">
                      {update.changes.fixed.map((change, idx) => (
                        <li key={idx} className="text-sm opacity-80 flex gap-2">
                          <span className="opacity-50">•</span> {change}
                        </li>
                      ))}
                      {update.changes.fixed.length === 0 && <li className="text-xs opacity-40 italic">None</li>}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="px-6 py-2 rounded-full border border-[var(--border-color)] text-[var(--text-main)] text-sm font-medium opacity-80 hover:opacity-100 hover:bg-[var(--bg-secondary)] transition-colors">
              Load more history ▾
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
