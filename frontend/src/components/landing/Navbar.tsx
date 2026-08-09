import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, tenant } = useAuth();
  const { t } = useLanguage();

  const links = [
    { href: "#features", label: t.nav.features },
    { href: "#templates", label: t.nav.templates },
    { href: "#faq", label: t.nav.faq },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A mobile menu left open behind a client-side route change would strand
  // the user on a scrolled-lock page — close it on any nav link click instead.
  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen ? "border-b border-white/10 bg-slate-950/70 backdrop-blur-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-white" onClick={closeMobile}>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="text-sm font-semibold">Widget Platform</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-slate-300 transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle className="text-slate-300" />
          <ThemeToggle className="text-slate-300 hover:bg-white/10 hover:text-white" />
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-transform hover:scale-105"
            >
              {t.nav.goToDashboard}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white">
                {t.nav.signIn}
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-transform hover:scale-105"
              >
                {t.nav.startFree}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <LanguageToggle className="text-slate-300" />
          <ThemeToggle className="text-slate-300 hover:bg-white/10 hover:text-white" />
          <button
            type="button"
            aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  className="rounded-lg px-2 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    onClick={closeMobile}
                    className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900"
                  >
                    {t.nav.goToDashboard}{tenant ? ` (${tenant.name})` : ""}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMobile}
                      className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      {t.nav.signIn}
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobile}
                      className="rounded-lg bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-900"
                    >
                      {t.nav.startFree}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
