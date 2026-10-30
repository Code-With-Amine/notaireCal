/**
 * Moroccan VAT (TVA) calculation engine.
 *
 * This module is deliberately separate from TNB. Rates and rules are
 * configuration, never hardcoded arithmetic. Historical rates that have not
 * been verified against an authoritative source are kept in a separate
 * `pendingHistoricalRates` list and are never applied automatically.
 */

export type VatStatus =
  | "standard" // 20% normal rate
  | "reduced" // 10% reduced rate (only for operations covered by law)
  | "exemptWithDeduction"
  | "exemptWithoutDeduction"
  | "outOfScope";

export interface VatRateRecord {
  status: VatStatus;
  rate: number; // 0 for exempt / out of scope
  label: string;
  legalReference: string;
  verified: boolean;
}

export const VAT_RATE_RECORDS: VatRateRecord[] = [
  {
    status: "standard",
    rate: 0.2,
    label: "Taux normal",
    legalReference: "CGI 2026, art. 99",
    verified: true,
  },
  {
    status: "reduced",
    rate: 0.1,
    label: "Taux réduit",
    legalReference: "CGI 2026, art. 99 (opérations visées)",
    verified: true,
  },
  {
    status: "exemptWithDeduction",
    rate: 0,
    label: "Exonéré avec droit à déduction",
    legalReference: "CGI 2026, art. 91",
    verified: true,
  },
  {
    status: "exemptWithoutDeduction",
    rate: 0,
    label: "Exonéré sans droit à déduction",
    legalReference: "CGI 2026, art. 92",
    verified: true,
  },
  {
    status: "outOfScope",
    rate: 0,
    label: "Hors champ",
    legalReference: "CGI 2026",
    verified: true,
  },
];

export function rateForStatus(status: VatStatus): number {
  return VAT_RATE_RECORDS.find((r) => r.status === status)?.rate ?? 0;
}

export interface SimpleVatInput {
  direction: "htToTtc" | "ttcToHt" | "vatToHtTtc";
  amount: number;
  status: VatStatus;
  rateOverride?: number; // only used when status === "reduced" is not enough; reserved
}

export interface SimpleVatResult {
  ht: number;
  vat: number;
  ttc: number;
  rate: number;
  status: VatStatus;
  formula: string;
}

