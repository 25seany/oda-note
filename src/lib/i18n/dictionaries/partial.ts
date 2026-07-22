import type { Dictionary } from "./en";

// Locales that only have nav + landing translated so far.
// Everything else falls back to English until the in-app flow is localized.
export type PartialDictionary = Pick<Dictionary, "nav" | "landing">;
