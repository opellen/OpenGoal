import { messages, type Locale, type MessageKey } from "./messages.js";

function detectLocale(): Locale {
  const raw =
    process.env.LC_ALL ||
    process.env.LC_MESSAGES ||
    process.env.LANG ||
    "";
  if (raw.startsWith("ko")) return "ko";
  return "en";
}

let current: Locale = detectLocale();

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale): void {
  current = locale;
}

export function t(key: MessageKey): string {
  return messages[current][key];
}

export type { Locale, MessageKey };
