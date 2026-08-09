import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

// Illustrative quotes for a portfolio/demo project: generic initials
// avatars, no real people or companies.
const initials: Record<"rivera" | "novak" | "osei", string> = {
  rivera: "AR",
  novak: "JN",
  osei: "PO",
};

export function Testimonials() {
  const { t } = useLanguage();
  const testimonials = (["rivera", "novak", "osei"] as const).map((key) => ({
    key,
    ...t.testimonials.quotes[key],
    initials: initials[key],
  }));

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
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{t.testimonials.title}</h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {item.initials}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
