import { describe, expect, it } from "vitest";
import { submissionsToCsv } from "./csv";
import type { Submission } from "./types";

const rows: Submission[] = [
  {
    id: "s1",
    widgetId: "w1",
    widgetTitle: "Newsletter",
    data: { email: "a@example.com", name: "Ada" },
    country: "United States",
    city: "Berkeley",
    createdAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "s2",
    widgetId: "w1",
    widgetTitle: "Newsletter",
    data: { email: "b@example.com" },
    country: null,
    city: null,
    createdAt: "2026-01-02T10:00:00.000Z",
  },
];

describe("submissionsToCsv", () => {
  it("builds a header from the union of data keys across rows", () => {
    const csv = submissionsToCsv(rows);
    const [header] = csv.split("\n");
    expect(header).toBe('"Widget","email","name","Location","Date"');
  });

  it("fills missing per-row data keys with an empty cell", () => {
    const csv = submissionsToCsv(rows);
    const lines = csv.split("\n");
    expect(lines[2]).toContain('"b@example.com","",""');
  });

  it("escapes embedded quotes in cell values", () => {
    const csv = submissionsToCsv([{ ...rows[0]!, data: { email: 'a"b@example.com' } }]);
    expect(csv).toContain('"a""b@example.com"');
  });

  it("returns just the header row for an empty input", () => {
    expect(submissionsToCsv([])).toBe('"Widget","Location","Date"');
  });
});
