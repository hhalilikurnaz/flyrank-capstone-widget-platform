import type { Submission } from "./types";

function csvRow(cells: string[]) {
  return cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
}

export function submissionsToCsv(rows: Submission[]) {
  const dataKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r.data))));
  const header = csvRow(["Widget", ...dataKeys, "Location", "Date"]);
  const lines = rows.map((r) => {
    const location = r.country ? `${r.city ?? ""} ${r.country}`.trim() : "";
    const cells = [r.widgetTitle, ...dataKeys.map((k) => r.data[k] ?? ""), location, new Date(r.createdAt).toISOString()];
    return csvRow(cells);
  });
  return [header, ...lines].join("\n");
}
