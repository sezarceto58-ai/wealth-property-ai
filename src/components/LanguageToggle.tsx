import { useTranslation } from "react-i18next";
import { Languages, Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English",        nativeLabel: "English",   flag: "🇬🇧" },
  { code: "ar", label: "Arabic",         nativeLabel: "عربي",      flag: "🇮🇶" },
  { code: "ku", label: "Kurdish Sorani", nativeLabel: "کوردی",    flag: "🏳️" },
];

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all text-xs font-medium"
        aria-label="Change language"
      >
        <Languages className="w-3.5 h-3.5" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.nativeLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute top-full mt-1.5 z-50 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden min-w-[170px]"
          style={{ [i18n.dir() === "rtl" ? "left" : "right"]: 0 }}
        >
          {LANGUAGES.map(lang => {
            const isActive = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary/60 ${
                  isActive ? "bg-primary/8 text-primary font-semibold" : "text-foreground"
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <div className="flex-1 text-start">
                  <p className="text-xs font-semibold leading-none">{lang.nativeLabel}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{lang.label}</p>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
