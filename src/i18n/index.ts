import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./en.json";
import ar from "./ar.json";
import ku from "./ku.json";

// RTL languages
const RTL_LANGS = ["ar", "ku"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      ku: { translation: ku },
    },
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

function applyDirection(lng: string) {
  const isRTL = RTL_LANGS.includes(lng);
  document.documentElement.dir  = isRTL ? "rtl" : "ltr";
  document.documentElement.lang = lng;
  // Swap data-lang for font targeting
  document.documentElement.setAttribute("data-lang", lng);
}

// React on every language change
i18n.on("languageChanged", applyDirection);

// Apply on first load
applyDirection(i18n.language ?? "en");

export default i18n;
export { RTL_LANGS };
