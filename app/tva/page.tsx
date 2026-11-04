import type { Metadata } from "next";
import { VatCalculator } from "@/components/vat-calculator";

export const metadata: Metadata = {
  title: "TVA Maroc — Calculateur et simulateur de déclaration",
  description:
    "Simulez votre TVA au Maroc : calcul HT/TTC, déclaration TVA, TVA collectée et déductible.",
};

export default function TvaPage() {
  return (
    <div className="page">
      <div className="container-page page-stack">
        <div className="page-header-copy space-y-2">
          <h1 className="text-h1 tracking-[-0.02em]">TVA Maroc</h1>
          <p className="max-w-2xl text-[14px] leading-relaxed text-muted">
            Simulez votre TVA, calculez vos montants HT et TTC et estimez votre
            TVA à payer.
          </p>
        </div>
        <VatCalculator />
      </div>
    </div>
  );
}
