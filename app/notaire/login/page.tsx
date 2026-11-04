"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, ShieldCheck } from "lucide-react";

export default function NotaireLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const res = await fetch("/api/notaire/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || "Identifiants invalides.");
      setStatus("error");
      return;
    }
    router.push("/notaire/dashboard");
  };

  return (
    <div className="page">
      <div className="container-page">
        <div className="mx-auto max-w-md page-stack">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <ShieldCheck size={24} />
            </span>
            <h1 className="mt-4 text-h1 tracking-[-0.02em]">
              Connexion notaire
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted">
              Accédez à votre espace notaire et à vos demandes de consultation
              TNB.
            </p>
          </div>

          <div className="card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="form-stack">
              <label className="field">
                <span className="field-label">Adresse e-mail</span>
                <input
                  className="input"
                  type="email"
                  autoComplete="username"
                  placeholder="vous@etude.ma"
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
              {status === "error" && error ? (
                <p className="rounded-xl bg-[var(--warning-soft)] px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[var(--warning)]">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="btn btn-primary h-11 w-full disabled:opacity-70"
              >
                <LogIn size={15} />
                {status === "submitting" ? "Connexion…" : "Se connecter"}
              </button>
            </form>

            <div className="mt-6 border-t border-[var(--border)] pt-5 text-center text-[12.5px] text-muted">
              Pas encore de compte ?{" "}
              <Link
                href="/notaire/register"
                className="font-bold text-[var(--brand)] hover:underline"
              >
                Créer un compte notaire
              </Link>
            </div>
          </div>

          <p className="text-center text-[11.5px] text-muted">
            Accès réservé aux notaires inscrits. Vos données sont traitées de
            manière confidentielle.
          </p>
        </div>
      </div>
    </div>
  );
}
