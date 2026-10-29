import {
  LEGACY_ZONE_LABEL_KEYS,
  MODERN_ZONE_LABEL_KEYS,
  isLegacyZone,
  isModernZone,
} from "./rates";
import { translations } from "./i18n";
import { TNB_EXPLANATIONS, TNB_RULES_TO_VERIFY } from "./tnb-explanations";
import type { TnbExplanationKey } from "./tnb-explanations";
import { tariffUnresolvedMessageKey } from "./tnb";
import type {
  TnbAggregates,
  TnbCalculationResult,
  TnbRules,
  TnbYearAmounts,
  TnbYearResult,
} from "./tnb";

/* -------------------------------------------------------------------------- */
/*                                 Formatting                                 */
/* -------------------------------------------------------------------------- */

/** PDF-safe number: regular spaces, comma decimal separator, no Intl spaces. */
export function pdfNumber(value: number, decimals = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  const fixed = Math.abs(safe).toFixed(decimals);
  const [integer, decimal] = fixed.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const sign = safe < 0 ? "-" : "";
  return decimal ? `${sign}${grouped},${decimal}` : `${sign}${grouped}`;
}

export function pdfDh(value: number): string {
  return `${pdfNumber(value, 2)} DH`;
}

/** Quantities (surface, rate, months) without trailing zeros. */
export function pdfQuantity(value: number, maxDecimals = 2): string {
  const safe = Number.isFinite(value) ? value : 0;
  const rounded = Number(safe.toFixed(maxDecimals));
  const decimals = Number.isInteger(rounded) ? 0 : maxDecimals;
  return pdfNumber(rounded, decimals);
}

function pdfDate(value: Date | null): string {
  if (!value) return "—";
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${value.getFullYear()}`;
}

function compactDate(value: Date): string {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${value.getFullYear()}${month}${day}`;
}

function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

const fr = translations.fr;

/* -------------------------------------------------------------------------- */
/*                                Report model                                */
/* -------------------------------------------------------------------------- */

export type TnbReportUnit = "dh" | "months" | "m2" | "rate" | "text";

export interface TnbExplanationValue {
  year: number;
  /** Numeric value for `dh`, `months`, `m2` and `rate` units. */
  value: number | null;
  /** Textual value for the `text` unit (zone or declaration status). */
  text?: string;
  /** False when the component is zero only because it does not apply. */
  applicable: boolean;
}

/** Per-year values of one explanation, shared by the app and the PDF. */
export interface TnbComponentValues {
  key: TnbExplanationKey;
  unit: TnbReportUnit;
  values: TnbExplanationValue[];
  aggregate: number | null;
}

export interface TnbReportLine {
  key: TnbExplanationKey;
  label: string;
  value: number;
  unit: Exclude<TnbReportUnit, "text">;
  /** True when the component really applies to this year. */
  applicable: boolean;
  /** Formula with the actual values substituted. */
  formula: string;
  /** Reason when the component is zero or not applicable. */
  note?: string;
}

export interface TnbReportYear {
  taxYear: number;
  statusLabel: string;
  isDeclared: boolean | null;
  zoneLabel: string;
  zoneShort: string;
  rate: number | null;
  surfaceArea: number;
  amounts: TnbYearAmounts | null;
  lines: TnbReportLine[];
  total: number | null;
  unresolvedReason: string | null;
}

export interface TnbReportExplanation {
  key: TnbExplanationKey;
  label: string;
  definition: string;
  why: string;
  when: string;
  formula: string;
  legalNote?: string;
  unit: TnbReportUnit;
  /** Value per year of the simulation; `applicable: false` means not charged. */
  values: TnbExplanationValue[];
  aggregate: number | null;
}

