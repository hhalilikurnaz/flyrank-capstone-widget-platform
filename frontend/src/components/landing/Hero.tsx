import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { WidgetBox } from "@/components/WidgetPreview";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { WidgetDraft } from "@/lib/types";

const CAROUSEL_DRAFTS: WidgetDraft[] = [
  {
    type: "CTA",
    title: "Get 10% off your first order",
    description: "Sign up and we'll email you a code right away.",
    buttonText: "Claim my discount",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
    displayOptions: {
      position: "inline",
      delaySeconds: 0,
      theme: "light",
      primaryColor: "#818cf8",
      fontFamily: "system",
      borderRadius: 16,
      shadow: "strong",
      animation: "fade",
    },
  },
  {
    type: "SIGNUP",
    title: "You are invited",
    description: "Early access opens this week for the waitlist.",
    buttonText: "Request access",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
    displayOptions: {
      position: "inline",
      delaySeconds: 0,
      theme: "dark",
      primaryColor: "#eda100",
      fontFamily: "serif",
      borderRadius: 12,
      shadow: "medium",
      animation: "slide-up",
    },
  },
  {
    type: "POPOVER",
    title: "Before you go",
    description: "Here is 15% off if you complete your order today.",
    buttonText: "Get my code",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
    displayOptions: {
      position: "inline",
      delaySeconds: 0,
      theme: "light",
      primaryColor: "#1baf7a",
      fontFamily: "rounded",
      borderRadius: 20,
      shadow: "soft",
      animation: "bounce",
    },
  },
  {
    type: "SIGNUP",
    title: "Give 10 dollars, get 10 dollars",
    description: "Share your link and earn credit for every friend who joins.",
    buttonText: "Get my link",
    fields: [{ name: "email", label: "Email", type: "email", required: true }],
    displayOptions: {
      position: "inline",
      delaySeconds: 0,
      theme: "light",
      primaryColor: "#e34ca0",
      fontFamily: "rounded",
      borderRadius: 22,
      shadow: "strong",
      animation: "fade",
    },
  },
];

function CarouselCard({ draft }: { draft: WidgetDraft }) {
  return (
    <div className="h-full w-full rounded-2xl border border-white/10 bg-white/[.03] p-2 shadow-2xl backdrop-blur-sm">
      <div className="overflow-hidden rounded-xl bg-slate-50">
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          <span className="ml-2 flex-1 truncate rounded bg-slate-50 px-2 py-0.5 text-center text-[11px] text-slate-400 ring-1 ring-slate-200">
            yourstore.com
          </span>
        </div>
        <div className="relative min-h-[260px] p-5">
          <div className="space-y-2 opacity-40">
            <div className="h-3 w-2/3 rounded bg-slate-300" />
            <div className="h-3 w-1/2 rounded bg-slate-300" />
            <div className="mt-4 h-16 rounded bg-slate-200" />
          </div>
          <WidgetBox draft={draft} />
        </div>
      </div>
    </div>
  );
}

const CARD_WIDTH = 220;
const RADIUS = 240;

function WidgetCarousel() {
  const [paused, setPaused] = useState(false);
  const angleStep = 360 / CAROUSEL_DRAFTS.length;

  return (
    <div
      className="relative w-full max-w-md overflow-hidden"
      style={{ perspective: 1600, height: 340 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: CARD_WIDTH, height: 300, marginLeft: -CARD_WIDTH / 2, marginTop: -150, transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: 360 }}
          transition={{ duration: paused ? 90 : 26, repeat: Infinity, ease: "linear" }}
        >
          {CAROUSEL_DRAFTS.map((draft, i) => (
            <div
              key={draft.title}
              className="absolute inset-0"
              style={{
                transform: `rotateY(${i * angleStep}deg) translateZ(${RADIUS}px)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <CarouselCard draft={draft} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Blob({ className, y }: { className: string; y: MotionValue<number> }) {
  return <motion.div style={{ y }} className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />;
}

export function Hero() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const parallax = useMotionValue(0);
  const blob1Y = useTransform(parallax, [0, 1], [0, -40]);
  const blob2Y = useTransform(parallax, [0, 1], [0, 30]);

  return (
    <section
      className="relative overflow-hidden bg-slate-950 pb-24 pt-36"
      onMouseEnter={() => parallax.set(1)}
      onMouseLeave={() => parallax.set(0)}
    >
      <Blob className="-left-32 -top-32 h-96 w-96 bg-indigo-600/30" y={blob1Y} />
      <Blob className="-right-24 top-40 h-80 w-80 bg-fuchsia-600/20" y={blob2Y} />
      <Blob className="left-1/3 top-96 h-72 w-72 bg-cyan-500/10" y={blob1Y} />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3 w-3" /> {t.hero.badge}
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t.hero.titleStart} <span className="text-indigo-400">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-slate-400">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="group inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
            >
              {isAuthenticated ? t.hero.ctaAuthed : t.hero.ctaGuest}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#templates" className="group inline-flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white">
              {t.hero.browseTemplates}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
          {!isAuthenticated && <p className="mt-6 text-xs text-slate-500">{t.hero.noCard}</p>}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="flex justify-center"
        >
          <WidgetCarousel />
        </motion.div>
      </div>
    </section>
  );
}
