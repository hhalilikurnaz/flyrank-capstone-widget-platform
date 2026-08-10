import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Palette, Radio, ScanLine } from "lucide-react";
import { WidgetBox } from "@/components/WidgetPreview";
import { useLanguage } from "@/context/LanguageContext";
import type { WidgetDraft } from "@/lib/types";

const draft: WidgetDraft = {
  type: "CTA",
  title: "Get 10% off your first order",
  description: "Sign up and we'll email you a code right away.",
  buttonText: "Claim my discount",
  fields: [{ name: "email", label: "Email", type: "email", required: true }],
  displayOptions: {
    position: "inline",
    delaySeconds: 0,
    theme: "light",
    primaryColor: "#4f46e5",
    fontFamily: "system",
    borderRadius: 16,
    shadow: "medium",
    animation: "fade",
  },
};

const SNIPPET = '<script src="https://widget-platform.app/embed.js" data-widget-id="wdg_8f2a1c" async></script>';

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, ease: "easeOut" as const, delay },
  };
}

function StepDesign() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex gap-2">
        {["#4f46e5", "#e34948", "#1baf7a", "#eda100"].map((c) => (
          <span
            key={c}
            className="h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800"
            style={{ background: c, boxShadow: c === draft.displayOptions.primaryColor ? `0 0 0 2px ${c}` : undefined }}
          />
        ))}
      </div>
      <WidgetBox draft={draft} staticLayout />
    </div>
  );
}

function StepCopy({ label, copiedLabel }: { label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <code className="block overflow-x-auto whitespace-nowrap rounded-lg bg-slate-900 px-3 py-3 text-xs text-slate-100">
        {SNIPPET}
      </code>
      <button
        type="button"
        onClick={copy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? copiedLabel : label}
      </button>
    </div>
  );
}

function StepLive() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 flex-1 truncate rounded bg-white px-2 py-0.5 text-center text-[11px] text-slate-400 ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-700">
          yourwebsite.com
        </span>
      </div>
      <div className="relative min-h-[200px] bg-[#f6f6f4] p-4 dark:bg-slate-950/40">
        <div className="space-y-2 opacity-40">
          <div className="h-3 w-2/3 rounded bg-slate-300 dark:bg-slate-700" />
          <div className="h-3 w-1/2 rounded bg-slate-300 dark:bg-slate-700" />
          <div className="mt-4 h-16 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <WidgetBox draft={draft} staticLayout />
        </motion.div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    { icon: Palette, title: t.howItWorks.steps.design.title, description: t.howItWorks.steps.design.description, demo: <StepDesign /> },
    {
      icon: ScanLine,
      title: t.howItWorks.steps.copy.title,
      description: t.howItWorks.steps.copy.description,
      demo: <StepCopy label={t.howItWorks.copySnippet} copiedLabel={t.howItWorks.copied} />,
    },
    { icon: Radio, title: t.howItWorks.steps.live.title, description: t.howItWorks.steps.live.description, demo: <StepLive /> },
  ];

  return (
    <section className="bg-slate-50 py-28 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div {...fadeUp()} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{t.howItWorks.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            {t.howItWorks.title}
          </h2>
        </motion.div>

        <div className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-5 hidden border-t border-dashed border-slate-300 md:block dark:border-slate-700" />
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.title} {...fadeUp(i * 0.12)} className="relative">
                <div className="relative flex items-center gap-3">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                <div className="mt-5">{step.demo}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
