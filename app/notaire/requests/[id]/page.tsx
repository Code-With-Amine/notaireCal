"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Printer,
} from "lucide-react";

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
  id: number;
  reference: string;
  title_number: string;
  cnp_number: string | null;
  status: string;
  result_grand_total: string | null;
  result_note: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  citizen_token: string;
}

export default function NotaireRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<RequestData | null>(null);
  const [years, setYears] = useState<YearRow[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/notaire/requests/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) setError(d.error || "Introuvable");
        else {
          setRequest(d.request);
          setYears(d.years || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erreur réseau");
        setLoading(false);
      });
  }, [id]);

  const copyLink = async () => {
    if (!request) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}/consultation/${request.citizen_token}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            <FileText size={28} />
            <p className="text-[14px] font-semibold text-[var(--text)]">
              {error || "Demande introuvable"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isPublished =
    request.status === "Terminée" || request.status === "completed";

  return (
    <div className="page print:py-0">
      <div className="container-page page-stack">
        <div>
          <button
            type="button"
            onClick={() => router.push("/notaire/dashboard")}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--brand)] transition hover:gap-2"
          >
            <ArrowLeft size={14} /> Retour à mes demandes
          </button>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="wrap-anywhere text-h1 tracking-[-0.02em]">
                {request.reference}
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Titre foncier{" "}
                <strong className="text-[var(--text)]">
                  {request.title_number}
                </strong>
                {" · "}Statut : {request.status}
              </p>
            </div>
            <span
              className={`badge ${
                isPublished ? "badge-success" : "badge-brand"
              } shrink-0`}
            >
              {request.status}
            </span>
          </div>
        </div>

        <div className="card p-5 space-y-4 sm:p-6">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                Référence
              </p>
              <p className="wrap-anywhere mt-1 text-[13.5px] font-bold">
                {request.reference}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                Titre foncier
              </p>
              <p className="mt-1 text-[13.5px] font-bold">
                {request.title_number}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                Date de soumission
              </p>
              <p className="mt-1 text-[13.5px] font-bold">
                {new Date(request.created_at).toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                Dernière mise à jour
              </p>
              <p className="mt-1 text-[13.5px] font-bold">
                {new Date(request.updated_at).toLocaleString("fr-FR")}
              </p>
            </div>
            {request.cnp_number ? (
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  CNP
                </p>
                <p className="mt-1 text-[13.5px] font-bold">
                  {request.cnp_number}
                </p>
              </div>
            ) : null}
            {request.published_at ? (
              <div className="min-w-0">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  Date de publication
                </p>
                <p className="mt-1 text-[13.5px] font-bold">
                  {new Date(request.published_at).toLocaleString("fr-FR")}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {!isPublished ? (
          <div className="card p-6 text-center space-y-3 sm:p-8">
            <Clock size={32} className="mx-auto text-[var(--warning)]" />
            <h2 className="text-[18px] font-bold">
              Demande en cours de traitement
            </h2>
            <p className="mx-auto max-w-lg text-[13px] leading-relaxed text-muted">
              Votre demande est en cours de vérification par l&apos;administration.
              Le résultat sera disponible ici une fois publié.
            </p>
          </div>
        ) : (
          <>
            <div className="card p-5 space-y-5 sm:p-6">
              <h2 className="text-[15px] font-extrabold">
                Détail du calcul par année
              </h2>

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
                  {request.result_grand_total ?? "—"} DH
                </span>
              </div>
            </div>

            {request.result_note ? (
              <div className="card p-5 space-y-2 sm:p-6">
                <h2 className="text-[15px] font-extrabold">
                  Observation destinée au notaire
                </h2>
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted">
                  {request.result_note}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary h-11 flex-1 sm:flex-none"
              >
                <Printer size={16} /> Imprimer
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="btn btn-secondary h-11 flex-1 sm:flex-none"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copié" : "Copier le lien partageable"}
              </button>
              <a
                href={`/consultation/${request.citizen_token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost h-11 flex-1 sm:flex-none"
              >
                <ExternalLink size={16} /> Lien partageable
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
