"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, FileText, Info, Printer } from "lucide-react";
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
  resultNote?: string | null;
  notaireName?: string | null;
}

export default function ConsultationResultPage() {
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
      <div className="page">
        <div className="container-page">
          <div className="card p-6 text-center text-muted">Chargement…</div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="page">
        <div className="container-page">
          <div className="card empty-state">
            <Info size={28} />
            <p className="text-[14px] font-semibold text-[var(--text)]">
              {error || "Demande introuvable"}
            </p>
            <p className="max-w-md text-[12.5px]">
              Vérifiez le lien reçu ou contactez le notaire qui vous l&apos;a
              transmis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isPublished =
    request.status === "Terminée" || request.status === "completed";
  const statusBadge = isPublished ? "badge-success" : "badge-brand";

  return (
    <div className="page print:py-0">
      <div className="container-page page-stack">
        <div className="hidden text-center print:block">
          <h1 className="text-[20px] font-bold">
            Daribati — Résultat de consultation TNB
          </h1>
          <p className="mt-1 text-[11px] text-muted">
            Document de simulation — à confirmer auprès du service compétent.
          </p>
        </div>

        <div className="page-header">
          <div className="page-header-copy">
            <h1 className="text-h1 tracking-[-0.02em]">Consultation TNB</h1>
            <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-muted">
              Résultat de la vérification manuelle effectuée par
              l&apos;administration.
            </p>
          </div>
          <div className="print:hidden">
            <span className={`badge ${statusBadge}`}>{request.status}</span>
          </div>
        </div>

        <div className="card p-5 space-y-4 sm:p-6">
          <SectionHeading
            icon={FileText}
            title="Informations de la demande"
          />
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0">
              <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                Référence
              </dt>
              <dd className="wrap-anywhere mt-1 text-[13.5px] font-bold">
                {request.reference}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                Titre foncier
              </dt>
              <dd className="mt-1 text-[13.5px] font-bold">
                {request.titleNumber}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                Statut
              </dt>
              <dd className="mt-1 text-[13.5px] font-bold">{request.status}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                Date de soumission
              </dt>
              <dd className="mt-1 text-[13.5px] font-bold">
                {new Date(request.createdAt).toLocaleString("fr-FR")}
              </dd>
            </div>
            {request.notaireName ? (
              <div className="min-w-0">
                <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  Notaire
                </dt>
                <dd className="mt-1 text-[13.5px] font-bold">
                  {request.notaireName}
                </dd>
              </div>
            ) : null}
            {request.cnpNumber ? (
              <div className="min-w-0">
                <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  CNP
                </dt>
                <dd className="mt-1 text-[13.5px] font-bold">
                  {request.cnpNumber}
                </dd>
              </div>
            ) : null}
            {request.publishedAt ? (
              <div className="min-w-0">
                <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  Date de publication
                </dt>
                <dd className="mt-1 text-[13.5px] font-bold">
                  {new Date(request.publishedAt).toLocaleString("fr-FR")}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        {!isPublished ? (
          <div className="card p-6 text-center space-y-3 sm:p-8">
            <Clock size={32} className="mx-auto text-[var(--warning)]" />
            <h2 className="text-[18px] font-bold">
              Demande en cours de traitement
            </h2>
            <p className="mx-auto max-w-lg text-[13px] leading-relaxed text-muted">
              Votre demande est en cours de vérification par
              l&apos;administration. Le résultat sera disponible ici une fois
              publié.
            </p>
          </div>
        ) : (
          <>
            <div className="card p-5 space-y-5 sm:p-6">
              <SectionHeading
                icon={FileText}
                title="Détail du calcul par année"
                description="Montants calculés selon les règles TNB configurées."
              />

              {years.length === 0 ? (
                <p className="text-[13px] text-muted">
                  Aucune année calculée.
                </p>
              ) : (
                <>
                  <div className="space-y-3 sm:hidden print:hidden">
                    {years.map((y) => (
                      <div
                        key={y.tax_year}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[14px] font-extrabold">
                            Année {y.tax_year}
                          </p>
                          <p className="text-[14px] font-extrabold text-[var(--brand)]">
                            {y.annual_total ?? "—"} DH
                          </p>
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11.5px]">
                          <div>
                            <dt className="text-muted">Principal</dt>
                            <dd className="font-semibold">
                              {y.principal ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted">DEF</dt>
                            <dd className="font-semibold">{y.def ?? "—"}</dd>
                          </div>
                          <div>
                            <dt className="text-muted">Maj. 10 %</dt>
                            <dd className="font-semibold">
                              {y.majoration10 ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted">Maj. 5 %</dt>
                            <dd className="font-semibold">
                              {y.majoration5 ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted">Maj. 0,5 %</dt>
                            <dd className="font-semibold">
                              {y.majoration05 ?? "—"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-muted">Mois de retard</dt>
                            <dd className="font-semibold">
                              {y.months_late ?? "—"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto sm:block print:block">
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
                            <td className="font-bold">
                              {y.annual_total ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5">
                <span className="text-[14px] font-bold">Total à payer</span>
                <span className="text-[22px] font-extrabold text-[var(--brand)]">
                  {request.grandTotal ?? "—"} DH
                </span>
              </div>
            </div>

            {request.resultNote ? (
              <div className="card p-5 space-y-2 sm:p-6">
                <h2 className="text-[15px] font-extrabold">
                  Observation du service
                </h2>
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted">
                  {request.resultNote}
                </p>
              </div>
            ) : null}

            <div className="flex justify-end print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary h-11 w-full sm:w-auto"
              >
                <Printer size={16} /> Imprimer le résultat
              </button>
            </div>

            <p className="text-[11px] leading-relaxed text-muted print:block">
              Document de simulation — montant à confirmer auprès du service
              compétent. Daribati n&apos;est pas connecté automatiquement à la
              base de données communale.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
