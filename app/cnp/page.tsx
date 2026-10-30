import type { Metadata } from "next";
import { CnpConsultation } from "@/components/cnp-consultation";

export const metadata: Metadata = {
  title: "Consultation CNP — demande manuelle",
  description: "Demande de consultation CNP vérifiée manuellement par l'administration.",
};

export default function CnpPage() {
  return <CnpConsultation />;
}
