import type { Widget, WidgetDraft } from "./types";

export const defaultDisplayOptions: WidgetDraft["displayOptions"] = {
  position: "bottom-right",
  delaySeconds: 0,
  theme: "light",
  primaryColor: "#4f46e5",
  fontFamily: "system",
  borderRadius: 12,
  shadow: "medium",
  animation: "fade",
};

export const blankDraft: WidgetDraft = {
  type: "SIGNUP",
  title: "",
  description: "",
  buttonText: "Submit",
  fields: [{ name: "email", label: "Email", type: "email", required: true }],
  displayOptions: defaultDisplayOptions,
};

// Widgets created before a displayOptions field existed (or via the API
// directly) may be missing any of these — always fall back so the draft
// shape the editor/preview work with is fully populated.
export function widgetToDraft(widget: Widget): WidgetDraft {
  return {
    type: widget.type,
    title: widget.title,
    description: widget.description ?? "",
    buttonText: widget.buttonText,
    fields: widget.fields,
    displayOptions: { ...defaultDisplayOptions, ...widget.displayOptions },
  };
}
