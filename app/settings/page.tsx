import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings-panel";

export const metadata: Metadata = {
  title: "Paramètres",
  description: "Personnalisez la langue et l'apparence de Daribati.",
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
