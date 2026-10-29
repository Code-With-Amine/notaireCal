import { TNB_EARLIEST_YEAR } from "./rates";

/** Current calendar year, injectable for tests. */
export function getCurrentTaxYear(now: Date = new Date()): number {
  return now.getFullYear();
}

/**
 * The trimester-based taxes (taxi, drinks, séjour) expose a rolling window of
 * recent years. It is derived from the current date so the list never freezes
 * on a hardcoded year.
 */
export function getRecentTaxYears(
  count = 4,
  now: Date = new Date(),
): number[] {
  const current = getCurrentTaxYear(now);
  return Array.from({ length: count }, (_, index) => current - count + 1 + index);
}

/**
 * Every TNB year the user may pick: from the configured floor up to the
 * current calendar year, most recent first.
 */
export function getTnbYearOptions(now: Date = new Date()): number[] {
  const current = getCurrentTaxYear(now);
  const years: number[] = [];
  for (let year = current; year >= TNB_EARLIEST_YEAR; year -= 1) {
    years.push(year);
  }
  return years;
}
