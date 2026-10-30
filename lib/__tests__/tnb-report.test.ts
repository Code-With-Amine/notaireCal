import { describe, expect, it } from "vitest";
import { calculateTnb, type TnbCalculationInput } from "../tnb";
import {
  buildTnbComponentValues,
  buildTnbReport,
  pdfDh,
  pdfNumber,
} from "../tnb-report";
import { TNB_EXPLANATIONS } from "../tnb-explanations";
import { createTnbReportPdf } from "../tnb-pdf";

const CALC_DATE = "2026-10-15";

function declarations(
  years: number[],
  declared: Record<number, boolean> = {},
): Record<number, boolean> {
  return years.reduce<Record<number, boolean>>((status, year) => {
    status[year] = declared[year] ?? false;
    return status;
  }, {});
}

function calculate(overrides: Partial<TnbCalculationInput> = {}) {
  return calculateTnb({
    surfaceArea: 87,
    legacyZone: "R3",
    modernZone: "A",
    modernRate: 15,
    selectedYears: [2023, 2024, 2025],
    declarationByYear: declarations([2023, 2024, 2025], { 2024: true }),
    calculationDate: CALC_DATE,
    ...overrides,
  });
}

/* -------------------------------------------------------------------------- */
/*                            Report model equality                           */
/* -------------------------------------------------------------------------- */

