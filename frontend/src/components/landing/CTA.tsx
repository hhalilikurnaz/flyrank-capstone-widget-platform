import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export function CTA() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

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
          {isAuthenticated ? t.cta.titleAuthed : t.cta.titleGuest}
        </h2>
        <p className="mt-4 text-slate-400">{isAuthenticated ? t.cta.subtitleAuthed : t.cta.subtitleGuest}</p>
        <Link
          to={isAuthenticated ? "/dashboard" : "/register"}
          className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-400"
        >
          {isAuthenticated ? t.cta.ctaAuthed : t.cta.ctaGuest}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </motion.div>
    </section>
  );
}
