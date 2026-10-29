import { describe, expect, it } from "vitest";
import {
  buildTnbTariffRules,
  findTnbTariffGaps,
  getTnbRate,
  getTnbTariffEra,
  resolveTnbTariff,
  TNB_2026_ZONE_RATES,
  TNB_TARIFF_RULES,
  type LegacyZone,
  type ModernZone,
  type TnbTariffRule,
} from "../rates";
import { calculateTnb, roundDh, type TnbCalculationInput } from "../tnb";
import { calculateForecast } from "../calculators";
import { getRecentTaxYears, getTnbYearOptions } from "../tax-years";

const SAMPLE_DATE = "2026-10-15";

function declarations(
  years: number[],
  declared: Record<number, boolean> = {},
): Record<number, boolean> {
  return years.reduce<Record<number, boolean>>((status, year) => {
    status[year] = declared[year] ?? false;
    return status;
  }, {});
}

function calculate(
  years: number[],
  overrides: Partial<TnbCalculationInput> = {},
) {
  return calculateTnb({
    surfaceArea: 100,
    legacyZone: "R3",
    modernZone: "A",
    modernRate: 15,
    selectedYears: years,
    declarationByYear: declarations(years),
    calculationDate: SAMPLE_DATE,
    ...overrides,
  });
}

function annual(row: ReturnType<typeof calculate>["years"][number]): number {
  return row.amounts?.annualTotal ?? 0;
}

/* -------------------------------------------------------------------------- */
/*                          Dynamic year selection                            */
/* -------------------------------------------------------------------------- */

describe("Dynamic year selection", () => {
  it("offers historical years down to the configured floor, not a 4-5 year window", () => {
    const options = getTnbYearOptions(new Date(2026, 9, 28));
    expect(options[0]).toBe(2026);
    expect(options).toContain(2016);
    expect(options).toContain(2018);
    expect(options).toContain(2010);
    expect(options).not.toContain(2009);
    expect(options.length).toBeGreaterThan(5);
  });

  it("derives the trimester window from the current date", () => {
    expect(getRecentTaxYears(4, new Date(2027, 0, 1))).toEqual([
      2024, 2025, 2026, 2027,
    ]);
  });
});

/* -------------------------------------------------------------------------- */
/*                       Tariff resolution (boundaries)                       */
/* -------------------------------------------------------------------------- */

