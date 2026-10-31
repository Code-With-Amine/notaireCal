"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, LogOut, RefreshCw } from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";

interface Request {
  id: number;
  reference: string;
  title_number: string;
  cnp_number: string | null;
  email: string;
  status: string;
  result_amount: string | null;
  result_note: string | null;
  created_at: string;
}

export function AdminDashboard() {
  const { t } = useApp();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.reference.toLowerCase().includes(q) ||
      r.title_number.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const checkAuth = async () => {
    const res = await fetch("/api/admin/requests");
    setAuthed(res.ok);
    if (res.ok) {
      const data = await res.json();
      setRequests(data.requests || []);
    }
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

  if (authed === null) {
    return <div className="card p-6 text-center text-muted">Chargement…</div>;
  }

  if (!authed) {
    return (
      <div className="card p-6 max-w-md mx-auto space-y-3">
        <SectionHeading icon={ShieldCheck} title="Administration Daribati" description="Accès réservé." />
        <form onSubmit={login} className="space-y-3">
          <input className="input" type="email" placeholder="E-mail admin" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
          {loginError ? <p className="text-[12px] text-[var(--danger)]">{loginError}</p> : null}
          <button type="submit" className="btn btn-primary h-10">Se connecter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeading icon={ShieldCheck} title="Demandes de consultation TNB" description={`${filtered.length} / ${requests.length} demande(s)`} />
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary h-9 text-[12.5px]" onClick={checkAuth} disabled={loading}>
            <RefreshCw size={14} /> Actualiser
          </button>
          <button type="button" className="btn btn-ghost h-9 text-[12.5px]" onClick={logout}>
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex flex-wrap gap-2">
        <input
          className="input max-w-xs"
          placeholder="Rechercher (référence, titre, e-mail)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[180px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="Nouvelle">Nouvelle</option>
          <option value="En cours">En cours</option>
          <option value="Terminée">Terminée</option>
          <option value="Ignorée">Ignorée</option>
          <option value="Annulée">Annulée</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-6 text-center text-muted">Aucune demande.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Titre foncier</th>
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
                    <td>{r.cnp_number || "—"}</td>
                    <td>{r.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.status === "Terminée"
                            ? "badge-success"
                            : r.status === "Ignorée" || r.status === "Annulée"
                              ? "badge-warning"
                              : "badge-brand"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="text-[11px]">{new Date(r.created_at).toLocaleString("fr-FR")}</td>
                    <td>
                      <div className="flex gap-1">
                        <a href={`/admin/${r.id}`} className="btn btn-secondary h-8 text-[11.5px]">
                          Ouvrir
                        </a>
                        {r.status === "pending" || r.status === "Nouvelle" ? (
                          <button className="btn btn-secondary h-8 text-[11.5px]" onClick={() => updateStatus(r.id, "processing")}>
                            En cours
                          </button>
                        ) : null}
                        {r.status !== "completed" ? (
                          <button className="btn btn-primary h-8 text-[11.5px]" onClick={() => updateStatus(r.id, "completed")}>
                            Terminer
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
