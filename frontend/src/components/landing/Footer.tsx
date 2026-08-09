import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const columns = [
    {
      title: t.footer.product,
      links: [
        { label: t.nav.features, href: "#features" },
        { label: t.nav.templates, href: "#templates" },
        { label: t.nav.faq, href: "#faq" },
      ],
    },
    {
      title: t.footer.account,
      links: [
        { label: t.nav.signIn, href: "/login" },
        { label: t.footer.createAccount, href: "/register" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-950 py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="text-sm font-semibold">Widget Platform</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">{t.footer.tagline}</p>
          </div>

          <div className="flex gap-16">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("#") ? (
                        <a href={link.href} className="text-sm text-slate-400 hover:text-white">
                          {link.label}
                        </a>
                      ) : (
                        <Link to={link.href} className="text-sm text-slate-400 hover:text-white">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">{t.footer.copyright(new Date().getFullYear())}</div>
      </div>
    </footer>
  );
}
