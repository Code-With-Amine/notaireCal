import {
  LEGACY_ZONES,
  MODERN_ZONES,
  resolveTnbTariff,
  type LegacyZone,
  type ModernZone,
  type TnbTariffResolution,
  type TnbTariffRule,
  type TnbTariffUnresolvedReason,
} from "./rates";

/**
 * Monetary rounding policy: every displayed line item is rounded to two
 * decimals, then the annual total is the sum of those rounded lines. Aggregate
 * totals are the sum of the already-rounded annual lines, so the grand total
 * can never disagree with the breakdown by a floating-point cent.
 */
export function roundDh(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Versioned calculation ruleset.
 *
 * These values reproduce the Daribati specification supplied for this
 * implementation. They are configuration, not hardcoded arithmetic, so a
 * future reference document can introduce a new effective-dated ruleset.
 */
export interface TnbRules {
  id: string;
  defRate: number;
  defMinimum: number;
  majoration10Rate: number;
  majoration5Rate: number;
  monthlyMajorationRate: number;
  /** 1-based month from which the monthly majoration starts (March). */
  monthlyReferenceMonth: number;
}

export const TNB_RULES: TnbRules = {
  id: "daribati-tnb-2026.1",
  defRate: 0.15,
  defMinimum: 500,
  majoration10Rate: 0.1,
  majoration5Rate: 0.05,
  monthlyMajorationRate: 0.005,
  monthlyReferenceMonth: 3,
};

export type TnbIssueCode =
  | "no-years"
  | "invalid-area"
  | "invalid-zone"
  | "invalid-rate"
  | "invalid-date"
  | "invalid-year"
  | "year-in-future"
  | "missing-declaration"
  | "unresolved-tariff";

export interface TnbIssue {
  code: TnbIssueCode;
  year?: number;
}

export interface TnbYearAmounts {
  principal: number;
  def: number;
  majoration10: number;
  majoration5: number;
  monthsLate: number;
  majoration05: number;
  annualTotal: number;
}

export interface TnbYearResult {
  taxYear: number;
  surfaceArea: number;
  isDeclared: boolean | null;
  tariff: TnbTariffResolution;
  amounts: TnbYearAmounts | null;
}

export interface TnbAggregates {
  principal: number;
  def: number;
  majoration10: number;
  majoration5: number;
  majoration05: number;
  annualTotal: number;
}

export interface TnbCalculationResult {
  years: TnbYearResult[];
  aggregates: TnbAggregates | null;
  issues: TnbIssue[];
  /** True only when at least one year was computed and nothing is unresolved. */
  complete: boolean;
  calculationDate: Date | null;
  calculationYear: number | null;
  calculationMonth: number | null;
  /** Exact ruleset used for this calculation (also consumed by the PDF report). */
  rules: TnbRules;
}

export interface TnbCalculationInput {
  surfaceArea: number;
  /** Zone used by the 2021–2025 legacy zone schedule. */
  legacyZone?: LegacyZone | null;
  /** Zone used by the 2026+ schedule. */
  modernZone?: ModernZone | null;
  /** Exact rate selected from the 2026+ zone rate grid. */
  modernRate?: number | null;
  selectedYears: number[];
  declarationByYear: Record<number, boolean>;
  calculationDate: Date | string;
  tariffRules?: readonly TnbTariffRule[];
  rules?: TnbRules;
}

function normalizeDate(value: Date | string): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  const valid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return valid ? date : null;
}

function sumAmounts(rows: TnbYearAmounts[]): TnbAggregates {
  return rows.reduce<TnbAggregates>(
    (totals, row) => ({
      principal: roundDh(totals.principal + row.principal),
      def: roundDh(totals.def + row.def),
      majoration10: roundDh(totals.majoration10 + row.majoration10),
      majoration5: roundDh(totals.majoration5 + row.majoration5),
      majoration05: roundDh(totals.majoration05 + row.majoration05),
      annualTotal: roundDh(totals.annualTotal + row.annualTotal),
    }),
    {
      principal: 0,
      def: 0,
      majoration10: 0,
      majoration5: 0,
      majoration05: 0,
      annualTotal: 0,
    },
  );
}

/**
 * Calculate TNB for every selected year, independently.
 *
 * - Each year resolves its own tariff (never one shared rate).
 * - Each year reads its own declaration status.
 * - Unresolved years carry `amounts: null` and are never counted as zero in a
 *   total presented as complete.
 */