export interface TnbReport {
  reference: string;
  generatedAt: Date;
  calculationDateLabel: string;
  surfaceArea: number;
  selectedYearCount: number;
  resolvedYearCount: number;
  periodLabel: string;
  declaredCount: number;
  complete: boolean;
  rows: TnbReportYear[];
  aggregates: TnbAggregates;
  rules: TnbRules;
  zonesUsed: string[];
  ratesUsed: number[];
  ruleVersions: string[];
  explanations: TnbReportExplanation[];
  verificationNotes: string[];
}

export interface TnbReportInput {
  result: TnbCalculationResult;
  surfaceArea: number;
  generatedAt?: Date;
}

function zoneLabel(row: TnbYearResult): string {
  const zone = row.tariff.zone;
  if (zone === null) return fr["tnb.allZones"] ?? "Toutes";
  if (isModernZone(zone)) return fr[MODERN_ZONE_LABEL_KEYS[zone]] ?? zone;
  if (isLegacyZone(zone)) return fr[LEGACY_ZONE_LABEL_KEYS[zone]] ?? zone;
  return "—";
}

function zoneShortLabel(row: TnbYearResult): string {
  const zone = row.tariff.zone;
  if (zone === null) return "Toutes";
  return zone;
}

function statusLabel(isDeclared: boolean | null): string {
  if (isDeclared === null) return "—";
  return isDeclared ? fr["tnb.declared"] : fr["tnb.notDeclared"];
}

function buildLines(
  row: TnbYearResult,
  amounts: TnbYearAmounts,
  rules: TnbRules,
  calculationYear: number,
  calculationMonth: number,
): TnbReportLine[] {
  const principal = amounts.principal;
  const def = amounts.def;
  const declared = row.isDeclared === true;
  const monthsLate = amounts.monthsLate;

  const defRate = pdfNumber(rules.defRate * 100, 0);
  const rate10 = pdfNumber(rules.majoration10Rate * 100, 0);
  const rate5 = pdfNumber(rules.majoration5Rate * 100, 0);
  const rate05 = pdfNumber(rules.monthlyMajorationRate * 100, 1);
  const rate = row.tariff.status === "resolved" ? row.tariff.rate : 0;

  const defFormula = declared
    ? `DEF = 0,00 DH — l'année ${row.taxYear} est déclarée`
    : `DEF = max(${pdfDh(principal)} × ${defRate} % ; ${pdfDh(
        rules.defMinimum,
      )}) = ${pdfDh(def)}`;

  const monthsFormula = `Mois de retard = max(0 ; (${calculationYear} − ${
    row.taxYear
  }) × 12 + (${calculationMonth} − ${rules.monthlyReferenceMonth})) = ${monthsLate}`;

  const maj05Formula =
    monthsLate === 0
      ? `Majoration ${rate05} % = 0,00 DH — aucun mois de retard`
      : `Majoration ${rate05} % = ${pdfDh(principal)} × ${rate05} % × ${monthsLate} mois = ${pdfDh(
          amounts.majoration05,
        )}`;

  return [
    {
      key: "principal",
      label: fr["tnb.principal"],
      value: principal,
      unit: "dh",
      applicable: true,
      formula: `Principal = ${pdfQuantity(row.surfaceArea)} m² × ${pdfQuantity(
        rate,
      )} DH/m² = ${pdfDh(principal)}`,
    },
    {
      key: "def",
      label: fr["tnb.def"],
      value: def,
      unit: "dh",
      applicable: !declared,
      formula: defFormula,
      note: declared
        ? "Non applicable : la DEF ne concerne que les années non déclarées."
        : undefined,
    },
    {
      key: "maj10",
      label: fr["tnb.maj10"],
      value: amounts.majoration10,
      unit: "dh",
      applicable: true,
      formula: `Majoration ${rate10} % = ${pdfDh(principal)} × ${rate10} % = ${pdfDh(
        amounts.majoration10,
      )}`,
    },
    {
      key: "maj5",
      label: fr["tnb.maj5"],
      value: amounts.majoration5,
      unit: "dh",
      applicable: true,
      formula: `Majoration ${rate5} % = ${pdfDh(principal)} × ${rate5} % = ${pdfDh(
        amounts.majoration5,
      )}`,
    },
    {
      key: "monthsLate",
      label: fr["tnb.monthsLate"],
      value: monthsLate,
      unit: "months",
      applicable: monthsLate > 0,
      formula: monthsFormula,
      note:
        monthsLate === 0
          ? "Aucun mois de retard : la majoration mensuelle est nulle."
          : undefined,
    },
    {
      key: "maj05",
      label: fr["tnb.maj05"],
      value: amounts.majoration05,
      unit: "dh",
      applicable: monthsLate > 0,
      formula: maj05Formula,
      note:
        monthsLate === 0
          ? "Non applicable : aucune majoration mensuelle sans mois de retard."
          : undefined,
    },
  ];
}

