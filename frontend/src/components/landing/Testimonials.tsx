import { motion } from "framer-motion";

// Illustrative quotes for a portfolio/demo project — generic initials
// avatars, no real people or companies.
const testimonials = [
  {
    quote:
      "We had a working signup widget on our marketing site in under ten minutes. The embed script just worked, no build step, no iframe headaches.",
    name: "A. Rivera",
    role: "Founder, indie SaaS",
    initials: "AR",
  },
  {
    quote:
      "The rate limiting and honeypot caught a bot flood on day one that would've buried our old form in junk leads.",
    name: "J. Novak",
    role: "Growth engineer",
    initials: "JN",
  },
  {
    quote:
      "Being able to see exactly how the widget looks — font, radius, shadow — before publishing saved us from three rounds of 'can you nudge it 2px' with design.",
    name: "P. Osei",
    role: "Product designer",
    initials: "PO",
  },
];

export function Testimonials() {
  return (
    <section className="bg-slate-50 py-24 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Loved by teams shipping fast</h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