export function calculateTnb(input: TnbCalculationInput): TnbCalculationResult {
  const rules = input.rules ?? TNB_RULES;
  const tariffRules = input.tariffRules;
  const calculationDate = normalizeDate(input.calculationDate);
  const issues: TnbIssue[] = [];

  const area = input.surfaceArea;
  const areaValid = Number.isFinite(area) && area > 0;
  if (!areaValid) issues.push({ code: "invalid-area" });

  if (input.legacyZone != null && !LEGACY_ZONES.includes(input.legacyZone)) {
    issues.push({ code: "invalid-zone" });
  }

  if (input.modernZone != null && !MODERN_ZONES.includes(input.modernZone)) {
    issues.push({ code: "invalid-zone" });
  }

  if (
    input.modernRate != null &&
    (!Number.isFinite(input.modernRate) || input.modernRate <= 0)
  ) {
    issues.push({ code: "invalid-rate" });
  }

  if (!calculationDate) issues.push({ code: "invalid-date" });

  const years = Array.from(
    new Set(
      input.selectedYears.filter(
        (year): year is number =>
          typeof year === "number" && Number.isInteger(year) && year > 0,
      ),
    ),
  ).sort((a, b) => a - b);

  for (const year of input.selectedYears) {
    if (typeof year !== "number" || !Number.isInteger(year) || year <= 0) {
      issues.push({
        code: "invalid-year",
        year: typeof year === "number" && Number.isFinite(year) ? year : undefined,
      });
    }
  }

  if (input.selectedYears.length === 0) issues.push({ code: "no-years" });

  if (!areaValid || !calculationDate || issues.length > 0) {
    return {
      years: [],
      aggregates: null,
      issues,
      complete: false,
      calculationDate,
      calculationYear: calculationDate ? calculationDate.getFullYear() : null,
      calculationMonth: calculationDate ? calculationDate.getMonth() + 1 : null,
      rules,
    };
  }

  const calculationYear = calculationDate.getFullYear();
  const calculationMonth = calculationDate.getMonth() + 1;

  const results: TnbYearResult[] = years.map((taxYear) => {
    if (!Number.isInteger(taxYear) || taxYear <= 0) {
      issues.push({ code: "invalid-year", year: taxYear });
      return {
        taxYear,
        surfaceArea: area,
        isDeclared: null,
        tariff: {
          status: "unresolved",
          taxYear,
          zone: null,
          reason: "invalid-year",
        },
        amounts: null,
      };
    }

    const tariff = resolveTnbTariff({
      taxYear,
      legacyZone: input.legacyZone,
      modernZone: input.modernZone,
      modernRate: input.modernRate,
      rules: tariffRules,
    });

    if (tariff.status !== "resolved") {
      issues.push({ code: "unresolved-tariff", year: taxYear });
    }

    if (taxYear > calculationYear) {
      issues.push({ code: "year-in-future", year: taxYear });
    }

    const hasDeclaration = Object.prototype.hasOwnProperty.call(
      input.declarationByYear,
      taxYear,
    );

    if (!hasDeclaration) {
      issues.push({ code: "missing-declaration", year: taxYear });
    }

    const isDeclared = hasDeclaration
      ? Boolean(input.declarationByYear[taxYear])
      : null;

    const blocked =
      tariff.status !== "resolved" ||
      !hasDeclaration ||
      taxYear > calculationYear;

    if (blocked) {
      return {
        taxYear,
        surfaceArea: area,
        isDeclared,
        tariff,
        amounts: null,
      };
    }

    const principal = roundDh(area * tariff.rate);
    const def = isDeclared
      ? 0
      : Math.max(roundDh(principal * rules.defRate), rules.defMinimum);
    const majoration10 = roundDh(principal * rules.majoration10Rate);
    const majoration5 = roundDh(principal * rules.majoration5Rate);
    const monthsLate = Math.max(
      0,
      (calculationYear - taxYear) * 12 +
        (calculationMonth - rules.monthlyReferenceMonth),
    );
    const majoration05 = roundDh(
      principal * rules.monthlyMajorationRate * monthsLate,
    );
    const annualTotal = roundDh(
      principal + def + majoration10 + majoration5 + majoration05,
    );

    return {
      taxYear,
      surfaceArea: area,
      isDeclared,
      tariff,
      amounts: {
        principal,
        def,
        majoration10,
        majoration5,
        monthsLate,
        majoration05,
        annualTotal,
      },
    };
  });

  const resolved = results.flatMap((result) =>
    result.amounts ? [result.amounts] : [],
  );

  return {
    years: results,
    aggregates: resolved.length > 0 ? sumAmounts(resolved) : null,
    issues,
    complete: issues.length === 0,
    calculationDate,
    calculationYear,
    calculationMonth,
    rules,
  };
}

/** Human-readable reason for a tariff resolution failure. */
export function tariffUnresolvedMessageKey(
  reason: TnbTariffUnresolvedReason,
): string {
  switch (reason) {
    case "invalid-year":
      return "tnb.invalidYear";
    case "ambiguous-rule":
      return "tnb.ambiguousTariff";
    case "invalid-zone":
      return "tnb.invalidZone";
    case "invalid-rate":
      return "tnb.invalidRate";
    case "missing-zone":
      return "tnb.missingZone";
    case "missing-rate":
      return "tnb.missingRate";
    case "unconfirmed-rule":
      return "tnb.unconfirmedTariff";
    default:
      return "tnb.tariffMissing";
  }
}
