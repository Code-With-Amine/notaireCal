import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Administration Daribati",
  description: "Tableau de bord administrateur.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
