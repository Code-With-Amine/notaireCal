import type { Metadata } from "next";
import { DrinksCalculator } from "@/components/drinks-calculator";

export const metadata: Metadata = {
  title: "Taxe sur les débits de boissons",
  description:
    "Estimez la TVA et le droit trimestriel sur les débits de boissons, alcoolisées ou non.",
};

export default function DrinksPage() {
  return <DrinksCalculator />;
}
