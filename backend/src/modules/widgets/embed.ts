import { env } from "@/lib/env";

export function buildEmbedSnippet(widgetId: string) {
  return `<script src="${env.PUBLIC_API_URL}/widget.js?id=${widgetId}" async></script>`;
}
