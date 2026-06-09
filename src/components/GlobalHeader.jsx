import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

/**
 * GlobalHeader provides branding and top-level utility links.
 */
export default function GlobalHeader() {
  const { theme } = useTheme();

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)] transition-colors duration-200">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold tracking-tight">
          ⚓ JSONPort
        </h1>
        <span className="text-xs opacity-60 font-medium hidden md:block">
          The Fastest JSON Viewer, Validator & Transformer
        </span>
      </div>

      <nav className="flex items-center gap-6 text-sm font-medium opacity-80">
        <Link to="/docs" className="hover:text-[var(--accent)] transition-colors">Docs</Link>
        <Link to="/changelog" className="hover:text-[var(--accent)] transition-colors">Changelog</Link>
      </nav>
    </header>
  );
}
