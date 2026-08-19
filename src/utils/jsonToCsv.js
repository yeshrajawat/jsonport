/**
 * JSON to CSV converter.
 *
 * Pure, framework-agnostic module so it can be reused by the UI layer
 * (and later by workers, Node scripts, or other tools).
 *
 * Supports:
 *  - Top-level array of flat objects (most common case)
 *  - Nested objects (auto-flattened using a configurable separator)
 *  - Arrays of primitives inside rows (joined with a configurable separator)
 *  - Arrays of objects inside rows (stringified as compact JSON)
 *  - Auto-detection of headers (union of all keys across rows)
 *  - RFC 4180 CSV escaping (quotes, embedded delimiters, newlines)
 *  - Custom delimiter, BOM prefix, and line ending
 *
 * Returns a structured result with `{ csv, rowCount, headers }` so the
 * caller can both render and surface metadata to the user.
 */

const DEFAULTS = {
  delimiter: ",",
  flattenSeparator: ".",
  arraySeparator: "; ",
  includeBom: false,
  newline: "\n",
};

/**
 * Recursively flatten a value into a primitive suitable for a CSV cell.
 * - Objects: flattened into nested keys via `flattenSeparator`
 * - Arrays of primitives: joined via `arraySeparator`
 * - Arrays of objects: serialized as compact JSON so the cell stays single-line
 * - null / undefined: empty string
 */
function flattenValue(value, key, options, out, prefix) {
  if (value === null || value === undefined) {
    out[prefix] = "";
    return;
  }

  if (Array.isArray(value)) {
    if (value.every((v) => v === null || ["string", "number", "boolean"].includes(typeof v))) {
      out[prefix] = value.map((v) => (v === null || v === undefined ? "" : String(v))).join(options.arraySeparator);
    } else {
      // Array of complex items -> serialize so the row stays flat
      try {
        out[prefix] = JSON.stringify(value);
      } catch {
        out[prefix] = String(value);
      }
    }
    return;
  }

  if (typeof value === "object") {
    for (const [childKey, childVal] of Object.entries(value)) {
      const nextKey = prefix
        ? `${prefix}${options.flattenSeparator}${childKey}`
        : childKey;
      flattenValue(childVal, childKey, options, out, nextKey);
    }
    return;
  }

  // Primitive (string, number, boolean, bigint, symbol)
  out[prefix] = typeof value === "string" ? value : String(value);
}

/**
 * Flatten a single row into a { key: primitiveValue } map.
 */
function flattenRow(row, options) {
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    flattenValue(value, key, options, out, key);
  }
  return out;
}

/**
 * Escape a single cell per RFC 4180.
 * Always quote to be safe and predictable for downstream parsers.
 */
function escapeCell(value) {
  const str = value === null || value === undefined ? "" : String(value);
  // Escape embedded quotes by doubling them (RFC 4180)
  const escaped = str.replace(/"/g, '""');
  // Quote always — simpler and unambiguous for any delimiter
  return `"${escaped}"`;
}

/**
 * Build CSV text from a header list and row maps.
 */
function buildCsv(headers, rows, options) {
  const lines = [];
  lines.push(headers.map((h) => escapeCell(h)).join(options.delimiter));

  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell(row[h] ?? "")).join(options.delimiter));
  }

  const body = lines.join(options.newline);
  return options.includeBom ? "﻿" + body : body;
}

/**
 * Resolve the data array from arbitrary JSON input.
 * Accepts:
 *  - Top-level array -> used directly
 *  - Object with a single array property (e.g. `{ users: [...] }`) -> that array
 *  - Single object -> wrapped into a one-row array
 */
function extractRows(parsed) {
  if (Array.isArray(parsed)) {
    return { rows: parsed, source: "top-level array" };
  }
  if (parsed && typeof parsed === "object") {
    const arrayProps = Object.entries(parsed).filter(([, v]) => Array.isArray(v));
    if (arrayProps.length === 1) {
      return { rows: arrayProps[0][1], source: `property "${arrayProps[0][0]}"` };
    }
    return { rows: [parsed], source: "single object (wrapped)" };
  }
  return { rows: [], source: "unsupported" };
}

/**
 * Convert parsed JSON into CSV.
 *
 * @param {unknown} parsed - already-parsed JSON value
 * @param {Partial<typeof DEFAULTS>} [options]
 * @returns {{ csv: string, rowCount: number, headers: string[], source: string }}
 */
export function jsonToCsv(parsed, options = {}) {
  const opts = { ...DEFAULTS, ...options };

  const { rows, source } = extractRows(parsed);

  if (rows.length === 0) {
    return { csv: "", rowCount: 0, headers: [], source };
  }

  // Filter to plain object rows
  const objectRows = rows.filter((r) => r && typeof r === "object" && !Array.isArray(r));
  if (objectRows.length === 0) {
    return { csv: "", rowCount: 0, headers: [], source: "no object rows found" };
  }

  const flattenedRows = objectRows.map((r) => flattenRow(r, opts));

  // Union of keys preserves first-seen order, which is more user-friendly
  const headers = [];
  const seen = new Set();
  for (const row of flattenedRows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        headers.push(key);
      }
    }
  }

  const csv = buildCsv(headers, flattenedRows, opts);
  return { csv, rowCount: flattenedRows.length, headers, source };
}

/**
 * Convenience wrapper: parse JSON text and convert in one step.
 * Throws on invalid JSON so the UI can surface the message.
 */
export function jsonTextToCsv(text, options = {}) {
  const parsed = JSON.parse(text);
  return jsonToCsv(parsed, options);
}

/**
 * Parse CSV text into a 2D array of cells, honoring RFC 4180:
 *  - Cells may be quoted with `"`; embedded quotes are escaped as `""`.
 *  - Newlines (LF or CRLF) inside quoted cells are preserved.
 *  - The delimiter is configurable.
 *
 * Returns `{ headers, rows }`. Empty trailing lines are dropped.
 */
export function parseCsv(csvText, options = {}) {
  const delimiter = options.delimiter ?? ",";
  if (!csvText) return { headers: [], rows: [] };

  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];

    if (inQuotes) {
      if (ch === '"') {
        if (csvText[i + 1] === '"') {
          cell += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch; // includes \n inside quoted cells
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      // Handle CRLF as a single record terminator
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (ch === "\r" && csvText[i + 1] === "\n") i++;
      continue;
    }
    cell += ch;
  }

  // Flush the last cell/row if the file doesn't end with a newline
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  // Drop trailing empty rows (file ended with a newline)
  while (rows.length > 0 && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") {
    rows.pop();
  }

  if (rows.length === 0) return { headers: [], rows: [] };

  const [headers, ...dataRows] = rows;
  return { headers, rows: dataRows };
}

export const __testing = { flattenRow, extractRows, escapeCell, buildCsv, flattenValue, parseCsv };
