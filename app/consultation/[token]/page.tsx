"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Printer, Clock, Hash, Calendar } from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";

interface YearRow {
  tax_year: number;
  surface_area: string;
  legacy_zone: string | null;
  modern_zone: string | null;
  modern_rate: string | null;
  is_declared: boolean;
  principal: string | null;
  def: string | null;
  majoration10: string | null;
  majoration5: string | null;
  months_late: number | null;
  majoration05: string | null;
  annual_total: string | null;
  unresolved_reason: string | null;
}

interface RequestData {
  reference: string;
  titleNumber: string;
  cnpNumber: string | null;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  grandTotal: string | null;
}

export default function ConsultationResultPage() {
  const { t } = useApp();
  const params = useParams();
  const token = params?.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<RequestData | null>(null);
  const [years, setYears] = useState<YearRow[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/consultations/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) {
          setError(d.error || "Demande introuvable");
        } else {
          setRequest(d.request);
          setYears(d.years || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur réseau");
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="container-page py-8">
        <div className="card p-6 text-center text-muted">Chargement…</div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="container-page py-8">
        <div className="card p-6 text-center">
          <p className="text-[14px] text-[var(--danger)]">
            {error || "Demande introuvable"}
          </p>
        </div>
      </div>
    );
  }

  const isPublished = request.status === "Terminée" || request.status === "completed";

  return (
    <div className="container-page py-8 space-y-6 print:py-0">
      {/* Print header */}
      <div className="hidden print:block text-center space-y-1 mb-6">
        <h1 className="text-[20px] font-bold">Daribati — Résultat de consultation TNB</h1>
        <p className="text-[11px] text-muted">Document de simulation — à confirmer auprès du service compétent.</p>
      </div>

      <div className="space-y-1">
        <h1 className="text-h1 tracking-[-0.02em]">Consultation TNB</h1>
        <p className="text-[14px] text-muted">
          Résultat de la vérification manuelle effectuée par l'administration.
        </p>
      </div>

      {/* Request info */}
      <div className="card p-6 space-y-3">
        <SectionHeading icon={FileText} title="Informations de la demande" description="" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">Référence</p>
            <p className="mt-1 text-[14px] font-bold">{request.reference}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">Titre foncier</p>
            <p className="mt-1 text-[14px] font-bold">{request.titleNumber}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">Statut</p>
            <p className="mt-1 text-[14px] font-bold">{request.status}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">Date de soumission</p>
            <p className="mt-1 text-[14px] font-bold">
              {new Date(request.createdAt).toLocaleString("fr-FR")}
            </p>
          </div>
        </div>
      </div>

      {!isPublished ? (
        <div className="card p-6 text-center space-y-2">
          <Clock size={32} className="mx-auto text-[var(--warning)]" />
          <h2 className="text-[18px] font-bold">Demande en cours de traitement</h2>
          <p className="text-[13px] text-muted">
            Votre demande est en cours de vérification par l'administration. Le
            résultat sera disponible ici une fois publié.
          </p>
        </div>
      ) : (
        <>
          <div className="card p-6 space-y-4">
            <SectionHeading
              icon={FileText}
              title="Détail du calcul par année"
              description="Montants calculés selon les règles TNB configurées."
            />
            {years.length === 0 ? (
              <p className="text-[13px] text-muted">Aucune année calculée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Année</th>
                      <th>Principal</th>
                      <th>DEF</th>
                      <th>Maj. 10%</th>
                      <th>Maj. 5%</th>
                      <th>Maj. 0,5%</th>
                      <th>Mois retard</th>
                      <th>Total annuel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {years.map((y) => (
                      <tr key={y.tax_year}>
                        <td className="font-bold">{y.tax_year}</td>
                        <td>{y.principal ?? "—"}</td>
                        <td>{y.def ?? "—"}</td>
                        <td>{y.majoration10 ?? "—"}</td>
                        <td>{y.majoration5 ?? "—"}</td>
                        <td>{y.majoration05 ?? "—"}</td>
                        <td>{y.months_late ?? "—"}</td>
                        <td className="font-bold">{y.annual_total ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
              <span className="text-[14px] font-bold">Total à payer</span>
              <span className="text-[20px] font-extrabold text-[var(--brand)]">
                {request.grandTotal ?? "—"} DH
              </span>
            </div>
          </div>

          <div className="flex justify-end print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="btn btn-primary h-10"
            >
              <Printer size={16} /> Imprimer le résultat
            </button>
          </div>

          <p className="text-[11px] text-muted print:block">
            Document de simulation — montant à confirmer auprès du service
            compétent. Daribati n'est pas connecté automatiquement à la base de
            données communale.
          </p>
        </>
      )}
    </div>
  );
}
