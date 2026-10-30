import type { Metadata } from "next";
import { VatCalculator } from "@/components/vat-calculator";

export const metadata: Metadata = {
  title: "TVA Maroc — Calculateur et simulateur de déclaration",
  description:
    "Simulez votre TVA au Maroc : calcul HT/TTC, déclaration TVA, TVA collectée et déductible.",
};

export default function TvaPage() {
  return <VatCalculator />;
}
