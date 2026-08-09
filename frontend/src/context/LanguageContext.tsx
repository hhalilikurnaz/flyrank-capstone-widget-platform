import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en } from "@/lib/i18n/en";
import { tr } from "@/lib/i18n/tr";

export type Language = "en" | "tr";

const DICTS: Record<Language, typeof en> = { en, tr };
const STORAGE_KEY = "wp_lang";

function detectDefault(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "tr") return stored;
  return navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en";
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof en;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectDefault);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage: setLanguageState, t: DICTS[language] }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
