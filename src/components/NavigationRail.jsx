import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  ArrowLeftRight,
  Table,
  Key,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Lock,
  Link2,
  Code2,
} from "lucide-react";

/**
 * NavigationRail provides the primary tool switching mechanism.
 *
 * Items are grouped into categories (Explore, Convert, Decode & Encode,
 * Security, Other Tools) to mirror the reference design and to make the rail
 * scale as more tools are added.
 */
export default function NavigationRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const groups = [
    {
      id: "explore",
      label: "EXPLORE",
      items: [
        { id: "validate", label: "Explore", icon: CheckCircle, path: "/" },
        { id: "diff", label: "Diff", icon: ArrowLeftRight, path: "/diff" },
      ],
    },
    {
      id: "convert",
      label: "CONVERT",
      items: [
        { id: "csv", label: "JSON to CSV", icon: Table, path: "/csv" },
      ],
    },
    {
      id: "decode-encode",
      label: "DECODE & ENCODE",
      items: [
        { id: "base64", label: "Base64", icon: Lock, path: "/base64" },
        { id: "url", label: "URL", icon: Link2, path: "/url" },
        { id: "string-json", label: "String ⇄ JSON", icon: Code2, path: "/string-json" },
      ],
    },
    {
      id: "security",
      label: "SECURITY",
      items: [
        { id: "jwt", label: "JWT Decoder", icon: Key, path: "/jwt" },
      ],
    },
  ];

  const renderItem = (item) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
          ${isActive
            ? "bg-[var(--accent)] text-white shadow-sm"
            : "hover:bg-[var(--bg-tertiary)] active:scale-95 cursor-pointer"}
        `}
        title={item.label}
      >
        <Icon size={18} className={`${isActive ? "text-white" : "text-[var(--text-muted)]"}`} />
        {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
      </button>
    );
  };

  return (
    <aside
      className={`relative h-full border-r border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-main)] flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-12 z-50 w-6 h-6 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-tertiary)] transition-all shadow-sm cursor-pointer"
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="flex-1 overflow-y-auto py-3">
        {groups.map((group) => (
          <div key={group.id} className="mb-3">
            {!isCollapsed && (
              <div className="px-4 py-1.5 text-[10px] font-bold tracking-wider opacity-50 uppercase">
                {group.label}
              </div>
            )}
            <div className="px-2 flex flex-col gap-0.5">
              {group.items.map(renderItem)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-[var(--border-color)] flex flex-col gap-2">
        {!isCollapsed && (
          <div className="mt-2 px-3 text-[10px] opacity-40 font-mono">
            v2.1.0
          </div>
        )}
      </div>
    </aside>
  );
}