/**
 * Values of every explained component, year by year.
 *
 * Only reads `result` — never recomputes an amount. Shared by the PDF report
 * and the in-app "Comprendre le calcul" section so both always agree.
 */
export function buildTnbComponentValues(
  result: TnbCalculationResult,
): TnbComponentValues[] {
  const amountsByYear = new Map<number, TnbYearAmounts>();
  for (const row of result.years) {
    if (row.amounts) amountsByYear.set(row.taxYear, row.amounts);
  }

  const aggregates = result.aggregates;

  const monetary = (
    key: TnbExplanationKey,
    pick: (amounts: TnbYearAmounts) => number,
    aggregate: number | null,
    applicable: (amounts: TnbYearAmounts) => boolean = () => true,
  ): TnbComponentValues => ({
    key,
    unit: key === "monthsLate" ? "months" : "dh",
    aggregate,
    values: result.years
      .filter((row) => row.amounts !== null)
      .map((row) => {
        const amounts = row.amounts as TnbYearAmounts;
        return {
          year: row.taxYear,
          value: pick(amounts),
          applicable: applicable(amounts),
        };
      }),
  });

  return [
    {
      key: "surface",
      unit: "m2",
      aggregate: null,
      values: result.years.map((row) => ({
        year: row.taxYear,
        value: row.surfaceArea,
        applicable: true,
      })),
    },
    {
      key: "tariff",
      unit: "rate",
      aggregate: null,
      values: result.years.map((row) => ({
        year: row.taxYear,
        value: row.tariff.status === "resolved" ? row.tariff.rate : null,
        applicable: row.tariff.status === "resolved",
      })),
    },
    {
      key: "zone",
      unit: "text",
      aggregate: null,
      values: result.years.map((row) => ({
        year: row.taxYear,
        value: null,
        text: zoneLabel(row),
        applicable: true,
      })),
    },
    {
      key: "declaration",
      unit: "text",
      aggregate: null,
      values: result.years.map((row) => ({
        year: row.taxYear,
        value: null,
        text: statusLabel(row.isDeclared),
        applicable: row.isDeclared !== null,
      })),
    },
    monetary("principal", (a) => a.principal, aggregates?.principal ?? 0),
    monetary(
      "def",
      (a) => a.def,
      aggregates?.def ?? 0,
      (a) => a.def > 0,
    ),
    monetary("maj10", (a) => a.majoration10, aggregates?.majoration10 ?? 0),
    monetary("maj5", (a) => a.majoration5, aggregates?.majoration5 ?? 0),
    monetary(
      "monthsLate",
      (a) => a.monthsLate,
      null,
      (a) => a.monthsLate > 0,
    ),
    monetary(
      "maj05",
      (a) => a.majoration05,
      aggregates?.majoration05 ?? 0,
      (a) => a.monthsLate > 0,
    ),
    monetary("annual", (a) => a.annualTotal, aggregates?.annualTotal ?? 0),
    monetary("grand", (a) => a.annualTotal, aggregates?.annualTotal ?? 0),
  ];
}

