/**
 * Embeddable widget loader. Ships as a single vanilla-JS IIFE with zero
 * dependencies — this file runs on pages we don't control, so it must not
 * assume anything about the host page's stack, styles, or globals.
 */

interface WidgetField {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea";
  required: boolean;
}

interface WidgetConfig {
  id: string;
  type: "SIGNUP" | "CTA" | "POPOVER";
  title: string;
  description: string | null;
  fields: WidgetField[];
  buttonText: string;
  displayOptions: {
    position?: "bottom-right" | "bottom-left" | "center" | "inline";
    delaySeconds?: number;
    theme?: "light" | "dark";
  };
}

const CLASS_PREFIX = "wp-widget";

function getScriptEl(): HTMLScriptElement | null {
  const current = document.currentScript as HTMLScriptElement | null;
  if (current) return current;
  const scripts = document.querySelectorAll<HTMLScriptElement>("script[src*='widget']");
  return scripts.length > 0 ? scripts[scripts.length - 1]! : null;
}

function resolveConfig(scriptEl: HTMLScriptElement) {
  const src = new URL(scriptEl.src, window.location.href);
  const widgetId = src.searchParams.get("id") ?? scriptEl.dataset.widgetId ?? "";
  const apiBase = `${src.protocol}//${src.host}`;
  return { widgetId, apiBase };
}

function injectStyles(theme: "light" | "dark") {
  if (document.getElementById(`${CLASS_PREFIX}-styles`)) return;
  const bg = theme === "dark" ? "#1a1a1a" : "#ffffff";
  const fg = theme === "dark" ? "#f5f5f5" : "#1a1a1a";
  const border = theme === "dark" ? "#333" : "#e2e2e2";
  const style = document.createElement("style");
  style.id = `${CLASS_PREFIX}-styles`;
  style.textContent = `
    .${CLASS_PREFIX}-box{position:fixed;z-index:2147483000;width:320px;max-width:calc(100vw - 32px);
      background:${bg};color:${fg};border:1px solid ${border};border-radius:12px;
      box-shadow:0 10px 40px rgba(0,0,0,.18);padding:20px;font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}
    .${CLASS_PREFIX}-box.${CLASS_PREFIX}-inline{position:static;width:100%;box-sizing:border-box;}
    .${CLASS_PREFIX}-bottom-right{right:16px;bottom:16px;}
    .${CLASS_PREFIX}-bottom-left{left:16px;bottom:16px;}
    .${CLASS_PREFIX}-center{left:50%;top:50%;transform:translate(-50%,-50%);}
    .${CLASS_PREFIX}-title{font-weight:600;font-size:16px;margin:0 0 4px;}
    .${CLASS_PREFIX}-desc{margin:0 0 12px;opacity:.75;}
    .${CLASS_PREFIX}-field{margin-bottom:10px;}
    .${CLASS_PREFIX}-field label{display:block;margin-bottom:4px;font-size:12px;opacity:.8;}
    .${CLASS_PREFIX}-field input,.${CLASS_PREFIX}-field textarea{width:100%;box-sizing:border-box;padding:8px 10px;
      border:1px solid ${border};border-radius:6px;background:transparent;color:${fg};font:inherit;}
    .${CLASS_PREFIX}-btn{width:100%;padding:10px;border:none;border-radius:6px;background:#4f46e5;color:#fff;
      font-weight:600;cursor:pointer;font:inherit;}
    .${CLASS_PREFIX}-btn:disabled{opacity:.6;cursor:default;}
    .${CLASS_PREFIX}-close{position:absolute;top:8px;right:10px;background:none;border:none;font-size:16px;
      cursor:pointer;color:${fg};opacity:.6;}
    .${CLASS_PREFIX}-msg{font-size:13px;margin-top:8px;}
    .${CLASS_PREFIX}-hp{position:absolute !important;left:-9999px !important;width:1px;height:1px;overflow:hidden;}
  `;
  document.head.appendChild(style);
}

