"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";

export default function NotaireLoginPage() {
  const { t } = useApp();
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
    <div className="container-page py-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-1">
          <h1 className="text-h1 tracking-[-0.02em]">Connexion notaire</h1>
          <p className="text-[14px] text-muted">
            Accédez à votre espace notaire et à vos demandes de consultation TNB.
          </p>
        </div>
        <div className="card p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-bold text-muted">Adresse e-mail</span>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-bold text-muted">Mot de passe</span>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            {status === "error" && error ? (
              <p className="rounded-xl bg-[var(--warning-soft)] px-3 py-2 text-[12px] text-[var(--warning)]">{error}</p>
            ) : null}
            <button type="submit" disabled={status === "submitting"} className="btn btn-primary h-10 w-full disabled:opacity-70">
              <LogIn size={14} /> {status === "submitting" ? "Connexion…" : "Se connecter"}
            </button>
          </form>
          <p className="text-[12px] text-muted text-center">
            Pas encore de compte ?{" "}
            <a href="/notaire/register" className="font-semibold text-[var(--brand)] hover:underline">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
