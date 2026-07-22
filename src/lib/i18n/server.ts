import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, getDictionary, isLocale, parseAcceptLanguage, type Locale } from "./index";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  return parseAcceptLanguage(headerStore.get("accept-language"));
}

export async function getServerDictionary() {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}
