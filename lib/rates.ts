/* -------------------------------------------------------------------------- */
/*                       Zones, categories and tariff rules                   */
/* -------------------------------------------------------------------------- */

export type LegacyZone = "R3" | "R5" | "R7";
export type ModernZone = "A" | "B";
export type TnbZone = LegacyZone | ModernZone;

export const LEGACY_ZONES: LegacyZone[] = ["R3", "R5", "R7"];
export const MODERN_ZONES: ModernZone[] = ["A", "B"];

/** Legacy zone rates used for 2021–2025 and by the payment forecast. */
export const LEGACY_ZONE_RATES: Record<LegacyZone, number> = {
  R3: 6,
  R5: 8,
  R7: 10,
};

export const LEGACY_ZONE_LABEL_KEYS: Record<LegacyZone, string> = {
  R3: "tnb.zoneR3",
  R5: "tnb.zoneR5",
  R7: "tnb.zoneR7",
};

export const MODERN_ZONE_LABEL_KEYS: Record<ModernZone, string> = {
  A: "tnb.zoneA",
  B: "tnb.zoneB",
};

/**
 * 2026+ rate grid.
 *
 * Each modern zone has two applicable rates. The rate itself is the input the
 * user picks in the second dropdown — there is no separate "property category"
 * concept, because the rate is what the schedule actually defines.
 *
 * Zone B is 6 or 10 DH/m² (the previously stored 16 DH/m² was wrong).
 */
export const TNB_2026_ZONE_RATES: Record<ModernZone, readonly number[]> = {
  A: [15, 20],
  B: [6, 10],
};

/** First rate of each zone, used as the initial selection in the UI. */
export const DEFAULT_MODERN_RATE: Record<ModernZone, number> = {
  A: TNB_2026_ZONE_RATES.A[0],
  B: TNB_2026_ZONE_RATES.B[0],
};

export function modernRatesForZone(zone: ModernZone): readonly number[] {
  return TNB_2026_ZONE_RATES[zone];
}

export function hasModernRate(zone: ModernZone, rate: number): boolean {
  return TNB_2026_ZONE_RATES[zone].includes(rate);
}

/**
 * Backward-compatible aliases used by the payment forecast and older callers.
 * TNB itself uses the explicit legacy/modern types above.
 */
export type Zone = LegacyZone;
export const ZONES = LEGACY_ZONES;
export const ZONE_RATES = LEGACY_ZONE_RATES;
export const ZONE_LABEL_KEYS = LEGACY_ZONE_LABEL_KEYS;

/**
 * Oldest tax year offered by the product.
 *
 * This is a product configuration floor, not a legal commencement date. The
 * pre-2018 tariff is configured down to this year; anything older resolves as
 * "no configured tariff" instead of silently reusing a rate.
 */
export const TNB_EARLIEST_YEAR = 2010;

/** Effective-dated boundaries shared by the resolver and the UI. */
export const TNB_FLAT_THROUGH_YEAR = 2020;
export const TNB_LEGACY_FROM_YEAR = 2021;
export const TNB_LEGACY_THROUGH_YEAR = 2025;
export const TNB_MODERN_FROM_YEAR = 2026;

export function getTnbTariffEra(
  taxYear: number,
): "flat" | "legacy-zone" | "modern-zone" {
  if (taxYear <= TNB_FLAT_THROUGH_YEAR) return "flat";
  if (taxYear <= TNB_LEGACY_THROUGH_YEAR) return "legacy-zone";
  return "modern-zone";
}

/* -------------------------------------------------------------------------- */
/*                               Tariff rules                                 */
/* -------------------------------------------------------------------------- */

/**
 * One effective-dated tariff cell.
 *
 * - `zone: null` means the rule does not depend on a zone.
 * - `rate: null` (or `confirmed: false`) means the rule is known but cannot be
 *   used to produce an amount until the missing configuration is confirmed.
 *
 * For the 2026+ schedule every `zone`/`rate` pair is a separate rule, so the
 * resolved rule is exactly the rate the user selected.
 */
export interface TnbTariffRule {
  id: string;
  labelKey: string;
  version: string;
  fromYear: number | null;
  toYear: number | null;
  zone: TnbZone | null;
  rate: number | null;
  confirmed: boolean;
}

