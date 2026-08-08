import { env } from "@/lib/env";
import { WIDGET_SDK_VERSION } from "@/widget-sdk/version";

export function buildEmbedSnippet(widgetId: string) {
  return `<script src="${env.PUBLIC_API_URL}/widget.${WIDGET_SDK_VERSION}.js?id=${widgetId}" async></script>`;
}
