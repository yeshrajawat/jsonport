import React from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Wrench,
  Type,
  Minimize,
  Copy,
  Download,
  Trash2
} from "lucide-react";

/**
 * ActionToolbar provides the quick actions for the active JSON tool.
 * It is a reusable UI component that handles the presentation of toolbar buttons.
 */
export default function ActionToolbar({ actions, onAction }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)] transition-colors duration-200">
      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${action.primary
                ? "bg-[var(--accent)] text-white hover:bg-opacity-90"
                : "bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)]"}
            `}
          >
            <action.icon size={14} />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            actions.viewMode === 'code'
              ? "bg-white text-black shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
          onClick={() => onAction('toggleView')}
        >
          Code
        </button>
        <button
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
            actions.viewMode === 'tree'
              ? "bg-white text-black shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
          }`}
          onClick={() => onAction('toggleView')}
        >
          Tree
        </button>
      </div>
    </div>
  );
}
