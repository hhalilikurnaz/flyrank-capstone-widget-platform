import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-0.5 rounded-lg p-0.5 text-xs font-semibold ${className}`}>
      {(["en", "tr"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          className={`rounded-md px-2 py-1 transition-colors ${
            language === lang ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
