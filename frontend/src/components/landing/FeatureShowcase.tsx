import { motion } from "framer-motion";
import { Palette, ShieldCheck, LayoutTemplate as TemplateIcon, BarChart3 } from "lucide-react";
import { WidgetBox } from "@/components/WidgetPreview";
import { BarList } from "@/components/charts/BarList";
import { StatTile } from "@/components/charts/StatTile";
import { useLanguage } from "@/context/LanguageContext";
import type { Dictionary } from "@/lib/i18n/en";
import type { WidgetDraft } from "@/lib/types";

const demoDraft: WidgetDraft = {
  type: "SIGNUP",
  title: "Join the waitlist",
  description: "Be first to know when we launch.",
  buttonText: "Notify me",
  fields: [{ name: "email", label: "Email", type: "email", required: true }],
  displayOptions: {
    position: "inline",
    delaySeconds: 0,
    theme: "light",
    primaryColor: "#1baf7a",
    fontFamily: "rounded",
    borderRadius: 18,
    shadow: "medium",
    animation: "fade",
  },
};

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, ease: "easeOut" as const, delay },
  };
}

function BuilderDemo() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {["#4f46e5", "#e34948", "#1baf7a", "#eda100"].map((c) => (
        <div key={c} className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-1.5 w-8 rounded-full" style={{ background: c }} />
        </div>
      ))}
      <div className="col-span-2 mt-1">
        <WidgetBox draft={demoDraft} staticLayout />
      </div>
    </div>
  );
}

function AnalyticsDemo() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Submissions" value={482} />
        <StatTile label="Conversion" value="6.8%" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <BarList
          items={[
            { label: "Newsletter", value: 210 },
            { label: "Discount CTA", value: 156 },
            { label: "Waitlist", value: 116 },
          ]}
          emptyLabel=""
        />
      </div>
    </div>
  );
}

function TemplatesDemo() {
  const mini: WidgetDraft = { ...demoDraft, title: "Get early access", displayOptions: { ...demoDraft.displayOptions, primaryColor: "#4a3aa7", fontFamily: "serif" } };
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
        <WidgetBox draft={demoDraft} staticLayout />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
        <WidgetBox draft={mini} staticLayout />
      </div>
    </div>
  );
}

function ReliabilityDemo({ items }: { items: string[] }) {
  return (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <ShieldCheck className="h-3 w-3" strokeWidth={2.5} />
          </span>
          {item}
        </div>
      ))}
    </div>
  );
}

function useFeatures(t: Dictionary) {
  return [
    {
      id: "builder",
      icon: Palette,
      eyebrow: t.features.items.builder.eyebrow,
      title: t.features.items.builder.title,
      description: t.features.items.builder.description,
      demo: <BuilderDemo />,
    },
    {
      id: "templates",
      icon: TemplateIcon,
      eyebrow: t.features.items.templates.eyebrow,
      title: t.features.items.templates.title,
      description: t.features.items.templates.description,
      demo: <TemplatesDemo />,
    },
    {
      id: "analytics-preview",
      icon: BarChart3,
      eyebrow: t.features.items.analytics.eyebrow,
      title: t.features.items.analytics.title,
      description: t.features.items.analytics.description,
      demo: <AnalyticsDemo />,
    },
    {
      id: "reliability",
      icon: ShieldCheck,
      eyebrow: t.features.items.reliability.eyebrow,
      title: t.features.items.reliability.title,
      description: t.features.items.reliability.description,
      demo: (
        <ReliabilityDemo
          items={[
            t.features.reliabilityList.cors,
            t.features.reliabilityList.rateLimit,
            t.features.reliabilityList.honeypot,
            t.features.reliabilityList.geo,
          ]}
        />
      ),
    },
  ];
}

export function FeatureShowcase() {
  const { t } = useLanguage();
  const features = useFeatures(t);

  return (
    <section id="features" className="bg-white py-28 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div {...fadeUp()} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{t.features.eyebrow}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
            {t.features.title}
          </h2>
        </motion.div>

        <div className="mt-20 space-y-24">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const reversed = i % 2 === 1;
            return (
              <div
                key={feature.id}
                id={feature.id === "templates" ? "templates" : undefined}
                className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 ${reversed ? "lg:[&>*:first-child]:order-2" : ""}`}
              >
                <motion.div {...fadeUp()}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{feature.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                  <p className="mt-3 text-slate-600 dark:text-slate-400">{feature.description}</p>
                </motion.div>
                <motion.div
                  {...fadeUp(0.1)}
                  className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-900/60"
                >
                  {feature.demo}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