const UNIT_BY_KEY: Record<TnbExplanationKey, TnbReportUnit> = {
  surface: "m2",
  zone: "text",
  tariff: "rate",
  declaration: "text",
  principal: "dh",
  def: "dh",
  maj10: "dh",
  maj5: "dh",
  monthsLate: "months",
  maj05: "dh",
  annual: "dh",
  grand: "dh",
};

/**
 * Build the report model from the result already displayed by the app.
 *
 * No amount is recomputed here: every figure comes from `result`, so the PDF
 * and the on-screen table are guaranteed to agree.
 */
export function buildTnbReport(input: TnbReportInput): TnbReport | null {
  const { result, surfaceArea } = input;
  if (!result.aggregates || result.years.length === 0) return null;

  const calculationYear = result.calculationYear;
  const calculationMonth = result.calculationMonth;
  if (calculationYear === null || calculationMonth === null) return null;

  const rows: TnbReportYear[] = result.years.map((row) => {
    const amounts = row.amounts;
    return {
      taxYear: row.taxYear,
      statusLabel: statusLabel(row.isDeclared),
      isDeclared: row.isDeclared,
      zoneLabel: zoneLabel(row),
      zoneShort: zoneShortLabel(row),
      rate: row.tariff.status === "resolved" ? row.tariff.rate : null,
      surfaceArea: row.surfaceArea,
      amounts,
      lines: amounts
        ? buildLines(
            row,
            amounts,
            result.rules,
            calculationYear,
            calculationMonth,
          )
        : [],
      total: amounts ? amounts.annualTotal : null,
      unresolvedReason:
        row.tariff.status === "unresolved"
          ? interpolate(
              fr[tariffUnresolvedMessageKey(row.tariff.reason)] ?? "",
              { year: row.taxYear },
            )
          : !amounts
            ? fr["tnb.unresolvedShort"]
            : null,
    };
  });

  const resolvedRows = rows.filter((row) => row.amounts !== null);
  if (resolvedRows.length === 0) return null;

  const years = rows.map((row) => row.taxYear);
  const rules = result.rules;
  const generatedAt = input.generatedAt ?? new Date();

  const zonesUsed = Array.from(new Set(rows.map((row) => row.zoneLabel)));
  const ratesUsed = Array.from(
    new Set(
      result.years.flatMap((row) =>
        row.tariff.status === "resolved" ? [row.tariff.rate] : [],
      ),
    ),
  ).sort((a, b) => a - b);

  const ruleVersions = Array.from(
    new Set(
      result.years.flatMap((row) =>
        row.tariff.status === "resolved" ? [row.tariff.rule.version] : [],
      ),
    ),
  );

  const components = new Map(
    buildTnbComponentValues(result).map((entry) => [entry.key, entry]),
  );

  const explanations: TnbReportExplanation[] = TNB_EXPLANATIONS.map(
    (entry) => {
      const component = components.get(entry.key);
      return {
        key: entry.key,
        label: entry.label.fr,
        definition: entry.definition.fr,
        why: entry.why.fr,
        when: entry.when.fr,
        formula: entry.formula.fr,
        legalNote: entry.legalNote?.fr,
        unit: component?.unit ?? UNIT_BY_KEY[entry.key],
        values: component?.values ?? [],
        aggregate: component?.aggregate ?? null,
      };
    },
  );

  return {
    reference: `TNB-${compactDate(generatedAt)}-${years[0] ?? ""}-${
      years[years.length - 1] ?? ""
    }`,
    generatedAt,
    calculationDateLabel: pdfDate(result.calculationDate),
    surfaceArea,
    selectedYearCount: result.years.length,
    resolvedYearCount: resolvedRows.length,
    periodLabel:
      years.length > 0 ? `${years[0]} → ${years[years.length - 1]}` : "—",
    declaredCount: result.years.filter((row) => row.isDeclared === true).length,
    complete: result.complete,
    rows,
    aggregates: result.aggregates,
    rules,
    zonesUsed,
    ratesUsed,
    ruleVersions,
    explanations,
    verificationNotes: TNB_RULES_TO_VERIFY.fr,
  };
}
