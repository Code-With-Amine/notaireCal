import { describe, expect, it } from "vitest";
import {
  calculateSimpleVat,
  calculateVatDeclaration,
  roundDh,
} from "../vat";

describe("VAT simple calculator", () => {
  it("HT to TTC at 20%", () => {
    const r = calculateSimpleVat({ direction: "htToTtc", amount: 1000, status: "standard" });
    expect(r.ht).toBe(1000);
    expect(r.vat).toBe(200);
    expect(r.ttc).toBe(1200);
  });

  it("HT to TTC at 10%", () => {
    const r = calculateSimpleVat({ direction: "htToTtc", amount: 1000, status: "reduced" });
    expect(r.vat).toBe(100);
    expect(r.ttc).toBe(1100);
  });

  it("TTC to HT at 20%", () => {
    const r = calculateSimpleVat({ direction: "ttcToHt", amount: 1200, status: "standard" });
    expect(r.ht).toBe(1000);
    expect(r.vat).toBe(200);
    expect(r.ttc).toBe(1200);
  });

  it("VAT amount to HT and TTC at 20%", () => {
    const r = calculateSimpleVat({ direction: "vatToHtTtc", amount: 200, status: "standard" });
    expect(r.ht).toBe(1000);
    expect(r.vat).toBe(200);
    expect(r.ttc).toBe(1200);
  });

  it("exempt with deduction: no VAT", () => {
    const r = calculateSimpleVat({ direction: "htToTtc", amount: 1000, status: "exemptWithDeduction" });
    expect(r.vat).toBe(0);
    expect(r.ttc).toBe(1000);
  });

  it("out of scope: no VAT", () => {
    const r = calculateSimpleVat({ direction: "ttcToHt", amount: 1000, status: "outOfScope" });
    expect(r.vat).toBe(0);
    expect(r.ht).toBe(1000);
  });

  it("rounds to 2 decimals", () => {
    const r = calculateSimpleVat({ direction: "htToTtc", amount: 333.333, status: "standard" });
    expect(r.ht).toBe(333.33);
    expect(r.vat).toBe(66.67);
  });
});

describe("VAT declaration simulator", () => {
  it("positive balance => payable", () => {
    const r = calculateVatDeclaration({
      periodLabel: "2026-01",
      sales: [{ id: "1", description: "Vente", amountHt: 1000, status: "standard" }],
      purchases: [{ id: "2", description: "Achat", amountHt: 400, status: "standard", deductible: true }],
      previousCredit: 0,
      proRata: 1,
      applyProRata: false,
    });
    expect(r.vatCollected).toBe(200);
    expect(r.vatDeductible).toBe(80);
    expect(r.netVat).toBe(120);
    expect(r.payable).toBe(120);
    expect(r.credit).toBe(0);
  });

  it("negative balance => credit", () => {
    const r = calculateVatDeclaration({
      periodLabel: "2026-01",
      sales: [{ id: "1", description: "Vente", amountHt: 1000, status: "standard" }],
      purchases: [{ id: "2", description: "Achat", amountHt: 2000, status: "standard", deductible: true }],
      previousCredit: 0,
      proRata: 1,
      applyProRata: false,
    });
    expect(r.netVat).toBeLessThan(0);
    expect(r.payable).toBe(0);
    expect(r.credit).toBeGreaterThan(0);
  });

  it("previous credit reduces payable", () => {
    const r = calculateVatDeclaration({
      periodLabel: "2026-01",
      sales: [{ id: "1", description: "Vente", amountHt: 1000, status: "standard" }],
      purchases: [],
      previousCredit: 50,
      proRata: 1,
      applyProRata: false,
    });
    expect(r.netVat).toBe(150);
    expect(r.payable).toBe(150);
  });

  it("non-deductible purchase not counted", () => {
    const r = calculateVatDeclaration({
      periodLabel: "2026-01",
      sales: [{ id: "1", description: "Vente", amountHt: 1000, status: "standard" }],
      purchases: [{ id: "2", description: "Achat", amountHt: 400, status: "standard", deductible: false }],
      previousCredit: 0,
      proRata: 1,
      applyProRata: false,
    });
    expect(r.vatDeductible).toBe(0);
    expect(r.vatNonDeductible).toBe(80);
  });

  it("pro rata applied", () => {
    const r = calculateVatDeclaration({
      periodLabel: "2026-01",
      sales: [{ id: "1", description: "Vente", amountHt: 1000, status: "standard" }],
      purchases: [{ id: "2", description: "Achat", amountHt: 400, status: "standard", deductible: true }],
      previousCredit: 0,
      proRata: 0.5,
      applyProRata: true,
    });
    expect(r.vatDeductible).toBe(40);
  });

  it("multiple rates in sales", () => {
    const r = calculateVatDeclaration({
      periodLabel: "2026-01",
      sales: [
        { id: "1", description: "Vente 20", amountHt: 1000, status: "standard" },
        { id: "2", description: "Vente 10", amountHt: 1000, status: "reduced" },
      ],
      purchases: [],
      previousCredit: 0,
      proRata: 1,
      applyProRata: false,
    });
    expect(r.vatCollected).toBe(300);
    expect(r.vatCollectedByRate.length).toBe(2);
  });
});
