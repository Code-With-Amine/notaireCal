import type { Metadata } from "next";
import { TnbCalculator } from "@/components/tnb-calculator";

export const metadata: Metadata = {
  title: "Terrains non bâtis — Calcul TNB par année",
  description:
    "Calculez la TNB année par année avec le tarif de chaque période : 2 DH/m² avant 2018, 4 DH/m² de 2018 à 2020, zones R de 2021 à 2025, puis zones A/B et taux applicables depuis 2026.",
};

export default function TnbPage() {
  return <TnbCalculator />;
}
