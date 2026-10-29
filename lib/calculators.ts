import {
  getTnbTariffEra,
  resolveTnbTariff,
  type LegacyZone,
  type ModernZone,
} from "./rates";
import { tariffUnresolvedMessageKey } from "./tnb";
import { getRecentTaxYears } from "./tax-years";

/**
 * Rolling window used by the quarterly (trimester) taxes. Computed at module
 * load from the current date so new years appear without touching components.
 */
export const TAX_YEARS: number[] = getRecentTaxYears(4);
export type TaxYear = number;
export type TrimesterSelection = Record<number, boolean[]>;

export function emptySelection(): TrimesterSelection {
  return TAX_YEARS.reduce<TrimesterSelection>((selection, year) => {
    selection[year] = [false, false, false, false];
    return selection;
  }, {});
}

export function selectedCount(selection: TrimesterSelection): number {
  return Object.values(selection).reduce(
    (total, trimesters) => total + trimesters.filter(Boolean).length,
    0,
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TAXI                                      */
/* -------------------------------------------------------------------------- */

export const TAXI_CATEGORY_1 = { transport: 150, stationnement: 100 };
export const TAXI_CATEGORY_2 = { transport: 150, stationnement: 70 };

export const TAXI_MAJORATION: Record<number, number[]> = {
  2023: [31, 29.4, 28, 26.5],
  2024: [25, 23.5, 22, 20.5],
  2025: [19, 17.5, 16, 0],
  2026: [0, 0, 0, 0],
};

export interface TaxiRow {
  year: number;
  trimester: number;
  transport: number;
  stationnement: number;
  majorationRate: number;
  majorationAmount: number;
  amount: number;
}

export interface TaxiResult {
  rows: TaxiRow[];
  total: number;
  category: "1" | "2";
  transport: number;
  stationnement: number;
}

export function calculateTaxi(
  category: "1" | "2",
  selection: TrimesterSelection,
): TaxiResult {
  const base = category === "1" ? TAXI_CATEGORY_1 : TAXI_CATEGORY_2;
  const rows: TaxiRow[] = [];

  TAX_YEARS.forEach((year) => {
    const trimesters = selection[year] ?? [];
    trimesters.forEach((checked, index) => {
      if (!checked) return;
      const majorationRate = TAXI_MAJORATION[year]?.[index] ?? 0;
      const majorationAmount = base.transport * (majorationRate / 100);
      rows.push({
        year,
        trimester: index + 1,
        transport: base.transport,
        stationnement: base.stationnement,
        majorationRate,
        majorationAmount,
        amount: base.transport + base.stationnement + majorationAmount,
      });
    });
  });

  return {
    rows,
    total: rows.reduce((sum, row) => sum + row.amount, 0),
    category,
    transport: base.transport,
    stationnement: base.stationnement,
  };
}

/* -------------------------------------------------------------------------- */
/*                                 BOISSONS                                   */
/* -------------------------------------------------------------------------- */

export type BeverageType = "non-alcoholic" | "alcoholic";

export const BEVERAGE_RATES: Record<BeverageType, number> = {
  "non-alcoholic": 0.06,
  alcoholic: 0.1,
};

export interface DrinksRow {
  year: number;
  trimester: number;
  amount: number;
}

export interface DrinksResult {
  revenue: number;
  earnedIncome: number;
  tva: number;
  feePerTrimester: number;
  rows: DrinksRow[];
  total: number;
  beverageType: BeverageType;
}

export function calculateDrinks(input: {
  revenue: number;
  beverageType: BeverageType;
  selection: TrimesterSelection;
}): DrinksResult {
  const { revenue, beverageType, selection } = input;
  const rate = BEVERAGE_RATES[beverageType];
  const feePerTrimester = revenue * rate;
  const rows: DrinksRow[] = [];

  TAX_YEARS.forEach((year) => {
    (selection[year] ?? []).forEach((checked, index) => {
      if (checked) {
        rows.push({ year, trimester: index + 1, amount: feePerTrimester });
      }
    });
  });

  return {
    revenue,
    earnedIncome: revenue * 1.2,
    tva: revenue * 0.2,
    feePerTrimester,
    rows,
    total: feePerTrimester * rows.length,
    beverageType,
  };
}

/* -------------------------------------------------------------------------- */
/*                                  SÉJOUR                                    */
/* -------------------------------------------------------------------------- */

export type HotelCategory = "1" | "2" | "3" | "4" | "5";

export const SEJOUR_RATES: Record<HotelCategory, number> = {
  "1": 0.01,
  "2": 0.015,
  "3": 0.02,
  "4": 0.025,
  "5": 0.03,
};

export interface SejourRow {
  year: number;
  trimester: number;
  amount: number;
}

export interface SejourResult {
  rooms: number;
  price: number;
  nights: number;
  category: HotelCategory;
  quarterly: number;
  rows: SejourRow[];
  total: number;
}

export function calculateSejour(input: {
  rooms: number;
  price: number;
  nights: number;
  category: HotelCategory;
  selection: TrimesterSelection;
}): SejourResult {
  const { rooms, price, nights, category, selection } = input;
  const quarterly = rooms * price * nights * SEJOUR_RATES[category];
  const rows: SejourRow[] = [];

  TAX_YEARS.forEach((year) => {
    (selection[year] ?? []).forEach((checked, index) => {
      if (checked) {
        rows.push({ year, trimester: index + 1, amount: quarterly });
      }
    });
  });

  return {
    rooms,
    price,
    nights,
    category,
    quarterly,
    rows,
    total: quarterly * rows.length,
  };
}

/* -------------------------------------------------------------------------- */
/*                             MONTHLY FORECAST                               */
/* -------------------------------------------------------------------------- */

export type ForecastTaxType = "tnb" | "taxi" | "drinks" | "sejour";

export interface ForecastInput {
  taxType: ForecastTaxType;
  targetYear: number;
  targetMonth: number;
  area: number;
  legacyZone: LegacyZone;
  modernZone: ModernZone;
  modernRate: number;
  taxiCategory: "1" | "2";
  drinksRevenue: number;
  beverageType: BeverageType;
  rooms: number;
  price: number;
  hotelCategory: HotelCategory;
  nightsPerQuarter: number;
}

export interface ForecastMonth {
  year: number;
  month: number;
  amount: number;
  cumulative: number;
  isTarget: boolean;
}

export interface ForecastResult {
  taxType: ForecastTaxType;
  annualEstimate: number;
  monthlyAmount: number;
  quarterlyEstimate: number;
  cumulative: number;
  monthsUntil: number;
  targetYear: number;
  targetMonth: number;
  projection: ForecastMonth[];
  rateLabel: string;
  rateValue: number;
  /** False when the TNB tariff could not be confirmed for the target year. */
  rateResolved: boolean;
  /** i18n key describing why the tariff is unavailable, when applicable. */
  rateErrorKey: string | null;
}

export function calculateForecast(input: ForecastInput): ForecastResult {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  let annualEstimate = 0;
  let quarterlyEstimate = 0;
  let rateLabel = "";
  let rateValue = 0;
  let rateResolved = true;
  let rateErrorKey: string | null = null;

  switch (input.taxType) {
    case "tnb": {
      const tariff = resolveTnbTariff({
        taxYear: input.targetYear,
        legacyZone: input.legacyZone,
        modernZone: input.modernZone,
        modernRate: input.modernRate,
      });

      if (tariff.status === "resolved") {
        const era = getTnbTariffEra(input.targetYear);
        annualEstimate = input.area * tariff.rate;
        quarterlyEstimate = annualEstimate / 4;
        rateLabel =
          era === "flat" ? "forecast.baseRate" : "forecast.zoneRate";
        rateValue = tariff.rate;
      } else {
        // Never display a zero amount as if it were a real estimate.
        rateResolved = false;
        rateLabel = "forecast.rateUnavailable";
        rateErrorKey = tariffUnresolvedMessageKey(tariff.reason);
      }
      break;
    }
    case "taxi": {
      const base =
        input.taxiCategory === "1" ? TAXI_CATEGORY_1 : TAXI_CATEGORY_2;
      quarterlyEstimate = base.transport + base.stationnement;
      annualEstimate = quarterlyEstimate * 4;
      rateLabel = "forecast.quarterlyEstimate";
      rateValue = quarterlyEstimate;
      break;
    }
    case "drinks": {
      const rate = BEVERAGE_RATES[input.beverageType];
      quarterlyEstimate = input.drinksRevenue * rate;
      annualEstimate = quarterlyEstimate * 4;
      rateLabel = "forecast.baseRate";
      rateValue = rate * 100;
      break;
    }
    case "sejour": {
      const rate = SEJOUR_RATES[input.hotelCategory];
      quarterlyEstimate =
        input.rooms * input.price * input.nightsPerQuarter * rate;
      annualEstimate = quarterlyEstimate * 4;
      rateLabel = "forecast.baseRate";
      rateValue = rate * 100;
      break;
    }
  }

  const monthlyAmount = annualEstimate / 12;
  const monthsUntil = Math.max(
    0,
    (input.targetYear - currentYear) * 12 + (input.targetMonth - currentMonth),
  );
  const cumulative = monthlyAmount * (monthsUntil + 1);

  const projection: ForecastMonth[] = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(currentYear, currentMonth + index, 1);
    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      amount: monthlyAmount,
      cumulative: monthlyAmount * (index + 1),
      isTarget:
        date.getFullYear() === input.targetYear &&
        date.getMonth() === input.targetMonth,
    };
  });

  return {
    taxType: input.taxType,
    annualEstimate,
    monthlyAmount,
    quarterlyEstimate,
    cumulative,
    monthsUntil,
    targetYear: input.targetYear,
    targetMonth: input.targetMonth,
    projection,
    rateLabel,
    rateValue,
    rateResolved,
    rateErrorKey,
  };
}
