import { motion, type TargetAndTransition } from "framer-motion";
import type { WidgetDraft } from "@/lib/types";

/**
 * Pixel-for-pixel-ish replica of the real widget SDK's rendered output
 * (backend/src/widget-sdk/embed.ts). Kept in sync by hand — same box width,
 * radius, shadow, padding, field styling, font stacks, and entrance
 * animation — so what you see here is what actually ships. Purely visual:
 * no network calls, no real submission.
 */

const positionStyle: Record<WidgetDraft["displayOptions"]["position"], React.CSSProperties> = {
  "bottom-right": { position: "absolute", right: 16, bottom: 16 },
  "bottom-left": { position: "absolute", left: 16, bottom: 16 },
  center: { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
  inline: { position: "static", width: "100%", boxSizing: "border-box" },
};

// Mirrors backend/src/widget-sdk/embed.ts's FONT_STACKS / SHADOW_PRESETS.
const FONT_STACKS: Record<Required<WidgetDraft["displayOptions"]>["fontFamily"], string> = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", serif',
  rounded: '"SF Pro Rounded", ui-rounded, "Segoe UI", sans-serif',
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

const SHADOW_PRESETS: Record<Required<WidgetDraft["displayOptions"]>["shadow"], string> = {
  none: "none",
  soft: "0 4px 16px rgba(0,0,0,.10)",
  medium: "0 10px 40px rgba(0,0,0,.18)",
  strong: "0 24px 64px rgba(0,0,0,.32)",
};

const ANIMATION_VARIANTS: Record<
  Required<WidgetDraft["displayOptions"]>["animation"],
  { initial: TargetAndTransition; animate: TargetAndTransition }
> = {
  none: { initial: {}, animate: {} },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  "slide-up": { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } },
  bounce: { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 } },
};

function WidgetBox({ draft }: { draft: WidgetDraft }) {
  const opts = draft.displayOptions;
  const dark = opts.theme === "dark";
  const bg = dark ? "#1a1a1a" : "#ffffff";
  const fg = dark ? "#f5f5f5" : "#1a1a1a";
  const border = dark ? "#333" : "#e2e2e2";
  const color = opts.primaryColor || "#4f46e5";
  const radius = opts.borderRadius;
  const fieldRadius = Math.max(4, Math.round(radius * 0.5));
  const fontFamily = FONT_STACKS[opts.fontFamily];
  const variant = ANIMATION_VARIANTS[opts.animation];

  return (
    <div
      style={{
        ...positionStyle[opts.position],
        width: opts.position === "inline" ? "100%" : 280,
        maxWidth: "calc(100% - 32px)",
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        borderRadius: radius,
        boxShadow: SHADOW_PRESETS[opts.shadow],
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <motion.div
        key={`${opts.animation}-${opts.position}-${opts.theme}-${radius}-${opts.shadow}-${opts.fontFamily}`}
        initial={variant.initial}
        animate={variant.animate}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{ padding: 18, fontFamily, fontSize: 13, lineHeight: 1.4, position: "relative" }}
      >
        {opts.position !== "inline" && (
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
                  borderRadius: fieldRadius,
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
                  borderRadius: fieldRadius,
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
            borderRadius: fieldRadius,
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
      </motion.div>
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
