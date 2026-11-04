"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  FileSearch,
  FileText,
  LogOut,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

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

function statusClass(status: string) {
  if (status === "Terminée") return "badge-success";
  if (status === "Ignorée" || status === "Annulée") return "badge-warning";
  return "badge-brand";
}

export default function NotaireDashboardPage() {
  const router = useRouter();
  const [notaire, setNotaire] = useState<{
    full_name: string;
    study_name: string | null;
    email: string;
  } | null>(null);
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/notaire/me").then((r) => r.json());
      if (!me.ok) {
        router.push("/notaire/login");
        return;
      }
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

  const stats = useMemo(
    () => ({
      total: requests.length,
      nouvelle: requests.filter((r) => r.status === "Nouvelle").length,
      encours: requests.filter((r) => r.status === "En cours").length,
      terminee: requests.filter((r) => r.status === "Terminée").length,
      autre: requests.filter(
        (r) => r.status === "Ignorée" || r.status === "Annulée",
      ).length,
    }),
    [requests],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesSearch =
        !q ||
        r.reference.toLowerCase().includes(q) ||
        r.title_number.toLowerCase().includes(q) ||
        (r.cnp_number ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const deleteRequest = async (id: number, reference: string) => {
    if (!window.confirm(`Supprimer définitivement la demande ${reference} ?`)) return;
    const res = await fetch(`/api/notaire/requests/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error || "Erreur de suppression");
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
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

  return (
    <div className="page">
      <div className="container-page page-stack">
        <div className="page-header">
          <div className="page-header-copy">
            <h1 className="text-h1 tracking-[-0.02em]">Espace notaire</h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
              {notaire?.full_name}
              {notaire?.study_name ? ` — ${notaire.study_name}` : ""}
            </p>
          </div>
          <div className="page-header-actions">
            <Link href="/cnp" className="btn btn-primary h-10 text-[12.5px]">
              <Plus size={14} />
              Nouvelle demande
            </Link>
            <button
              type="button"
              className="btn btn-ghost h-10 text-[12.5px]"
              onClick={logout}
            >
              <LogOut size={14} />
              Déconnexion
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Total", value: stats.total },
            { label: "Nouvelles", value: stats.nouvelle },
            { label: "En cours", value: stats.encours },
            { label: "Terminées", value: stats.terminee },
            { label: "Ignorées / annulées", value: stats.autre },
          ].map((item) => (
            <div key={item.label} className="card px-4 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                {item.label}
              </p>
              <p className="mt-1 text-[22px] font-extrabold leading-none text-[var(--brand)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
            <label className="relative block">
              <span className="sr-only">Rechercher une demande</span>
              <Search
                size={16}
                className="pointer-events-none absolute inset-y-0 start-3.5 my-auto text-muted"
              />
              <input
                className="input ps-10"
                placeholder="Rechercher (référence, titre, CNP)…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="sr-only">Filtrer par statut</span>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="Nouvelle">Nouvelle</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Ignorée">Ignorée</option>
                <option value="Annulée">Annulée</option>
              </select>
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card empty-state">
            <FileSearch size={28} />
            <p className="text-[13px] font-semibold text-[var(--text)]">
              Aucune demande
            </p>
            <p className="max-w-sm text-[12px]">
              {requests.length === 0
                ? "Vous n'avez pas encore soumis de demande de consultation TNB."
                : "Aucune demande ne correspond à votre recherche."}
            </p>
            {requests.length === 0 ? (
              <Link href="/cnp" className="btn btn-primary mt-2 h-10 text-[12.5px]">
                <Plus size={14} />
                Créer une demande
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
              {filtered.map((r) => (
                <div key={r.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="wrap-anywhere text-[13px] font-extrabold">
                        {r.reference}
                      </p>
                      <p className="mt-1 text-[12px] text-muted">
                        Titre : {r.title_number}
                      </p>
                    </div>
                    <span className={`badge shrink-0 ${statusClass(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11.5px]">
                    <div>
                      <dt className="font-bold uppercase tracking-[0.06em] text-muted">
                        Résultat
                      </dt>
                      <dd className="mt-0.5 font-semibold">
                        {r.result_grand_total
                          ? `${r.result_grand_total} DH`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-[0.06em] text-muted">
                        Mise à jour
                      </dt>
                      <dd className="mt-0.5">
                        {new Date(r.updated_at).toLocaleDateString("fr-FR")}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                    <>
                      <Link
                        href={`/notaire/requests/${r.id}`}
                        className="btn btn-primary h-9 flex-1 text-[12px]"
                      >
                        <FileText size={13} />
                        Voir le détail
                      </Link>
                      {r.status === "Terminée" ? (
                        <button
                          type="button"
                          className="btn btn-secondary h-9 text-[12px]"
                          onClick={() => copyLink(r.citizen_token)}
                        >
                          {copied === r.citizen_token ? (
                            <Check size={13} />
                          ) : (
                            <Copy size={13} />
                          )}
                          {copied === r.citizen_token ? "Copié" : "Copier le lien"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn btn-ghost h-9 text-[12px] text-[var(--danger)]"
                        onClick={() => deleteRequest(r.id, r.reference)}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="card hidden overflow-hidden sm:block">
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
                    {filtered.map((r) => (
                      <tr key={r.id}>
                        <td className="font-bold">{r.reference}</td>
                        <td>{r.title_number}</td>
                        <td>
                          <span className={`badge ${statusClass(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="font-bold">
                          {r.result_grand_total
                            ? `${r.result_grand_total} DH`
                            : "—"}
                        </td>
                        <td className="text-[11px] whitespace-nowrap">
                          {new Date(r.created_at).toLocaleString("fr-FR")}
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            <Link
                              href={`/notaire/requests/${r.id}`}
                              className="btn btn-secondary h-8 text-[11.5px]"
                            >
                              <FileText size={12} />
                              Détail
                            </Link>
                            {r.status === "Terminée" ? (
                              <button
                                type="button"
                                className="btn btn-ghost h-8 text-[11.5px]"
                                onClick={() => copyLink(r.citizen_token)}
                              >
                                {copied === r.citizen_token ? (
                                  <Check size={12} />
                                ) : (
                                  <Copy size={12} />
                                )}
                                {copied === r.citizen_token
                                  ? "Copié"
                                  : "Copier le lien"}
                              </button>
                            ) : (
                              <span className="text-[11px] text-muted">
                                En attente
                              </span>
                            )}
                            <button
                              type="button"
                              className="btn btn-ghost h-8 text-[11.5px] text-[var(--danger)]"
                              onClick={() => deleteRequest(r.id, r.reference)}
                              aria-label="Supprimer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
