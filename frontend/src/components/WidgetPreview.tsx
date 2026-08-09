import type { WidgetDraft } from "@/lib/types";

/**
 * Pixel-for-pixel-ish replica of the real widget SDK's rendered output
 * (backend/src/widget-sdk/embed.ts). Kept in sync by hand — same box width,
 * radius, shadow, padding, and field styling — so what you see here is what
 * actually ships. Purely visual: no network calls, no real submission.
 */

const positionStyle: Record<WidgetDraft["displayOptions"]["position"], React.CSSProperties> = {
  "bottom-right": { position: "absolute", right: 16, bottom: 16 },
  "bottom-left": { position: "absolute", left: 16, bottom: 16 },
  center: { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
  inline: { position: "static", width: "100%", boxSizing: "border-box" },
};

function WidgetBox({ draft }: { draft: WidgetDraft }) {
  const dark = draft.displayOptions.theme === "dark";
  const bg = dark ? "#1a1a1a" : "#ffffff";
  const fg = dark ? "#f5f5f5" : "#1a1a1a";
  const border = dark ? "#333" : "#e2e2e2";
  const color = draft.displayOptions.primaryColor || "#4f46e5";

  return (
    <div
      style={{
        ...positionStyle[draft.displayOptions.position],
        width: draft.displayOptions.position === "inline" ? "100%" : 280,
        maxWidth: "calc(100% - 32px)",
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        boxShadow: "0 10px 40px rgba(0,0,0,.18)",
        padding: 18,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 13,
        lineHeight: 1.4,
        zIndex: 1,
      }}
    >
      {draft.displayOptions.position !== "inline" && (
        <span style={{ position: "absolute", top: 8, right: 10, fontSize: 15, opacity: 0.6 }}>×</span>
      )}
      <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 4px" }}>{draft.title || "Untitled widget"}</p>
      {draft.description && <p style={{ margin: "0 0 10px", opacity: 0.75 }}>{draft.description}</p>}

      {draft.fields.map((field) => (
        <div key={field.name} style={{ marginBottom: 8 }}>
          <label style={{ display: "block", marginBottom: 3, fontSize: 11, opacity: 0.8 }}>
            {field.label}
            {field.required ? " *" : ""}
          </label>
          {field.type === "textarea" ? (
            <textarea
              readOnly
              rows={2}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "6px 8px",
                border: `1px solid ${border}`,
                borderRadius: 6,
                background: "transparent",
                color: fg,
                font: "inherit",
                resize: "none",
              }}
            />
          ) : (
            <input
              readOnly
              type={field.type === "phone" ? "tel" : field.type}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "6px 8px",
                border: `1px solid ${border}`,
                borderRadius: 6,
                background: "transparent",
                color: fg,
                font: "inherit",
              }}
            />
          )}
        </div>
      ))}

      <button
        type="button"
        style={{
          width: "100%",
          padding: 9,
          border: "none",
          borderRadius: 6,
          background: color,
          color: "#fff",
          fontWeight: 600,
          fontSize: 13,
          font: "inherit",
          cursor: "default",
        }}
      >
        {draft.buttonText || "Submit"}
      </button>
    </div>
  );
}

export function WidgetPreview({ draft }: { draft: WidgetDraft }) {
  const isInline = draft.displayOptions.position === "inline";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 flex-1 truncate rounded bg-white px-2 py-0.5 text-center text-[11px] text-slate-400 ring-1 ring-slate-200">
          yourwebsite.com
        </span>
      </div>

      <div className="relative min-h-[340px] bg-[#f6f6f4] p-4">
        <div className="space-y-2 opacity-40">
          <div className="h-3 w-2/3 rounded bg-slate-300" />
          <div className="h-3 w-1/2 rounded bg-slate-300" />
          <div className="mt-4 h-20 rounded bg-slate-200" />
          <div className="h-3 w-5/6 rounded bg-slate-300" />
          <div className="h-3 w-3/4 rounded bg-slate-300" />
        </div>

        {isInline ? (
          <div className="mt-4">
            <WidgetBox draft={draft} />
          </div>
        ) : (
          <WidgetBox draft={draft} />
        )}
      </div>
    </div>
  );
}
