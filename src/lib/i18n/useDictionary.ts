"use client";

import { useState } from "react";
import { LOCALE_COOKIE, detectBrowserLocale, getDictionary, isLocale, type Locale } from "./index";

function readLocaleCookie(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isLocale(value) ? value : detectBrowserLocale();
}

export function useDictionary() {
  // Lazy initializer: resolves the locale once on mount, synchronously,
  // instead of flashing English via a post-mount effect.
  const [locale] = useState<Locale>(() => readLocaleCookie());

  return { locale, dict: getDictionary(locale) };
}
