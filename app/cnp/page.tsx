import type { Metadata } from "next";
import { CnpConsultation } from "@/components/cnp-consultation";

export const metadata: Metadata = {
  title: "Consultation TNB — vérification manuelle",
  description: "Demande de vérification TNB effectuée manuellement par l'administration.",
};

export default function CnpPage() {
  return (
    <div className="page">
      <div className="container-page">
        <CnpConsultation />
      </div>
    </div>
  );
}
