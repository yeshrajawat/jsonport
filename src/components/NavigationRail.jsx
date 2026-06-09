import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  CheckCircle,
  Zap,
  Settings,
  LayoutGrid,
  ArrowLeftRight,
  FileJson,
  Table,
  FileCode,
  Key,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

/**
 * NavigationRail provides the primary tool switching mechanism.
 */
export default function NavigationRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: "validate", label: "Validate", icon: CheckCircle, path: "/", comingSoon: false },
    { id: "diff", label: "Diff", icon: ArrowLeftRight, path: "/diff", comingSoon: false },
    { id: "transform", label: "Transform", icon: Zap, path: "/transform", comingSoon: true },
    { id: "schema", label: "Schema", icon: FileCode, path: "/schema", comingSoon: true },
    { id: "csv", label: "JSON to CSV", icon: Table, path: "/csv", comingSoon: true },
    { id: "xml", label: "JSON to XML", icon: FileCode, path: "/xml", comingSoon: true },
    { id: "decodeTokens", label: "Decode JWTs", icon: Key, path: "/xml", comingSoon: true },
  ];

  return (
    <aside className={`relative h-full border-r border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-main)] flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 z-50 w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] transition-all shadow-sm cursor-pointer"
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-4 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => !item.comingSoon && navigate(item.path)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${item.comingSoon
                  ? "opacity-60 cursor-not-allowed"
                  : isActive
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "hover:bg-[var(--bg-tertiary)] active:scale-95 cursor-pointer"}
              `}
              title={item.comingSoon ? "Coming Soon!" : item.label}
            >
              <item.icon size={18} className={`${isActive ? "text-white" : "text-[var(--text-muted)]"}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.comingSoon && (
                    <span className="text-[10px] bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-1.5 py-0.5 rounded font-bold opacity-80 text-[var(--text-muted)] uppercase tracking-wider">
                      Soon
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-[var(--border-color)] flex flex-col gap-2">
        {!isCollapsed && (
          <div className="mt-4 px-3 text-[10px] opacity-40 font-mono">
            v2.0.0
          </div>
        )}
      </div >
    </aside>
  );
}
