import React from "react";
import { Upload, FileText, CheckCircle, Download, Copy, ShieldCheck } from "lucide-react";

/**
 * High-fidelity Docs page based on the provided design.
 */
export default function Docs() {
  return (
    <div className="flex h-full bg-white">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-white text-gray-900">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Getting Started</h1>
          <p className="text-gray-500 mb-12">Learn how to use JSONPort to view, validate, format and transform JSON data.</p>

          {/* Step 1 */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-4">1. Paste or Upload JSON</h2>
            <p className="text-gray-600 mb-6">Paste your JSON in the editor or upload a .json file from your device.</p>

            <div className="flex gap-3 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                <Upload size={14} /> Upload
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                <FileText size={14} /> Sample
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 items-center">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-xs leading-relaxed text-gray-700">
                <div>1 {`{`}</div>
                <div>2 &nbsp;&nbsp;"name": "John",</div>
                <div>3 &nbsp;&nbsp;"age": 28,</div>
                <div>4 &nbsp;&nbsp;"isDeveloper": true</div>
                <div>5 {`}`}</div>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center flex flex-col items-center justify-center bg-gray-50">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                  <Upload size={20} />
                </div>
                <p className="text-sm font-medium text-gray-600">Drag & drop your JSON file here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse files</p>
                <p className="text-[10px] text-gray-300 mt-2">Supports .json, .txt files</p>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-4">2. Validate JSON</h2>
            <p className="text-gray-600 mb-6">Click the <span className="font-semibold text-gray-900">Validate</span> button to check if your JSON is valid.</p>

            <div className="flex flex-col gap-4">
              <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium w-fit hover:bg-blue-700 transition-colors">
                <CheckCircle size={14} /> Valid JSON
              </button>
              <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-center gap-3 text-green-700 text-sm">
                <CheckCircle size={16} className="text-green-500" />
                <span>Your JSON is valid and well formatted.</span>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-4">3. Format or Minify</h2>
            <p className="text-gray-600 mb-6">Use the <span className="font-semibold text-gray-900">Format</span> or <span className="font-semibold text-gray-900">Minify</span> options to beautify or compress your JSON.</p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Format (Beautify)</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-xs leading-relaxed text-gray-700">
                  <div>{`{`}</div>
                  <div>&nbsp;&nbsp;"name": "John",</div>
                  <div>&nbsp;&nbsp;"age": 28,</div>
                  <div>&nbsp;&nbsp;"isDeveloper": true</div>
                  <div>{`}`}</div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Minify (Compress)</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-xs leading-relaxed text-gray-700">
                  <div>{`{"name":"John","age":28,"isDeveloper":true}`}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-4">4. Download or Copy</h2>
            <p className="text-gray-600 mb-6">Download the JSON file or copy it to your clipboard.</p>

            <div className="flex gap-3 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                <Download size={14} /> Download
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                <Copy size={14} /> Copy
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center gap-3 text-blue-700 text-sm">
              <ShieldCheck size={16} className="text-blue-500" />
              <span>Your data is safe. All processing happens in your browser. Your data is never uploaded to our servers.</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
