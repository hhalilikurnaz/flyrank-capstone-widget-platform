import { prisma } from "@/lib/prisma";
import type { ExportSubmissionsInput } from "./schema";

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === undefined) {
      result[newKey] = "";
    } else if (typeof value === "object") {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = String(value);
    }
  }

  return result;
}

export async function exportSubmissionsAsJSON(tenantId: string, input: ExportSubmissionsInput) {
  const where: Record<string, unknown> = { tenantId };

  if (input.widgetId) {
    where.widgetId = input.widgetId;
  }

  if (input.startDate || input.endDate) {
    where.createdAt = {};
    if (input.startDate) {
      (where.createdAt as Record<string, unknown>).gte = new Date(input.startDate);
    }
    if (input.endDate) {
      (where.createdAt as Record<string, unknown>).lte = new Date(input.endDate);
    }
  }

  const submissions = await prisma.submission.findMany({
    where,
    include: { widget: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return submissions.map((s) => ({
    id: s.id,
    widgetId: s.widgetId,
    widgetTitle: s.widget.title,
    data: s.data,
    ip: s.ip,
    country: s.country,
    city: s.city,
    isSpam: s.isSpam,
    createdAt: s.createdAt.toISOString(),
  }));
}

export async function exportSubmissionsAsCSV(tenantId: string, input: ExportSubmissionsInput): Promise<string> {
  const submissions = await exportSubmissionsAsJSON(tenantId, input);

  if (submissions.length === 0) {
    return "No submissions to export\n";
  }

  // Collect all unique field names from the data objects
  const fieldNames = new Set<string>();
  fieldNames.add("id");
  fieldNames.add("widgetId");
  fieldNames.add("widgetTitle");
  fieldNames.add("ip");
  fieldNames.add("country");
  fieldNames.add("city");
  fieldNames.add("isSpam");
  fieldNames.add("createdAt");

  for (const sub of submissions) {
    const flat = flattenObject(sub.data as Record<string, unknown>);
    Object.keys(flat).forEach((key) => fieldNames.add(`data.${key}`));
  }

  const headers = Array.from(fieldNames);
  const rows = submissions.map((sub) => {
    const flat = flattenObject(sub.data as Record<string, unknown>);
    return headers.map((header) => {
      let value: unknown;

      if (header.startsWith("data.")) {
        const key = header.slice(5);
        value = flat[key] ?? "";
      } else if (header === "data") {
        value = "";
      } else {
        value = (sub as Record<string, unknown>)[header] ?? "";
      }

      // Escape CSV values
      const str = String(value);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export async function getExportFilename(format: "csv" | "json"): Promise<string> {
  const timestamp = new Date().toISOString().split("T")[0];
  return `submissions-${timestamp}.${format}`;
}
