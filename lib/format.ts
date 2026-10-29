import type { Language } from "./i18n";
import { monthNames } from "./i18n";

export function formatNumber(
  value: number,
  language: Language,
  maximumFractionDigits = 2,
): string {
  return new Intl.NumberFormat(language === "ar" ? "ar-MA" : "fr-MA", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatMoney(
  value: number,
  language: Language,
  maximumFractionDigits = 2,
): string {
  return `${formatNumber(value, language, maximumFractionDigits)} DH`;
}

export function formatDate(value: Date | string, language: Language): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(language === "ar" ? "ar-MA" : "fr-MA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatMonthYear(
  month: number,
  year: number,
  language: Language,
): string {
  return `${monthNames[language][month]} ${year}`;
}

export function formatPercent(value: number, language: Language): string {
  return `${formatNumber(value, language, 1)} %`;
}

export function parseNumber(value: string): number {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const number = Number.parseFloat(normalized);
  return Number.isFinite(number) ? number : 0;
}

export function todayInputValue(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
}
