"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCALE_COOKIE, detectBrowserLocale, locales, type Locale } from "@/lib/i18n";

function readInitialLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return locales.some((l) => l.code === value) ? (value as Locale) : detectBrowserLocale();
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(() => readInitialLocale());

  function handleChange(next: string) {
    setLocale(next as Locale);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Language"
      className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-600 outline-none"
    >
      {locales.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
