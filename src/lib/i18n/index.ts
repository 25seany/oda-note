import en, { type Dictionary } from "./dictionaries/en";
import ko from "./dictionaries/ko";
import ja from "./dictionaries/ja";
import zh from "./dictionaries/zh";
import es from "./dictionaries/es";
import vi from "./dictionaries/vi";
import id from "./dictionaries/id";
import hi from "./dictionaries/hi";
import type { PartialDictionary } from "./dictionaries/partial";

export const LOCALE_COOKIE = "lang";

export const locales = [
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "id", label: "Bahasa Indonesia" },
  { code: "hi", label: "हिन्दी" },
] as const;

export type Locale = (typeof locales)[number]["code"];

const partials: Record<Exclude<Locale, "en" | "ko">, PartialDictionary> = {
  ja,
  zh,
  es,
  vi,
  id,
  hi,
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && locales.some((l) => l.code === value);
}

export function getDictionary(locale: Locale): Dictionary {
  if (locale === "en") return en;
  if (locale === "ko") return ko;
  const partial = partials[locale];
  return {
    ...en,
    ...partial,
    nav: { ...en.nav, ...partial.nav },
    landing: { ...en.landing, ...partial.landing },
  };
}

export function parseAcceptLanguage(header: string | null): Locale {
  if (!header) return "en";
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase().slice(0, 2));
  for (const lang of preferred) {
    if (isLocale(lang)) return lang;
  }
  return "en";
}

// Mirrors parseAcceptLanguage but for the browser, so the client-rendered
// language switcher agrees with the server-rendered page on first paint.
export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of candidates) {
    const short = lang?.toLowerCase().slice(0, 2);
    if (isLocale(short)) return short;
  }
  return "en";
}
