import { getToken, API_BASE } from "./api";

export interface ExportOptions {
  format: "csv" | "json";
  widgetId?: string;
  startDate?: string;
  endDate?: string;
}

export async function exportSubmissions(options: ExportOptions) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api/exports/submissions`, {
    method: "POST",
    headers,
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Export failed (${response.status})`);
  }

  // Get the filename from the Content-Disposition header
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `submissions.${options.format}`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="([^"]+)"/);
    if (match) {
      filename = match[1];
    }
  }

  const blob = await response.blob();

  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