function buildForm(config: WidgetConfig, apiBase: string, box: HTMLElement) {
  const form = document.createElement("form");

  if (config.description) {
    const desc = document.createElement("p");
    desc.className = `${CLASS_PREFIX}-desc`;
    desc.textContent = config.description;
    box.appendChild(desc);
  }

  for (const field of config.fields) {
    const wrapper = document.createElement("div");
    wrapper.className = `${CLASS_PREFIX}-field`;

    const label = document.createElement("label");
    label.textContent = field.label + (field.required ? " *" : "");
    label.htmlFor = `${CLASS_PREFIX}-${field.name}`;

    const input =
      field.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
    input.id = `${CLASS_PREFIX}-${field.name}`;
    input.name = field.name;
    if (input instanceof HTMLInputElement) {
      input.type = field.type === "phone" ? "tel" : field.type;
    }
    if (field.required) input.required = true;

    wrapper.append(label, input);
    form.appendChild(wrapper);
  }

  // Honeypot: real visitors never see this field; bots that fill every
  // input trip it. Must match the "website" field name the API checks.
  const honeypotWrapper = document.createElement("div");
  honeypotWrapper.className = `${CLASS_PREFIX}-hp`;
  honeypotWrapper.setAttribute("aria-hidden", "true");
  const honeypot = document.createElement("input");
  honeypot.type = "text";
  honeypot.name = "website";
  honeypot.tabIndex = -1;
  honeypot.autocomplete = "off";
  honeypotWrapper.appendChild(honeypot);
  form.appendChild(honeypotWrapper);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = `${CLASS_PREFIX}-btn`;
  submitBtn.textContent = config.buttonText;
  form.appendChild(submitBtn);

  // Appended to the box, not the form: hiding the form on success must not
  // also hide the confirmation message the user needs to see.
  const msg = document.createElement("div");
  msg.className = `${CLASS_PREFIX}-msg`;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    msg.textContent = "";

    const formData = new FormData(form);
    const data: Record<string, string> = {};
    for (const field of config.fields) {
      data[field.name] = String(formData.get(field.name) ?? "");
    }

    try {
      const res = await fetch(`${apiBase}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetId: config.id, data, website: String(formData.get("website") ?? "") }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      form.reset();
      form.style.display = "none";
      msg.textContent = "Thanks — you're all set!";
      msg.style.color = "#22c55e";
    } catch {
      msg.textContent = "Something went wrong. Please try again.";
      msg.style.color = "#ef4444";
      submitBtn.disabled = false;
    }
  });

  box.append(form, msg);
}

function mount(config: WidgetConfig, apiBase: string, host: HTMLElement | null) {
  const theme = config.displayOptions.theme ?? "light";
  const position = config.displayOptions.position ?? "bottom-right";
  injectStyles(theme);

  const box = document.createElement("div");
  box.className =
    position === "inline" ? `${CLASS_PREFIX}-box ${CLASS_PREFIX}-inline` : `${CLASS_PREFIX}-box ${CLASS_PREFIX}-${position}`;

  if (position !== "inline") {
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = `${CLASS_PREFIX}-close`;
    closeBtn.textContent = "×";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", () => box.remove());
    box.appendChild(closeBtn);
  }

  const title = document.createElement("p");
  title.className = `${CLASS_PREFIX}-title`;
  title.textContent = config.title;
  box.appendChild(title);

  buildForm(config, apiBase, box);

  (host ?? document.body).appendChild(box);
}

async function init() {
  const scriptEl = getScriptEl();
  if (!scriptEl) return;

  const { widgetId, apiBase } = resolveConfig(scriptEl);
  if (!widgetId) return;

  try {
    const res = await fetch(`${apiBase}/api/widgets/${widgetId}/config`);
    if (!res.ok) return;
    const config = (await res.json()) as WidgetConfig;

    const delayMs = (config.displayOptions.delaySeconds ?? 0) * 1000;
    const inlineHost = document.querySelector<HTMLElement>(`[data-widget-host="${widgetId}"]`);

    const render = () => mount(config, apiBase, inlineHost);
    if (delayMs > 0) {
      setTimeout(render, delayMs);
    } else {
      render();
    }
  } catch {
    // Widget failing to load must never break the host page.
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
