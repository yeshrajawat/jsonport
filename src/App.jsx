import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalHeader from "./components/GlobalHeader";
import NavigationRail from "./components/NavigationRail";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import JsonViewer from "./components/JsonViewer";
import JsonDiffViewer from "./components/JsonDiffViewer";
import JsonToCsvViewer from "./components/JsonToCsvViewer";
import JwtDecoder from "./components/JwtDecoder";
import Base64Viewer from "./components/Base64Viewer";
import UrlViewer from "./components/UrlViewer";
import StringJsonViewer from "./components/StringJsonViewer";
import Docs from "./components/Docs";
import Changelog from "./components/Changelog";

/**
 * Main App shell implementing the 3-column IDE layout.
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex flex-col h-screen w-full bg-[var(--bg-primary)] text-[var(--text-main)] transition-colors duration-200">
          {/* Top Header */}
          <GlobalHeader />

          <div className="flex flex-1 overflow-hidden">
            {/* Left Rail */}
            <NavigationRail />

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden bg-[var(--bg-primary)]">
              <Routes>
                <Route path="/" element={<JsonViewer />} />
                <Route path="/diff" element={<JsonDiffViewer />} />
                <Route path="/csv" element={<JsonToCsvViewer />} />
                <Route path="/base64" element={<Base64Viewer />} />
                <Route path="/url" element={<UrlViewer />} />
                <Route path="/string-json" element={<StringJsonViewer />} />
                <Route path="/jwt" element={<JwtDecoder />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/changelog" element={<Changelog />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
