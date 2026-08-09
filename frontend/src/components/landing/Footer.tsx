import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Templates", href: "#templates" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export function Footer() {
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
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Embeddable widgets and lead capture, built for the open internet.
            </p>
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

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Widget Platform. Built as a FlyRank Backend Track capstone project.
        </div>
      </div>
    </footer>
  );
}
