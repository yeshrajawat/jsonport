import React from "react";
import * as ReactWindow from "react-window";

/**
 * VirtualJsonTree provides a performance-optimized view of large JSON structures
 * by rendering only the visible rows using react-window.
 */
export default function VirtualJsonTree({ data }) {
  // Flattening the JSON data into a list of nodes for virtualization
  const nodes = [];

  /**
   * Recursively flattens the JSON object into a linear array of nodes.
   * @param {any} obj - The object to flatten.
   * @param {string} path - The current JSON path.
   * @param {number} level - The nesting depth for indentation.
   */
  const flatten = (obj, path = "", level = 0) => {
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        const currentPath = `${path}[${i}]`;
        nodes.push({ path: currentPath, key: `[${i}]`, value: typeof item === 'object' ? '' : item, level });
        flatten(item, currentPath, level + 1);
      });
    } else if (typeof obj === "object" && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        nodes.push({ path: currentPath, key, value: typeof value === 'object' ? '' : value, level });
        flatten(value, currentPath, level + 1);
      });
    }
  };

  try {
    flatten(data);
  } catch (e) {
    console.error("Error flattening JSON for tree view:", e);
  }

  /**
   * Row component for react-window List.
   * Defined as a separate function to avoid re-creation on every render.
   */
  const Row = ({ index, style }) => {
    const node = nodes[index];
    if (!node) return null;

    return (
      <div
        style={{
          ...style,
          paddingLeft: `${node.level * 20}px`,
          fontFamily: "monospace",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--border-color)",
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-main)",
          fontSize: "13px"
        }}
      >
        <span style={{ color: "var(--accent)", fontWeight: "600" }}>{node.key}</span>
        <span style={{ margin: "0 4px" }}>:</span>
        <span style={{ opacity: 0.8 }}>{String(node.value)}</span>
      </div>
    );
  };

  if (nodes.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No data to display in tree view.</div>;
  }

  // Ensure we are using a valid component from the react-window namespace
  const ListComponent = ReactWindow.FixedSizeList || ReactWindow.default?.FixedSizeList;

  if (!ListComponent) {
    return <div className="p-4 text-sm text-red-500">Error: react-window List component not found.</div>;
  }

  return (
    <ListComponent
      height={800}
      itemCount={nodes.length}
      itemSize={28}
      width="100%"
    >
      {Row}
    </ListComponent>
  );
}
