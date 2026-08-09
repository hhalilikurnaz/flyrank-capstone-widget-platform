import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const links = [
  { href: "#features", label: "Features" },
  { href: "#templates", label: "Templates" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/10 bg-slate-950/70 backdrop-blur-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-white">
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

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-transform hover:scale-105"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
