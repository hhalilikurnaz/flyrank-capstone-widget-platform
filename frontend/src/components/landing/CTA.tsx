import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/30 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-2xl px-6 text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ship your first widget in the next five minutes
        </h2>
        <p className="mt-4 text-slate-400">Free forever plan. No credit card required.</p>
        <Link
          to="/register"
          className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
        >
          Start building free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </section>
  );
}