describe("TNB tariff resolver", () => {
  it("resolves each historical band independently", () => {
    const expectations: Array<[number, LegacyZone, number]> = [
      [2010, "R3", 2],
      [2017, "R3", 2],
      [2017, "R7", 2],
      [2018, "R3", 4],
      [2019, "R5", 4],
      [2020, "R7", 4],
      [2021, "R3", 6],
      [2021, "R5", 8],
      [2021, "R7", 10],
      [2025, "R3", 6],
      [2025, "R7", 10],
    ];

    for (const [year, zone, rate] of expectations) {
      const resolution = resolveTnbTariff({ taxYear: year, legacyZone: zone });
      expect(resolution.status, `${year}/${zone}`).toBe("resolved");
      if (resolution.status === "resolved") {
        expect(resolution.rate).toBe(rate);
      }
      expect(getTnbRate(year, zone)).toBe(rate);
    }
  });

  it("assigns boundary years to exactly one configured rule", () => {
    expect(
      resolveTnbTariff({ taxYear: 2017, legacyZone: "R3" }),
    ).toMatchObject({
      status: "resolved",
      rule: { id: "tnb-before-2018" },
    });
    expect(
      resolveTnbTariff({ taxYear: 2018, legacyZone: "R3" }),
    ).toMatchObject({
      status: "resolved",
      rule: { id: "tnb-2018-2020" },
    });
    expect(
      resolveTnbTariff({ taxYear: 2020, legacyZone: "R3" }),
    ).toMatchObject({
      status: "resolved",
      rule: { id: "tnb-2018-2020" },
    });
    expect(
      resolveTnbTariff({ taxYear: 2021, legacyZone: "R3" }),
    ).toMatchObject({
      status: "resolved",
      rule: { id: "tnb-2021-2025-R3" },
    });
    expect(
      resolveTnbTariff({ taxYear: 2025, legacyZone: "R3" }),
    ).toMatchObject({
      status: "resolved",
      rule: { id: "tnb-2021-2025-R3" },
    });
  });

  it("reports years outside the configured floor as unresolved", () => {
    const resolution = resolveTnbTariff({ taxYear: 2009, legacyZone: "R3" });
    expect(resolution.status).toBe("unresolved");
    if (resolution.status === "unresolved") {
      expect(resolution.reason).toBe("no-rule");
    }
    expect(getTnbRate(2009, "R3")).toBeNull();
  });

  it("detects overlapping configuration instead of guessing", () => {
    const overlapping: TnbTariffRule[] = [
      ...TNB_TARIFF_RULES,
      {
        id: "duplicate-2020",
        labelKey: "tnb.rateRule2",
        version: "test-overlap",
        fromYear: 2020,
        toYear: 2020,
        zone: null,
        rate: 9,
        confirmed: true,
      },
    ];

    const resolution = resolveTnbTariff({
      taxYear: 2020,
      legacyZone: "R3",
      rules: overlapping,
    });
    expect(resolution.status).toBe("unresolved");
    if (resolution.status === "unresolved") {
      expect(resolution.reason).toBe("ambiguous-rule");
    }
  });

  it("rejects invalid zone and rate values at runtime", () => {
    const badZone = resolveTnbTariff({
      taxYear: 2022,
      legacyZone: "RX" as LegacyZone,
    });
    expect(badZone.status).toBe("unresolved");
    if (badZone.status === "unresolved") {
      expect(badZone.reason).toBe("invalid-zone");
    }

    const badRate = resolveTnbTariff({
      taxYear: 2026,
      modernZone: "A",
      modernRate: 7,
    });
    expect(badRate.status).toBe("unresolved");
    if (badRate.status === "unresolved") {
      expect(badRate.reason).toBe("invalid-rate");
    }
  });

  it("has no holes in the default configuration", () => {
    expect(findTnbTariffGaps()).toEqual([]);
  });

  it("switches schedule exactly at the configured era boundaries", () => {
    expect(getTnbTariffEra(2020)).toBe("flat");
    expect(getTnbTariffEra(2021)).toBe("legacy-zone");
    expect(getTnbTariffEra(2025)).toBe("legacy-zone");
    expect(getTnbTariffEra(2026)).toBe("modern-zone");
  });

  it("configures both 2026 zone rates, including Zone B = 6 DH/m²", () => {
    expect(TNB_2026_ZONE_RATES.A).toEqual([15, 20]);
    expect(TNB_2026_ZONE_RATES.B).toEqual([6, 10]);
  });
});

/* -------------------------------------------------------------------------- */
/*                      Modern 2026 zones and rate grid                       */
/* -------------------------------------------------------------------------- */

