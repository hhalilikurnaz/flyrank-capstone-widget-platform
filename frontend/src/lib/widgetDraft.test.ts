import { describe, expect, it } from "vitest";
import { defaultDisplayOptions, widgetToDraft } from "./widgetDraft";
import type { Widget } from "./types";

const baseWidget: Widget = {
  id: "w1",
  tenantId: "t1",
  type: "SIGNUP",
  title: "Join us",
  description: "Get updates",
  fields: [{ name: "email", label: "Email", type: "email", required: true }],
  buttonText: "Submit",
  displayOptions: { primaryColor: "#ff0000" },
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("widgetToDraft", () => {
  it("fills in missing displayOptions with defaults", () => {
    const draft = widgetToDraft(baseWidget);
    expect(draft.displayOptions).toEqual({ ...defaultDisplayOptions, primaryColor: "#ff0000" });
  });

  it("falls back to an empty string when description is null", () => {
    const draft = widgetToDraft({ ...baseWidget, description: null });
    expect(draft.description).toBe("");
  });

  it("preserves title, type, fields, and buttonText as-is", () => {
    const draft = widgetToDraft(baseWidget);
    expect(draft.title).toBe("Join us");
    expect(draft.type).toBe("SIGNUP");
    expect(draft.buttonText).toBe("Submit");
    expect(draft.fields).toEqual(baseWidget.fields);
  });
});
