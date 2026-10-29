import type { Metadata } from "next";
import { TaxiCalculator } from "@/components/taxi-calculator";

export const metadata: Metadata = {
  title: "Taxe sur le transport public",
  description:
    "Calculez la taxe de transport public, le stationnement et les majorations trimestrielles.",
};

export default function TaxiPage() {
  return <TaxiCalculator />;
}