describe("2026 modern zone/rate schedule", () => {
  it("calculates 2026 for both zones and both rates", () => {
    const expectations: Array<[ModernZone, number]> = [
      ["A", 15],
      ["A", 20],
      ["B", 6],
      ["B", 10],
    ];

    for (const [modernZone, modernRate] of expectations) {
      const resolution = resolveTnbTariff({
        taxYear: 2026,
        modernZone,
        modernRate,
      });
      expect(resolution.status, `${modernZone}/${modernRate}`).toBe(
        "resolved",
      );
      if (resolution.status === "resolved") {
        expect(resolution.rate).toBe(modernRate);
        expect(resolution.rule.id).toBe(
          `tnb-2026-${modernZone}-${modernRate}`,
        );
      }
    }
  });

  it("never reuses the obsolete Zone B 16 DH/m² rate", () => {
    const resolution = resolveTnbTariff({
      taxYear: 2026,
      modernZone: "B",
      modernRate: 16,
    });
    expect(resolution).toMatchObject({
      status: "unresolved",
      reason: "invalid-rate",
    });
  });

  it("requires a modern zone and a rate from 2026", () => {
    const noZone = resolveTnbTariff({
      taxYear: 2026,
      modernRate: 15,
    });
    expect(noZone).toMatchObject({
      status: "unresolved",
      reason: "missing-zone",
    });

    const noRate = resolveTnbTariff({
      taxYear: 2026,
      modernZone: "A",
    });
    expect(noRate).toMatchObject({
      status: "unresolved",
      reason: "missing-rate",
    });
  });

  it("requires a legacy zone from 2021 to 2025", () => {
    const resolution = resolveTnbTariff({ taxYear: 2022 });
    expect(resolution).toMatchObject({
      status: "unresolved",
      reason: "missing-zone",
    });
  });

  it("resolves each zone/rate cell without mixing them", () => {
    const rates = (["A", "B"] as ModernZone[]).flatMap((modernZone) =>
      TNB_2026_ZONE_RATES[modernZone].map((modernRate) => {
        const resolution = resolveTnbTariff({
          taxYear: 2026,
          modernZone,
          modernRate,
        });
        expect(resolution.status).toBe("resolved");
        return resolution.status === "resolved" ? resolution.rate : null;
      }),
    );

    expect(rates).toEqual([15, 20, 6, 10]);
  });

  it("never leaks a 2026 rate into 2025 or a 2025 rate into 2026", () => {
    const y2025 = resolveTnbTariff({ taxYear: 2025, legacyZone: "R7" });
    expect(y2025.status).toBe("resolved");
    if (y2025.status === "resolved") expect(y2025.rate).toBe(10);

    const legacyRateIn2026 = resolveTnbTariff({
      taxYear: 2026,
      modernZone: "A",
      modernRate: 6,
    });
    expect(legacyRateIn2026).toMatchObject({
      status: "unresolved",
      reason: "invalid-rate",
    });

    const y2026 = resolveTnbTariff({
      taxYear: 2026,
      modernZone: "B",
      modernRate: 6,
    });
    expect(y2026).toMatchObject({ status: "resolved", rate: 6 });
    expect(getTnbRate(2026, "R3")).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*                            A — multiple years                              */
/* -------------------------------------------------------------------------- */

describe("A — multiple historical years", () => {
  it("calculates 2018, 2020, 2023 and 2026 with their own tariffs", () => {
    const years = [2018, 2020, 2023, 2026];
    const result = calculate(years, {
      declarationByYear: declarations(years, {
        2018: true,
        2020: true,
        2023: true,
        2026: true,
      }),
    });

    expect(result.years).toHaveLength(4);
    expect(result.years.map((row) => row.taxYear)).toEqual(years);
    expect(
      result.years.map((row) =>
        row.tariff.status === "resolved" ? row.tariff.rate : null,
      ),
    ).toEqual([4, 4, 6, 15]);

    expect(result.years.map(annual)).toEqual([666, 618, 819, 1777.5]);
    expect(result.aggregates?.annualTotal).toBe(3880.5);
    expect(result.complete).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*                        B — mixed declaration statuses                      */
/* -------------------------------------------------------------------------- */

describe("B — mixed declaration statuses", () => {
  it("applies DEF only to undeclared years without leaking status", () => {
    const years = [2018, 2020, 2021, 2022];
    const result = calculate(years, {
      surfaceArea: 125,
      legacyZone: "R5",
      calculationDate: "2026-03-15",
      declarationByYear: declarations(years, {
        2020: true,
        2022: true,
      }),
    });

    expect(result.years.map((row) => row.isDeclared)).toEqual([
      false,
      true,
      false,
      true,
    ]);
    expect(result.years.map((row) => row.amounts?.def)).toEqual([
      500, 0, 500, 0,
    ]);
    expect(result.years.map(annual)).toEqual([1315, 755, 1950, 1390]);
    expect(result.aggregates?.annualTotal).toBe(5410);
  });
});

/* -------------------------------------------------------------------------- */
/*                     C — one declaration status changes                     */
/* -------------------------------------------------------------------------- */

describe("C — changing one declaration status", () => {
  it("changes only the affected year and the grand total", () => {
    const years = [2018, 2020, 2021, 2022];
    const baseInput: Partial<TnbCalculationInput> = {
      surfaceArea: 125,
      legacyZone: "R5",
      calculationDate: "2026-03-15",
    };

    const before = calculate(years, {
      ...baseInput,
      declarationByYear: declarations(years, { 2020: true, 2022: true }),
    });
    const after = calculate(years, {
      ...baseInput,
      declarationByYear: declarations(years, { 2022: true }),
    });

    expect(after.years[0]).toEqual(before.years[0]);
    expect(after.years[2]).toEqual(before.years[2]);
    expect(after.years[3]).toEqual(before.years[3]);

    expect(before.years[1].amounts?.def).toBe(0);
    expect(after.years[1].amounts?.def).toBe(500);
    expect(after.years[1].amounts?.annualTotal).toBe(
      (before.years[1].amounts?.annualTotal ?? 0) + 500,
    );
    expect(after.aggregates?.annualTotal).toBe(
      (before.aggregates?.annualTotal ?? 0) + 500,
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                           D — adding a historical year                     */
/* -------------------------------------------------------------------------- */

describe("D — adding a historical year", () => {
  it("adds 2016 once with the pre-2018 tariff and keeps other years intact", () => {
    const base = calculate([2020, 2023, 2026]);
    const withOldYear = calculate([2016, 2020, 2023, 2026]);

    expect(withOldYear.years).toHaveLength(4);
    expect(
      withOldYear.years.filter((row) => row.taxYear === 2016),
    ).toHaveLength(1);
    expect(withOldYear.years[0].tariff).toMatchObject({
      status: "resolved",
      rate: 2,
      rule: { id: "tnb-before-2018" },
    });

    expect(withOldYear.years.slice(1)).toEqual(base.years);
    expect(withOldYear.aggregates?.annualTotal).toBe(
      (base.aggregates?.annualTotal ?? 0) + annual(withOldYear.years[0]),
    );
    expect(annual(withOldYear.years[0])).toBe(857);
  });

  it("deduplicates repeated years instead of adding them twice", () => {
    const result = calculate([2020, 2020, 2023, 2023]);
    expect(result.years.map((row) => row.taxYear)).toEqual([2020, 2023]);
  });
});

/* -------------------------------------------------------------------------- */
/*                              E — removing a year                           */
/* -------------------------------------------------------------------------- */

describe("E — removing a year", () => {
  it("removes only that year's contribution", () => {
    const full = calculate([2020, 2023, 2026]);
    const removed = calculate([2020, 2026]);
    const removedRow = full.years.find((row) => row.taxYear === 2023);

    expect(removed.years.map((row) => row.taxYear)).toEqual([2020, 2026]);
    expect(removed.aggregates?.annualTotal).toBe(
      (full.aggregates?.annualTotal ?? 0) - annual(removedRow!),
    );
  });
});

/* -------------------------------------------------------------------------- */
/*                            F — no selected years                           */
/* -------------------------------------------------------------------------- */

describe("F — no selected years", () => {
  it("reports a validation issue and no misleading total", () => {
    const result = calculate([]);
    expect(result.issues.map((issue) => issue.code)).toContain("no-years");
    expect(result.years).toEqual([]);
    expect(result.aggregates).toBeNull();
    expect(result.complete).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*                           G — invalid surface area                         */
/* -------------------------------------------------------------------------- */

describe("G — invalid surface area", () => {
  it.each([
    ["zero", 0],
    ["negative", -25],
    ["not a number", Number.NaN],
    ["infinite", Number.POSITIVE_INFINITY],
  ])("rejects %s area without NaN totals", (_label, surfaceArea) => {
    const result = calculate([2020, 2023], { surfaceArea });
    expect(result.issues.map((issue) => issue.code)).toContain("invalid-area");
    expect(result.years).toEqual([]);
    expect(result.aggregates).toBeNull();
    expect(result.complete).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*                      H — missing tariff configuration                      */
/* -------------------------------------------------------------------------- */

describe("H — missing tariff configuration", () => {
  it("flags a year above the configured floor as unresolved", () => {
    const result = calculate([2009]);
    expect(result.years[0].tariff.status).toBe("unresolved");
    expect(result.years[0].amounts).toBeNull();
    expect(result.aggregates).toBeNull();
    expect(result.complete).toBe(false);
    expect(result.issues).toContainEqual({
      code: "unresolved-tariff",
      year: 2009,
    });
  });

  it("excludes an unresolved year from partial aggregates", () => {
    const only2023: TnbTariffRule[] = [
      {
        id: "test-only-2023",
        labelKey: "tnb.rateRule1",
        version: "test-hole",
        fromYear: 2023,
        toYear: 2023,
        zone: null,
        rate: 6,
        confirmed: true,
      },
    ];

    const result = calculate([2022, 2023], { tariffRules: only2023 });
    expect(result.years[0].amounts).toBeNull();
    expect(result.years[1].amounts).not.toBeNull();
    expect(result.complete).toBe(false);
    expect(result.aggregates?.annualTotal).toBe(annual(result.years[1]));
  });

  it("never substitutes the current zone rate for a historical year", () => {
    const resolution = resolveTnbTariff({ taxYear: 2009, legacyZone: "R7" });
    expect(resolution.status).toBe("unresolved");
  });

  it("calculates 2026 with Zone B at 6 DH/m² instead of leaving it unresolved", () => {
    const result = calculate([2026], { modernZone: "B", modernRate: 6 });
    expect(result.years[0].tariff).toMatchObject({
      status: "resolved",
      rate: 6,
      rule: { id: "tnb-2026-B-6" },
    });
    expect(result.years[0].amounts).not.toBeNull();
    expect(result.complete).toBe(true);
    expect(result.aggregates?.principal).toBe(600);
  });

  it("flags a zone/rate cell that is absent from the configuration", () => {
    const onlyA15 = buildTnbTariffRules({ modernRates: { A: [15], B: [] } });
    const result = calculate([2026], {
      modernZone: "B",
      modernRate: 6,
      tariffRules: onlyA15,
    });

    expect(result.years[0].tariff).toMatchObject({ status: "unresolved" });
    expect(result.years[0].amounts).toBeNull();
    expect(result.aggregates).toBeNull();
    expect(result.complete).toBe(false);
    expect(result.issues).toContainEqual({
      code: "unresolved-tariff",
      year: 2026,
    });
  });
});

/* -------------------------------------------------------------------------- */
/*                         I — aggregate consistency                          */
/* -------------------------------------------------------------------------- */

describe("I — grand-total consistency", () => {
  it("equals the sum of annual totals and of every line item", () => {
    const result = calculate([2016, 2018, 2020, 2023, 2026], {
      surfaceArea: 137.5,
      legacyZone: "R7",
      modernZone: "A",
      modernRate: 20,
      declarationByYear: declarations([2016, 2018, 2020, 2023, 2026], {
        2018: true,
        2023: true,
      }),
    });

    const rows = result.years.map((row) => row.amounts!);
    expect(result.aggregates).not.toBeNull();
    const aggregates = result.aggregates!;

    expect(aggregates.annualTotal).toBe(
      roundDh(rows.reduce((sum, row) => sum + row.annualTotal, 0)),
    );
    expect(aggregates.principal).toBe(
      roundDh(rows.reduce((sum, row) => sum + row.principal, 0)),
    );
    expect(aggregates.def).toBe(
      roundDh(rows.reduce((sum, row) => sum + row.def, 0)),
    );
    expect(aggregates.majoration10).toBe(
      roundDh(rows.reduce((sum, row) => sum + row.majoration10, 0)),
    );
    expect(aggregates.majoration5).toBe(
      roundDh(rows.reduce((sum, row) => sum + row.majoration5, 0)),
    );
    expect(aggregates.majoration05).toBe(
      roundDh(rows.reduce((sum, row) => sum + row.majoration05, 0)),
    );

    for (const row of rows) {
      expect(row.annualTotal).toBe(
        roundDh(
          row.principal +
            row.def +
            row.majoration10 +
            row.majoration5 +
            row.majoration05,
        ),
      );
    }
  });
});

/* -------------------------------------------------------------------------- */
/*                       J — calculation-date consistency                     */
/* -------------------------------------------------------------------------- */

describe("J — calculation-date consistency", () => {
  it("only changes date-dependent amounts between two dates", () => {
    const years = [2020, 2023];
    const input: Partial<TnbCalculationInput> = {
      surfaceArea: 200,
      legacyZone: "R5",
      declarationByYear: declarations(years, { 2020: true }),
    };

    const early = calculate(years, { ...input, calculationDate: "2025-03-15" });
    const late = calculate(years, { ...input, calculationDate: "2026-03-15" });

    early.years.forEach((row, index) => {
      const later = late.years[index];
      expect(later.amounts?.principal).toBe(row.amounts?.principal);
      expect(later.amounts?.def).toBe(row.amounts?.def);
      expect(later.amounts?.majoration10).toBe(row.amounts?.majoration10);
      expect(later.amounts?.majoration5).toBe(row.amounts?.majoration5);
      expect(later.amounts?.monthsLate).toBe(
        (row.amounts?.monthsLate ?? 0) + 12,
      );
    });
  });

  it("is reproducible for the same explicit date", () => {
    const years = [2018, 2026];
    const first = calculate(years, { calculationDate: "2026-04-10" });
    const second = calculate(years, { calculationDate: "2026-04-10" });
    expect(second).toEqual(first);
  });

  it("rejects an invalid calculation date", () => {
    const result = calculate([2020], { calculationDate: "not-a-date" });
    expect(result.issues.map((issue) => issue.code)).toContain("invalid-date");
    expect(result.years).toEqual([]);
    expect(result.aggregates).toBeNull();
  });
});

/* -------------------------------------------------------------------------- */
/*                    K — historical tariff boundaries                        */
/* -------------------------------------------------------------------------- */

describe("K — historical tariff boundaries", () => {
  it("resolves the year immediately before and after each boundary", () => {
    const result = calculate([2010, 2017, 2018, 2020, 2021], {
      legacyZone: "R7",
      calculationDate: "2021-03-15",
    });

    const rates = result.years.map((row) =>
      row.tariff.status === "resolved" ? row.tariff.rate : null,
    );
    expect(rates).toEqual([2, 2, 4, 4, 10]);
    expect(
      result.years.map((row) =>
        row.tariff.status === "resolved" ? row.tariff.rule.id : null,
      ),
    ).toEqual([
      "tnb-before-2018",
      "tnb-before-2018",
      "tnb-2018-2020",
      "tnb-2018-2020",
      "tnb-2021-2025-R7",
    ]);
  });
});

/* -------------------------------------------------------------------------- */
/*                          Forecast tariff availability                      */
/* -------------------------------------------------------------------------- */

describe("Forecast tariff availability", () => {
  const base = {
    taxType: "tnb" as const,
    targetYear: 2026,
    targetMonth: 11,
    area: 500,
    legacyZone: "R3" as LegacyZone,
    modernZone: "A" as ModernZone,
    modernRate: 15,
    taxiCategory: "1" as const,
    drinksRevenue: 120000,
    beverageType: "non-alcoholic" as const,
    rooms: 50,
    price: 500,
    hotelCategory: "3" as const,
    nightsPerQuarter: 90,
  };

  it("resolves a 2026 estimate for the selected zone and rate", () => {
    const zoneA = calculateForecast(base);
    expect(zoneA.rateResolved).toBe(true);
    expect(zoneA.rateValue).toBe(15);
    expect(zoneA.annualEstimate).toBe(7500);
    expect(zoneA.monthlyAmount).toBe(625);

    const zoneB = calculateForecast({
      ...base,
      modernZone: "B",
      modernRate: 6,
    });
    expect(zoneB.rateResolved).toBe(true);
    expect(zoneB.rateValue).toBe(6);
    expect(zoneB.annualEstimate).toBe(3000);
  });

  it("still resolves a 2025 legacy-zone estimate", () => {
    const result = calculateForecast({
      ...base,
      targetYear: 2025,
      legacyZone: "R7",
    });
    expect(result.rateResolved).toBe(true);
    expect(result.rateValue).toBe(10);
    expect(result.annualEstimate).toBe(5000);
  });
});

/* -------------------------------------------------------------------------- */
/*                                Rounding                                    */
/* -------------------------------------------------------------------------- */

describe("Monetary rounding", () => {
  it("rounds line items to two decimals and keeps the annual sum consistent", () => {
    const roundingRules: TnbTariffRule[] = [
      {
        id: "rounding-2026",
        labelKey: "tnb.rateRule1",
        version: "rounding-test",
        fromYear: 2026,
        toYear: 2026,
        zone: null,
        rate: 6,
        confirmed: true,
      },
    ];

    const result = calculate([2026], {
      surfaceArea: 12.5,
      calculationDate: "2026-04-10",
      declarationByYear: { 2026: true },
      tariffRules: roundingRules,
    });

    const amounts = result.years[0].amounts!;
    expect(amounts.principal).toBe(75);
    expect(amounts.majoration10).toBe(7.5);
    expect(amounts.majoration5).toBe(3.75);
    expect(amounts.monthsLate).toBe(1);
    expect(amounts.majoration05).toBe(0.38);
    expect(amounts.annualTotal).toBe(86.63);
  });

  it("rounds half values consistently", () => {
    expect(roundDh(0.375)).toBe(0.38);
    expect(roundDh(1.005)).toBe(1.01);
    expect(roundDh(2.675)).toBe(2.68);
  });
});
