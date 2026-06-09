import React from "react";

/**
 * High-fidelity Changelog page based on the provided design.
 */
export default function Changelog() {
  const updates = [
    {
      version: "v2.0.0",
      date: "June 9, 2026",
      tag: "Latest",
      changes: {
        added: [],
        improved: [
          "Complete UI overhaul with 3-column IDE layout",
          "Integrated Monaco Editor for high-performance editing",
          "Refreshed iconography and overall UX",
        ],
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
    <div className="flex h-full bg-white">
      <main className="flex-1 overflow-y-auto p-12 bg-white text-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-baseline mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2">Changelog</h1>
              <p className="text-gray-500">Stay up to date with the latest features, improvements and fixes.</p>
            </div>
          </div>

          <div className="space-y-16">
            {updates.map((update) => (
              <div key={update.version} className="border-b border-gray-100 pb-12 last:border-0">
                <div className="flex items-center gap-3 mb-6">
                  {update.tag && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                      {update.tag}
                    </span>
                  )}
                  <h2 className="text-xl font-bold">{update.version}</h2>
                  <span className="text-sm text-gray-400 ml-auto">{update.date}</span>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {/* Added Column */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Added</h3>
                    <ul className="space-y-2">
                      {update.changes.added.map((change, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-green-500">•</span> {change}
                        </li>
                      ))}
                      {update.changes.added.length === 0 && <li className="text-xs text-gray-300 italic">None</li>}
                    </ul>
                  </div>

                  {/* Improved Column */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Improved</h3>
                    <ul className="space-y-2">
                      {update.changes.improved.map((change, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-blue-500">•</span> {change}
                        </li>
                      ))}
                      {update.changes.improved.length === 0 && <li className="text-xs text-gray-300 italic">None</li>}
                    </ul>
                  </div>

                  {/* Fixed Column */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Fixed</h3>
                    <ul className="space-y-2">
                      {update.changes.fixed.map((change, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-red-500">•</span> {change}
                        </li>
                      ))}
                      {update.changes.fixed.length === 0 && <li className="text-xs text-gray-300 italic">None</li>}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="px-6 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              Load more history ▾
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