export function roundDh(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateSimpleVat(input: SimpleVatInput): SimpleVatResult {
  const rate = rateForStatus(input.status);
  const amount = Number.isFinite(input.amount) ? input.amount : 0;
  let ht = 0;
  let vat = 0;
  let ttc = 0;
  let formula = "";

  if (input.status === "exemptWithDeduction" || input.status === "exemptWithoutDeduction" || input.status === "outOfScope") {
    // No VAT charged.
    if (input.direction === "htToTtc") {
      ht = roundDh(amount);
      vat = 0;
      ttc = ht;
      formula = `HT = ${ht.toFixed(2)} DH · TVA = 0,00 DH (${input.status}) · TTC = ${ttc.toFixed(2)} DH`;
    } else if (input.direction === "ttcToHt") {
      ttc = roundDh(amount);
      ht = ttc;
      vat = 0;
      formula = `TTC = ${ttc.toFixed(2)} DH · TVA = 0,00 DH (${input.status}) · HT = ${ht.toFixed(2)} DH`;
    } else {
      // vatToHtTtc with zero rate: amount is treated as HT
      ht = roundDh(amount);
      vat = 0;
      ttc = ht;
      formula = `HT = ${ht.toFixed(2)} DH · TVA = 0,00 DH (${input.status}) · TTC = ${ttc.toFixed(2)} DH`;
    }
    return { ht, vat, ttc, rate, status: input.status, formula };
  }

  if (input.direction === "htToTtc") {
    ht = roundDh(amount);
    vat = roundDh(ht * rate);
    ttc = roundDh(ht + vat);
    formula = `TVA = ${ht.toFixed(2)} × ${(rate * 100).toFixed(0)}% = ${vat.toFixed(2)} DH · TTC = ${ht.toFixed(2)} + ${vat.toFixed(2)} = ${ttc.toFixed(2)} DH`;
  } else if (input.direction === "ttcToHt") {
    ttc = roundDh(amount);
    if (rate === 0) {
      ht = ttc;
      vat = 0;
      formula = `Taux nul — HT = TTC = ${ht.toFixed(2)} DH`;
    } else {
      ht = roundDh(ttc / (1 + rate));
      vat = roundDh(ttc - ht);
      formula = `HT = ${ttc.toFixed(2)} ÷ (1 + ${(rate * 100).toFixed(0)}%) = ${ht.toFixed(2)} DH · TVA = ${ttc.toFixed(2)} − ${ht.toFixed(2)} = ${vat.toFixed(2)} DH`;
    }
  } else {
    // vatToHtTtc
    vat = roundDh(amount);
    if (rate === 0) {
      ht = vat;
      ttc = vat;
      formula = `Taux nul — HT = TVA = ${ht.toFixed(2)} DH`;
    } else {
      ht = roundDh(vat / rate);
      ttc = roundDh(ht + vat);
      formula = `HT = ${vat.toFixed(2)} ÷ ${(rate * 100).toFixed(0)}% = ${ht.toFixed(2)} DH · TTC = ${ht.toFixed(2)} + ${vat.toFixed(2)} = ${ttc.toFixed(2)} DH`;
    }
  }
  return { ht, vat, ttc, rate, status: input.status, formula };
}

// ---------- Declaration simulator ----------

export interface VatLine {
  id: string;
  description: string;
  amountHt: number;
  status: VatStatus;
}

export interface VatPurchaseLine {
  id: string;
  description: string;
  amountHt: number;
  status: VatStatus;
  deductible: boolean; // whether this purchase gives right to deduction
}

export interface VatDeclarationInput {
  periodLabel: string;
  sales: VatLine[];
  purchases: VatPurchaseLine[];
  previousCredit: number;
  proRata: number; // 0..1, 1 = full deduction right (only applied if set < 1)
  applyProRata: boolean;
}

export interface VatDeclarationResult {
  totalSalesHt: number;
  vatCollected: number;
  vatCollectedByRate: { rate: number; status: VatStatus; amount: number }[];
  totalPurchasesHt: number;
  vatDeductible: number;
  vatNonDeductible: number;
  previousCredit: number;
  netVat: number; // positive = payable, negative = credit
  payable: number; // max(0, netVat)
  credit: number; // max(0, -netVat)
  formula: string;
}

export function calculateVatDeclaration(
  input: VatDeclarationInput,
): VatDeclarationResult {
  const byRate = new Map<string, { rate: number; status: VatStatus; amount: number }>();
  let totalSalesHt = 0;
  let vatCollected = 0;
  for (const line of input.sales) {
    const rate = rateForStatus(line.status);
    const vat = roundDh(line.amountHt * rate);
    totalSalesHt = roundDh(totalSalesHt + line.amountHt);
    vatCollected = roundDh(vatCollected + vat);
    const key = `${line.status}-${rate}`;
    const existing = byRate.get(key);
    if (existing) existing.amount = roundDh(existing.amount + vat);
    else byRate.set(key, { rate, status: line.status, amount: vat });
  }

  let totalPurchasesHt = 0;
  let vatDeductible = 0;
  let vatNonDeductible = 0;
  for (const line of input.purchases) {
    const rate = rateForStatus(line.status);
    const vat = roundDh(line.amountHt * rate);
    totalPurchasesHt = roundDh(totalPurchasesHt + line.amountHt);
    if (!line.deductible) {
      vatNonDeductible = roundDh(vatNonDeductible + vat);
      continue;
    }
    // exempt without deduction / out of scope never deductible
    if (line.status === "exemptWithoutDeduction" || line.status === "outOfScope") {
      vatNonDeductible = roundDh(vatNonDeductible + vat);
      continue;
    }
    let deductible = vat;
    if (input.applyProRata && input.proRata >= 0 && input.proRata <= 1) {
      deductible = roundDh(vat * input.proRata);
    }
    vatDeductible = roundDh(vatDeductible + deductible);
    const remainder = roundDh(vat - deductible);
    vatNonDeductible = roundDh(vatNonDeductible + remainder);
  }

  const previousCredit = roundDh(input.previousCredit || 0);
  const netVat = roundDh(vatCollected - vatDeductible - previousCredit);
  const payable = netVat > 0 ? netVat : 0;
  const credit = netVat < 0 ? -netVat : 0;

  const formula = `TVA nette = TVA collectée (${vatCollected.toFixed(2)}) − TVA déductible (${vatDeductible.toFixed(2)}) − Crédit antérieur (${previousCredit.toFixed(2)}) = ${netVat.toFixed(2)} DH`;

  return {
    totalSalesHt,
    vatCollected,
    vatCollectedByRate: Array.from(byRate.values()),
    totalPurchasesHt,
    vatDeductible,
    vatNonDeductible,
    previousCredit,
    netVat,
    payable,
    credit,
    formula,
  };
}

// ---------- Historical rates (pending verification) ----------

export interface HistoricalVatRate {
  operation: string;
  year: number;
  rate: number;
  verified: boolean;
  note: string;
}

/**
 * Starting points supplied for research. NONE of these are verified against
 * the CGI; they are kept here so the admin can review/confirm them. They are
 * never applied automatically to a calculation.
 */
export const PENDING_HISTORICAL_VAT_RATES: HistoricalVatRate[] = [
  { operation: "Électricité", year: 2023, rate: 0.14, verified: false, note: "À confirmer" },
  { operation: "Électricité", year: 2024, rate: 0.16, verified: false, note: "À confirmer" },
  { operation: "Électricité", year: 2025, rate: 0.18, verified: false, note: "À confirmer" },
  { operation: "Électricité", year: 2026, rate: 0.2, verified: false, note: "À confirmer" },
  { operation: "Location de compteur électrique", year: 2023, rate: 0.07, verified: false, note: "À confirmer" },
  { operation: "Location de compteur électrique", year: 2024, rate: 0.11, verified: false, note: "À confirmer" },
  { operation: "Location de compteur électrique", year: 2025, rate: 0.15, verified: false, note: "À confirmer" },
  { operation: "Location de compteur électrique", year: 2026, rate: 0.2, verified: false, note: "À confirmer" },
  { operation: "Sucre raffiné", year: 2023, rate: 0.07, verified: false, note: "À confirmer" },
  { operation: "Sucre raffiné", year: 2024, rate: 0.08, verified: false, note: "À confirmer" },
  { operation: "Sucre raffiné", year: 2025, rate: 0.09, verified: false, note: "À confirmer" },
  { operation: "Sucre raffiné", year: 2026, rate: 0.1, verified: false, note: "À confirmer" },
  { operation: "Transport urbain et routier de voyageurs/marchandises", year: 2023, rate: 0.14, verified: false, note: "À confirmer" },
  { operation: "Transport urbain et routier de voyageurs/marchandises", year: 2024, rate: 0.13, verified: false, note: "À confirmer" },
  { operation: "Transport urbain et routier de voyageurs/marchandises", year: 2025, rate: 0.12, verified: false, note: "À confirmer" },
  { operation: "Transport urbain et routier de voyageurs/marchandises", year: 2026, rate: 0.1, verified: false, note: "À confirmer" },
  { operation: "Autres transports de voyageurs/marchandises", year: 2023, rate: 0.14, verified: false, note: "À confirmer" },
  { operation: "Autres transports de voyageurs/marchandises", year: 2024, rate: 0.16, verified: false, note: "À confirmer" },
  { operation: "Autres transports de voyageurs/marchandises", year: 2025, rate: 0.18, verified: false, note: "À confirmer" },
  { operation: "Autres transports de voyageurs/marchandises", year: 2026, rate: 0.2, verified: false, note: "À confirmer" },
  { operation: "Production d'électricité renouvelable", year: 2023, rate: 0.14, verified: false, note: "À confirmer" },
  { operation: "Production d'électricité renouvelable", year: 2024, rate: 0.12, verified: false, note: "À confirmer" },
  { operation: "Production d'électricité renouvelable", year: 2025, rate: 0.1, verified: false, note: "À confirmer" },
  { operation: "Production d'électricité renouvelable", year: 2026, rate: 0.1, verified: false, note: "À confirmer" },
];
