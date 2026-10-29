import type { Metadata } from "next";
import { PaymentForecaster } from "@/components/payment-forecaster";

export const metadata: Metadata = {
  title: "Estimateur de paiement mensuel",
  description:
    "Sélectionnez un mois futur et estimez le montant de taxe à provisionner, avec le cumul jusqu'à l'échéance.",
};

export default function ForecastPage() {
  return <PaymentForecaster />;
}
