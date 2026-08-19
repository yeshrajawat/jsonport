import React, { useMemo } from "react";
import { Table2 } from "lucide-react";

/**
 * Convert a 1-based column index to spreadsheet-style letters: 1 -> A, 26 -> Z, 27 -> AA.
 */
function columnLetter(index) {
  let n = index;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/**
 * CsvGrid — spreadsheet-style view of CSV data.
 *
 * Props:
 *  - headers: string[]  — column headers
 *  - rows:    string[][] — data rows (already parsed)
 *  - rowCount / columnCount: optional metadata shown in the corner
 *
 * Visual layout:
 *   ┌────┬─────┬─────┐
 *   │    │  A  │  B  │   <- column letters (sticky top)
 *   ├────┼─────┼─────┤
 *   │  1 │ ... │ ... │   <- row numbers (sticky left)
 *   │  2 │ ... │ ... │
 *   └────┴─────┴─────┘
 *
 * Cells are monospace, vertically centered, with subtle row striping.
 * The whole grid scrolls; both the header row and row-number column stick.
 */
export default function CsvGrid({ headers = [], rows = [] }) {
  const columnLetters = useMemo(
    () => headers.map((_, i) => columnLetter(i + 1)),
    [headers],
  );

  const isEmpty = headers.length === 0;

  if (isEmpty) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-primary)]">
        <Table2 size={36} className="opacity-30 mb-4 text-[var(--text-muted)]" />
        <p className="text-sm font-semibold text-[var(--text-main)] opacity-80">
          No CSV yet
        </p>
        <p className="text-[11px] mt-1 opacity-50 max-w-[220px] leading-relaxed">
          Paste JSON on the left and hit <span className="font-semibold">Convert</span> to
          see your table here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-[var(--bg-primary)]">
      <table className="border-collapse text-xs font-mono">
        <thead>
          <tr>
            {/* Corner cell */}
            <th
              className="
                sticky top-0 left-0 z-20
                bg-[var(--bg-tertiary)] border border-[var(--border-color)]
                w-10 min-w-10 h-8 text-center text-[10px] opacity-50
              "
            >
              {/* Empty corner */}
            </th>
            {/* Column letter header strip */}
            {columnLetters.map((letter, i) => (
              <th
                key={`col-${i}`}
                className="
                  sticky top-0 z-10
                  bg-[var(--bg-tertiary)] border border-[var(--border-color)]
                  h-8 px-3 text-[10px] font-semibold tracking-wider
                  text-[var(--text-muted)] uppercase text-center
                  min-w-[60px]
                "
                title={headers[i]}
              >
                {letter}
              </th>
            ))}
          </tr>

          {/* Header row (data) */}
          <tr>
            <th
              className="
                sticky left-0 z-10
                bg-[var(--bg-secondary)] border border-[var(--border-color)]
                w-10 min-w-10 text-center text-[10px] opacity-60
                align-middle
              "
            >
              {/* Row number placeholder for the header row */}
            </th>
            {headers.map((h, i) => (
              <th
                key={`h-${i}`}
                className="
                  bg-[var(--bg-secondary)] border border-[var(--border-color)]
                  px-3 py-1.5 text-left text-[11px] font-semibold
                  text-[var(--text-main)] whitespace-nowrap
                "
                title={h}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rIdx) => (
            <tr
              key={`r-${rIdx}`}
              className={rIdx % 2 === 1 ? "bg-[var(--bg-secondary)]" : ""}
            >
              {/* Row number cell */}
              <th
                className="
                  sticky left-0 z-10
                  bg-[var(--bg-secondary)] border border-[var(--border-color)]
                  w-10 min-w-10 text-center text-[10px] opacity-50 font-normal
                  align-middle
                "
              >
                {rIdx + 1}
              </th>
              {headers.map((_, cIdx) => {
                const value = row[cIdx] ?? "";
                return (
                  <td
                    key={`c-${rIdx}-${cIdx}`}
                    className="
                      border border-[var(--border-color)]
                      px-3 py-1.5 text-left
                      text-[var(--text-main)] whitespace-pre
                      align-top
                    "
                    title={value}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
