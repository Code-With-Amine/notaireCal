"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  FileSearch,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
interface Request {
  id: number;
  reference: string;
  title_number: string;
  cnp_number: string | null;
  email: string;
  notaire_name: string | null;
  notaire_study: string | null;
  status: string;
  result_amount: string | null;
  result_note: string | null;
  created_at: string;
}

const STATUS_FILTERS = [
  "all",
  "Nouvelle",
  "En cours",
  "Terminée",
  "Ignorée",
  "Annulée",
] as const;

function statusClass(status: string) {
  if (status === "Terminée") return "badge-success";
  if (status === "Ignorée" || status === "Annulée") return "badge-warning";
  return "badge-brand";
}

export function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesSearch =
        !q ||
        r.reference.toLowerCase().includes(q) ||
        r.title_number.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.notaire_name ?? "").toLowerCase().includes(q) ||
        (r.notaire_study ?? "").toLowerCase().includes(q) ||
        (r.cnp_number ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      nouvelle: requests.filter((r) => r.status === "Nouvelle").length,
      encours: requests.filter((r) => r.status === "En cours").length,
      terminee: requests.filter((r) => r.status === "Terminée").length,
      ignoree: requests.filter((r) => r.status === "Ignorée").length,
      annulee: requests.filter((r) => r.status === "Annulée").length,
    }),
    [requests],
  );

  const checkAuth = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/requests");
    setAuthed(res.ok);
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setLoginError(data.error || "Échec de connexion");
      return;
    }
    setAuthed(true);
    checkAuth();
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setRequests([]);
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    checkAuth();
  };

  const deleteRequest = async (id: number, reference: string) => {
    if (!window.confirm(`Supprimer définitivement la demande ${reference} ?`)) return;
    const res = await fetch(`/api/admin/requests/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.ok) {
      alert(data.error || "Erreur de suppression");
      return;
    }
    checkAuth();
  };

  if (authed === null) {
    return (
      <div className="card p-6 text-center text-muted">Chargement…</div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto w-full max-w-md py-4 sm:py-10">
        <div className="card p-6 sm:p-8">
          <div className="mb-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <ShieldCheck size={24} />
            </span>
            <h1 className="mt-4 text-h2 font-extrabold tracking-[-0.02em]">
              Administration Daribati
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              Accès réservé aux administrateurs.
            </p>
          </div>
          <form onSubmit={login} className="form-stack">
            <label className="field">
              <span className="field-label">Adresse e-mail</span>
              <input
                className="input"
                type="email"
                autoComplete="username"
                placeholder="admin@exemple.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span className="field-label">Mot de passe</span>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {loginError ? (
              <p className="rounded-xl bg-[var(--warning-soft)] px-3.5 py-2.5 text-[12.5px] text-[var(--warning)]">
                {loginError}
              </p>
            ) : null}
            <button type="submit" className="btn btn-primary h-11 w-full">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div className="page-header-copy">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <ShieldCheck size={20} />
            </span>
            <h1 className="text-h2 font-extrabold tracking-[-0.02em]">
              Administration
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
            Suivez et traitez les demandes de consultation TNB de tous les
            notaires.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary h-10 text-[12.5px]"
            onClick={checkAuth}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Total", value: stats.total },
          { label: "Nouvelles", value: stats.nouvelle },
          { label: "En cours", value: stats.encours },
          { label: "Terminées", value: stats.terminee },
          { label: "Ignorées", value: stats.ignoree },
          { label: "Annulées", value: stats.annulee },
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
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
          <label className="relative block">
            <span className="sr-only">Rechercher une demande</span>
            <Search
              size={16}
              className="pointer-events-none absolute inset-y-0 start-3.5 my-auto text-muted"
            />
            <input
              className="input ps-10"
              placeholder="Rechercher (référence, titre, CIN, notaire, e-mail)…"
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
              {STATUS_FILTERS.map((value) => (
                <option key={value} value={value}>
                  {value === "all" ? "Tous les statuts" : value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-[11.5px] text-muted">
          {filtered.length} / {requests.length} demande(s) affichée(s)
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <FileSearch size={28} />
          <p className="text-[13px] font-semibold text-[var(--text)]">
            Aucune demande trouvée
          </p>
          <p className="max-w-sm text-[12px]">
            Modifiez votre recherche ou le filtre de statut pour afficher
            d&apos;autres demandes.
          </p>
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
                      Notaire
                    </dt>
                    <dd className="mt-0.5 truncate">{r.notaire_name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold uppercase tracking-[0.06em] text-muted">
                      CNP
                    </dt>
                    <dd className="mt-0.5">{r.cnp_number || "—"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-bold uppercase tracking-[0.06em] text-muted">
                      E-mail
                    </dt>
                    <dd className="mt-0.5 break-all">{r.email}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-bold uppercase tracking-[0.06em] text-muted">
                      Date
                    </dt>
                    <dd className="mt-0.5">
                      {new Date(r.created_at).toLocaleString("fr-FR")}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                  <Link
                    href={`/admin/${r.id}`}
                    className="btn btn-primary h-9 flex-1 text-[12px]"
                  >
                    Ouvrir
                    <ArrowUpRight size={13} />
                  </Link>
                  {r.status === "Nouvelle" ? (
                    <button
                      type="button"
                      className="btn btn-secondary h-9 text-[12px]"
                      onClick={() => updateStatus(r.id, "En cours")}
                    >
                      Démarrer
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
                    <th>Notaire</th>
                    <th>CNP</th>
                    <th>E-mail</th>
                    <th>Statut</th>
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
                        <span className="block font-semibold">
                          {r.notaire_name || "—"}
                        </span>
                        {r.notaire_study ? (
                          <span className="mt-0.5 block text-[11px] text-muted">
                            {r.notaire_study}
                          </span>
                        ) : null}
                      </td>
                      <td>{r.cnp_number || "—"}</td>
                      <td className="break-all">{r.email}</td>
                      <td>
                        <span className={`badge ${statusClass(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="text-[11px] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString("fr-FR")}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          <Link
                            href={`/admin/${r.id}`}
                            className="btn btn-secondary h-8 text-[11.5px]"
                          >
                            Ouvrir
                          </Link>
                          {r.status === "Nouvelle" ? (
                            <button
                              type="button"
                              className="btn btn-ghost h-8 text-[11.5px]"
                              onClick={() => updateStatus(r.id, "En cours")}
                            >
                              Démarrer
                            </button>
                          ) : null}
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
  );
}
