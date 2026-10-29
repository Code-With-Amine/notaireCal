import type { Metadata } from "next";
import { SejourCalculator } from "@/components/sejour-calculator";

export const metadata: Metadata = {
  title: "Taxe de séjour",
  description:
    "Calculez la taxe de séjour des établissements hôteliers selon leur catégorie et leurs trimestres.",
};

export default function SejourPage() {
  return <SejourCalculator />;
}
