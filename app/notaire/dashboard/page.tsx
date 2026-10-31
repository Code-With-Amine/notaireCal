"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, FileText, Copy, Check, ExternalLink } from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";

interface Req {
  id: number;
  reference: string;
  title_number: string;
  cnp_number: string | null;
  status: string;
  result_grand_total: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  citizen_token: string;
}

export default function NotaireDashboardPage() {
  const { t } = useApp();
  const router = useRouter();
  const [notaire, setNotaire] = useState<{ full_name: string; study_name: string | null; email: string } | null>(null);
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/notaire/me").then((r) => r.json());
      if (!me.ok) { router.push("/notaire/login"); return; }
      setNotaire(me.notaire);
      const reqs = await fetch("/api/notaire/requests").then((r) => r.json());
      if (reqs.ok) setRequests(reqs.requests);
      setLoading(false);
    })();
  }, [router]);

  const logout = async () => {
    await fetch("/api/notaire/logout", { method: "POST" });
    router.push("/notaire/login");
  };

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/consultation/${token}`;
    await navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="container-page py-8"><div className="card p-6 text-center text-muted">Chargement…</div></div>;

  const stats = {
    total: requests.length,
    nouvelle: requests.filter((r) => r.status === "Nouvelle").length,
    encours: requests.filter((r) => r.status === "En cours").length,
    terminee: requests.filter((r) => r.status === "Terminée").length,
  };

  return (
    <div className="container-page py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-h1 tracking-[-0.02em]">Espace notaire</h1>
          <p className="text-[14px] text-muted">
            {notaire?.full_name}
            {notaire?.study_name ? ` — ${notaire.study_name}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/cnp" className="btn btn-primary h-10 text-[13px]">Nouvelle demande</a>
          <button type="button" className="btn btn-ghost h-10 text-[12.5px]" onClick={logout}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Nouvelles", value: stats.nouvelle },
          { label: "En cours", value: stats.encours },
          { label: "Terminées", value: stats.terminee },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">{s.label}</p>
            <p className="mt-1 text-[22px] font-extrabold text-[var(--brand)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Requests table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Titre foncier</th>
                <th>Statut</th>
                <th>Résultat</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-6">
                    Aucune demande pour le moment.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td className="font-bold text-[12px]">{r.reference}</td>
                    <td>{r.title_number}</td>
                    <td>
                      <span className={`badge ${r.status === "Terminée" ? "badge-success" : "badge-brand"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="font-bold">
                      {r.result_grand_total ? `${r.result_grand_total} DH` : "—"}
                    </td>
                    <td className="text-[11px]">{new Date(r.created_at).toLocaleString("fr-FR")}</td>
                    <td>
                      <div className="flex gap-1">
                        {r.status === "Terminée" ? (
                          <>
                            <a href={`/consultation/${r.citizen_token}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary h-8 text-[11.5px]">
                              <ExternalLink size={12} /> Voir
                            </a>
                            <button type="button" className="btn btn-ghost h-8 text-[11.5px]" onClick={() => copyLink(r.citizen_token)}>
                              {copied === r.citizen_token ? <Check size={12} /> : <Copy size={12} />}
                              {copied === r.citizen_token ? "Copié" : "Copier le lien"}
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-muted">En attente</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
