import type { Metadata } from "next";
import { VatCalculator } from "@/components/vat-calculator";

export const metadata: Metadata = {
  title: "TVA Maroc — Calculateur et simulateur de déclaration",
  description:
    "Simulez votre TVA au Maroc : calcul HT/TTC, déclaration TVA, TVA collectée et déductible.",
};

export default function TvaPage() {
  return (
    <div className="container-page py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-h1 tracking-[-0.02em]">
          TVA Maroc
        </h1>
        <p className="text-[14px] text-muted">
          Simulez votre TVA, calculez vos montants HT et TTC et estimez votre TVA
          à payer.
        </p>
      </div>
      <VatCalculator />
    </div>
  );
}