describe("TNB report model", () => {
  it("reuses the result amounts without recalculating them", () => {
    const result = calculate();
    const report = buildTnbReport({
      result,
      surfaceArea: 87,
      generatedAt: new Date(2026, 9, 29, 15, 30),
    });

    expect(report).not.toBeNull();
    if (!report) return;

    expect(report.rows).toHaveLength(result.years.length);
    report.rows.forEach((row, index) => {
      const source = result.years[index];
      expect(row.taxYear).toBe(source.taxYear);
      expect(row.amounts).toBe(source.amounts);
      expect(row.total).toBe(source.amounts?.annualTotal ?? null);
      expect(row.surfaceArea).toBe(source.surfaceArea);
    });

    expect(report.aggregates).toBe(result.aggregates);
    expect(report.aggregates.annualTotal).toBe(
      result.aggregates?.annualTotal ?? -1,
    );

    const sumOfYears = report.rows.reduce(
      (total, row) => total + (row.total ?? 0),
      0,
    );
    expect(sumOfYears).toBeCloseTo(report.aggregates.annualTotal, 2);
    expect(report.aggregates.annualTotal).toBe(3043.63);
  });

  it("keeps every annual total distinct from the grand total", () => {
    const result = calculate();
    const report = buildTnbReport({ result, surfaceArea: 87 });
    expect(report).not.toBeNull();
    if (!report) return;

    const annualTotals = report.rows.map((row) => row.total);
    expect(annualTotals).toEqual([1212.53, 681.21, 1149.89]);
    expect(new Set(annualTotals).size).toBe(3);
    expect(report.aggregates.annualTotal).not.toBe(annualTotals[0]);
  });

  it("matches the engine line by line for the worked example", () => {
    const result = calculate();
    const report = buildTnbReport({ result, surfaceArea: 87 });
    expect(report).not.toBeNull();
    if (!report) return;

    const first = report.rows[0];
    const line = (key: string) =>
      first.lines.find((entry) => entry.key === key);

    expect(line("principal")?.value).toBe(522);
    expect(line("principal")?.formula).toContain("87 m² × 6 DH/m²");
    expect(line("def")?.value).toBe(500);
    expect(line("def")?.applicable).toBe(true);
    expect(line("def")?.formula).toContain("max(522,00 DH × 15 %");
    expect(line("maj10")?.value).toBe(52.2);
    expect(line("maj5")?.value).toBe(26.1);
    expect(line("monthsLate")?.value).toBe(43);
    expect(line("maj05")?.value).toBe(112.23);
    expect(line("maj05")?.formula).toContain("× 43 mois");
  });

  it("marks the DEF as non applicable for a declared year", () => {
    const result = calculate();
    const report = buildTnbReport({ result, surfaceArea: 87 });
    expect(report).not.toBeNull();
    if (!report) return;

    const declaredRow = report.rows.find((row) => row.taxYear === 2024);
    const def = declaredRow?.lines.find((line) => line.key === "def");
    expect(def?.value).toBe(0);
    expect(def?.applicable).toBe(false);
    expect(def?.note).toContain("Non applicable");
  });

  it("can explain the same components as the application table", () => {
    const result = calculate();
    const report = buildTnbReport({ result, surfaceArea: 87 });
    expect(report).not.toBeNull();
    if (!report) return;

    const explained = new Set(report.explanations.map((entry) => entry.key));
    expect(explained.size).toBe(TNB_EXPLANATIONS.length);

    for (const entry of report.explanations) {
      expect(entry.label.length).toBeGreaterThan(0);
      expect(entry.definition.length).toBeGreaterThan(20);
      expect(entry.why.length).toBeGreaterThan(20);
      expect(entry.when.length).toBeGreaterThan(20);
      expect(entry.formula.length).toBeGreaterThan(5);
    }

    // Every component rendered in the table rows has an explanation.
    for (const row of report.rows) {
      for (const line of row.lines) {
        expect(explained.has(line.key)).toBe(true);
      }
    }
  });

  it("reports per-year component values and aggregates", () => {
    const result = calculate();
    const components = buildTnbComponentValues(result);
    const byKey = new Map(components.map((entry) => [entry.key, entry]));

    expect(byKey.get("principal")?.values).toEqual([
      { year: 2023, value: 522, applicable: true },
      { year: 2024, value: 522, applicable: true },
      { year: 2025, value: 522, applicable: true },
    ]);
    expect(byKey.get("def")?.values[1]).toEqual({
      year: 2024,
      value: 0,
      applicable: false,
    });
    expect(byKey.get("monthsLate")?.unit).toBe("months");
    expect(byKey.get("grand")?.aggregate).toBe(3043.63);
    expect(byKey.get("surface")?.values[0]).toEqual({
      year: 2023,
      value: 87,
      applicable: true,
    });
    expect(byKey.get("tariff")?.values[0].value).toBe(6);
    expect(byKey.get("declaration")?.values[1].text).toBe("Déclarée");
  });

  it("excludes unresolved years from the totals instead of counting zero", () => {
    const years = [2025, 2027];
    const result = calculate({
      selectedYears: years,
      declarationByYear: declarations(years),
    });
    const report = buildTnbReport({ result, surfaceArea: 87 });
    expect(report).not.toBeNull();
    if (!report) return;

    expect(report.selectedYearCount).toBe(2);
    expect(report.resolvedYearCount).toBe(1);
    expect(report.rows.map((row) => row.amounts !== null)).toEqual([
      true,
      false,
    ]);

    const future = report.rows.find((row) => row.taxYear === 2027);
    expect(future?.amounts).toBeNull();
    expect(future?.total).toBeNull();
    expect(future?.lines).toEqual([]);
    expect(future?.unresolvedReason).toBeTruthy();

    const resolvedOnly = result.years
      .filter((row) => row.amounts)
      .reduce((total, row) => total + (row.amounts?.annualTotal ?? 0), 0);
    expect(report.aggregates.annualTotal).toBeCloseTo(resolvedOnly, 2);
    expect(report.complete).toBe(false);
  });

  it("returns null when the engine produced no aggregate", () => {
    const result = calculate({ surfaceArea: 0 });
    expect(result.aggregates).toBeNull();
    expect(buildTnbReport({ result, surfaceArea: 0 })).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*                                 Formatters                                 */
/* -------------------------------------------------------------------------- */

describe("TNB report formatting", () => {
  it("uses French decimals and plain spaces that render in the PDF font", () => {
    expect(pdfNumber(3043.63)).toBe("3 043,63");
    expect(pdfDh(3043.63)).toBe("3 043,63 DH");
    expect(pdfNumber(0)).toBe("0,00");
  });
});

/* -------------------------------------------------------------------------- */
/*                                    PDF                                     */
/* -------------------------------------------------------------------------- */

describe("TNB PDF rendering", () => {
  const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
  const result = calculate({
    selectedYears: years,
    declarationByYear: declarations(years, { 2018: true, 2020: true }),
  });
  const report = buildTnbReport({
    result,
    surfaceArea: 87,
    generatedAt: new Date(2026, 9, 29, 10, 0),
  });

  it("produces a compact report with the calculated totals", () => {
    expect(report).not.toBeNull();
    if (!report) return;

    const doc = createTnbReportPdf(report, { compress: false });
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);

    const buffer = doc.output("arraybuffer");
    expect(buffer.byteLength).toBeGreaterThan(5_000);

    const raw = doc.output();
    // French accents are encoded in WinAnsi and must survive the export.
    expect(raw).toContain("D\u00e9tails");
    expect(raw).toContain("Total");
    // The exact grand total displayed in the app is written to the PDF.
    expect(raw).toContain(pdfNumber(report.aggregates.annualTotal));
  });

  it("works without any optional property information", () => {
    expect(report).not.toBeNull();
    if (!report) return;
    expect(() => createTnbReportPdf(report)).not.toThrow();
  });
});
