import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Does this work on any website?",
    a: "Yes. The embed is a single <script> tag with zero dependencies — it works on any HTML page regardless of what it's built with, since your visitors' browser is a completely different origin than our API.",
  },
  {
    q: "What happens if someone spams the form?",
    a: "Every submission passes through rate limiting (per IP and per widget) and a honeypot check before it ever touches the database. Bots get a convincing-looking success response but nothing gets stored.",
  },
  {
    q: "What if the geolocation provider goes down?",
    a: "We try a primary provider, then a fallback, and if both fail the submission is still stored — just without location data. A dependency going down never loses a lead.",
  },
  {
    q: "Can I customize how the widget looks?",
    a: "Font, corner radius, shadow, brand color, entrance animation, and position — all from the builder, with a live preview that matches exactly what ships.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — Starter is free forever for one active widget and 500 submissions a month.",
  },
];

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-200 py-5">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <span className="text-sm font-medium text-slate-900">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-sm leading-relaxed text-slate-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-2xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center text-3xl font-semibold tracking-tight text-slate-900"
        >
          Frequently asked questions
        </motion.h2>

        <div className="mt-10">
          {faqs.map((item, i) => (
            <FaqItem
              key={item.q}
              q={item.q}
              a={item.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
