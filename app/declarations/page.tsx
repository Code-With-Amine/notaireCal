import type { Metadata } from "next";
import { DeclarationsList } from "@/components/declarations-list";

export const metadata: Metadata = {
  title: "Déclarations fiscales",
  description:
    "Retrouvez toutes les déclarations fiscales disponibles dans Daribati.",
};

export default function DeclarationsPage() {
  return <DeclarationsList />;
}