function isPositiveRate(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function isModernZone(zone: TnbZone | null): zone is ModernZone {
  return zone === "A" || zone === "B";
}

export function isLegacyZone(zone: TnbZone | null): zone is LegacyZone {
  return zone === "R3" || zone === "R5" || zone === "R7";
}

/**
 * Build the complete tariff table.
 *
 * Pre-2021 bands are zone independent. 2021–2025 keeps the legacy zone rates.
 * From 2026 each modern zone contributes one rule per applicable rate.
 */
export function buildTnbTariffRules(options?: {
  modernRates?: Partial<Record<ModernZone, readonly number[]>>;
  fromYear?: number;
  legacyThroughYear?: number;
  modernFromYear?: number;
}): TnbTariffRule[] {
  const fromYear = options?.fromYear ?? TNB_EARLIEST_YEAR;
  const legacyThroughYear =
    options?.legacyThroughYear ?? TNB_LEGACY_THROUGH_YEAR;
  const modernFromYear = options?.modernFromYear ?? TNB_MODERN_FROM_YEAR;

  const rules: TnbTariffRule[] = [
    {
      id: "tnb-before-2018",
      labelKey: "tnb.rateRule1",
      version: "tnb-historical",
      fromYear,
      toYear: 2017,
      zone: null,
      rate: 2,
      confirmed: true,
    },
    {
      id: "tnb-2018-2020",
      labelKey: "tnb.rateRule2",
      version: "tnb-historical",
      fromYear: 2018,
      toYear: 2020,
      zone: null,
      rate: 4,
      confirmed: true,
    },
  ];

  for (const zone of LEGACY_ZONES) {
    rules.push({
      id: `tnb-2021-${legacyThroughYear}-${zone}`,
      labelKey: "tnb.rateRule3",
      version: "tnb-2021-2025",
      fromYear: TNB_LEGACY_FROM_YEAR,
      toYear: legacyThroughYear,
      zone,
      rate: LEGACY_ZONE_RATES[zone],
      confirmed: true,
    });
  }

  for (const zone of MODERN_ZONES) {
    const rates =
      options?.modernRates?.[zone] ?? TNB_2026_ZONE_RATES[zone];

    for (const rate of new Set(rates)) {
      const confirmed = isPositiveRate(rate);

      rules.push({
        id: `tnb-${modernFromYear}-${zone}-${rate}`,
        labelKey: "tnb.rateRule4",
        version: `tnb-${modernFromYear}`,
        fromYear: modernFromYear,
        toYear: null,
        zone,
        rate: confirmed ? rate : null,
        confirmed,
      });
    }
  }

  return rules;
}

export const TNB_TARIFF_RULES: readonly TnbTariffRule[] =
  buildTnbTariffRules();

/* -------------------------------------------------------------------------- */
/*                               Resolver                                     */
/* -------------------------------------------------------------------------- */

export type TnbTariffUnresolvedReason =
  | "invalid-year"
  | "no-rule"
  | "ambiguous-rule"
  | "invalid-zone"
  | "invalid-rate"
  | "missing-zone"
  | "missing-rate"
  | "unconfirmed-rule";

interface ResolvedTariffBase {
  taxYear: number;
  zone: TnbZone | null;
}

export type TnbTariffResolution =
  | (ResolvedTariffBase & {
      status: "resolved";
      rate: number;
      rule: TnbTariffRule;
    })
  | (ResolvedTariffBase & {
      status: "unresolved";
      reason: TnbTariffUnresolvedReason;
    });

function ruleIncludesYear(rule: TnbTariffRule, taxYear: number): boolean {
  const afterStart = rule.fromYear === null || taxYear >= rule.fromYear;
  const beforeEnd = rule.toYear === null || taxYear <= rule.toYear;
  return afterStart && beforeEnd;
}

/**
 * Resolve the tariff for one tax year, zone and — from 2026 on — the exact
 * rate selected by the user.
 *
 * Matching is done against the whole year band first, so the resolver knows
 * whether the year needs a legacy zone, a modern zone + rate, or no zone at
 * all. A missing value never falls back to another year, zone or rate.
 */
export function resolveTnbTariff(input: {
  taxYear: number;
  legacyZone?: LegacyZone | null;
  modernZone?: ModernZone | null;
  modernRate?: number | null;
  rules?: readonly TnbTariffRule[];
}): TnbTariffResolution {
  const { taxYear } = input;
  const rules = input.rules ?? TNB_TARIFF_RULES;
  const legacyZone = input.legacyZone ?? null;
  const modernZone = input.modernZone ?? null;
  const modernRate = input.modernRate ?? null;

  if (!Number.isInteger(taxYear) || taxYear <= 0) {
    return {
      status: "unresolved",
      taxYear,
      zone: null,
      reason: "invalid-year",
    };
  }

  const yearRules = rules.filter((rule) => ruleIncludesYear(rule, taxYear));

  if (yearRules.length === 0) {
    return {
      status: "unresolved",
      taxYear,
      zone: null,
      reason: "no-rule",
    };
  }

  const needsModern = yearRules.some((rule) => isModernZone(rule.zone));
  const needsLegacy = yearRules.some((rule) => isLegacyZone(rule.zone));

  const zone = needsModern ? modernZone : needsLegacy ? legacyZone : null;

  // Runtime guards: TypeScript narrows the public API, but state restored from
  // storage or a bad caller can still carry an invalid value.
  const invalidLegacy =
    legacyZone !== null && !LEGACY_ZONES.includes(legacyZone);
  const invalidModern =
    modernZone !== null && !MODERN_ZONES.includes(modernZone);
  if ((needsLegacy && invalidLegacy) || (needsModern && invalidModern)) {
    return {
      status: "unresolved",
      taxYear,
      zone,
      reason: "invalid-zone",
    };
  }

  if (needsModern && !modernZone) {
    return {
      status: "unresolved",
      taxYear,
      zone,
      reason: "missing-zone",
    };
  }

  if (needsLegacy && !legacyZone) {
    return {
      status: "unresolved",
      taxYear,
      zone,
      reason: "missing-zone",
    };
  }

  if (needsModern) {
    if (modernRate === null) {
      return {
        status: "unresolved",
        taxYear,
        zone,
        reason: "missing-rate",
      };
    }

    if (
      !Number.isFinite(modernRate) ||
      modernRate <= 0 ||
      !hasModernRate(modernZone as ModernZone, modernRate)
    ) {
      return {
        status: "unresolved",
        taxYear,
        zone,
        reason: "invalid-rate",
      };
    }
  }

  const matches = yearRules.filter((rule) => {
    if (rule.zone === null) return true;
    if (isModernZone(rule.zone)) {
      return rule.zone === modernZone && rule.rate === modernRate;
    }
    return rule.zone === legacyZone;
  });

  if (matches.length === 0) {
    return {
      status: "unresolved",
      taxYear,
      zone,
      reason: "no-rule",
    };
  }

  if (matches.length > 1) {
    return {
      status: "unresolved",
      taxYear,
      zone,
      reason: "ambiguous-rule",
    };
  }

  const rule = matches[0];

  if (!rule.confirmed || !isPositiveRate(rule.rate)) {
    return {
      status: "unresolved",
      taxYear,
      zone,
      reason: "unconfirmed-rule",
    };
  }

  return {
    status: "resolved",
    taxYear,
    zone,
    rate: rule.rate,
    rule,
  };
}

/** Convenience wrapper for legacy callers; returns `null` when unresolved. */
export function getTnbRate(
  taxYear: number,
  zone: LegacyZone,
): number | null {
  const resolution = resolveTnbTariff({ taxYear, legacyZone: zone });
  return resolution.status === "resolved" ? resolution.rate : null;
}

/**
 * Check that every year in the requested range has at least one configured
 * tariff cell. Unconfirmed cells still count as configured; they are reported
 * per year by the resolver.
 */
export function findTnbTariffGaps(
  rules: readonly TnbTariffRule[] = TNB_TARIFF_RULES,
  fromYear = TNB_EARLIEST_YEAR,
  toYear = new Date().getFullYear(),
): number[] {
  const gaps: number[] = [];
  for (let year = fromYear; year <= toYear; year += 1) {
    if (!rules.some((rule) => ruleIncludesYear(rule, year))) {
      gaps.push(year);
    }
  }
  return gaps;
}

/* -------------------------------------------------------------------------- */
/*                               Date helpers                                 */
/* -------------------------------------------------------------------------- */

export function dateFromInput(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(Number.NaN);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return valid ? date : new Date(Number.NaN);
}

export function dateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}
