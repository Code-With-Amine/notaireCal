"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ShieldCheck } from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";

export default function NotaireRegisterPage() {
  const { t } = useApp();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [studyName, setStudyName] = useState("");
  const [cin, setCin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); setStatus("error"); return; }
    if (!consent) { setError("Vous devez accepter les conditions."); setStatus("error"); return; }
    setStatus("submitting");
    setError("");
    const res = await fetch("/api/notaire/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, studyName, cin, email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.error || "Erreur d'inscription.");
      setStatus("error");
      return;
    }
    setStatus("success");
    setTimeout(() => router.push("/notaire/login"), 1500);
  };

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="space-y-1">
          <h1 className="text-h1 tracking-[-0.02em]">Inscription notaire</h1>
          <p className="text-[14px] text-muted">
            Créez votre compte pour accéder à vos demandes de consultation TNB.
          </p>
        </div>

        {status === "success" ? (
          <div className="card p-6 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-soft)]">
              <ShieldCheck size={28} className="text-[var(--success)]" />
            </div>
            <h2 className="text-[18px] font-bold">Compte créé avec succès</h2>
            <p className="text-[13px] text-muted">Redirection vers la connexion…</p>
          </div>
        ) : (
          <div className="card p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold text-muted">Nom complet *</span>
                <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold text-muted">Nom de l'étude notariale (optionnel)</span>
                <input className="input" value={studyName} onChange={(e) => setStudyName(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold text-muted">CIN *</span>
                <input className="input" value={cin} onChange={(e) => setCin(e.target.value)} placeholder="Ex. : AB123456" required />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold text-muted">Adresse e-mail *</span>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold text-muted">Mot de passe * (8 caractères min.)</span>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[12px] font-bold text-muted">Confirmer le mot de passe *</span>
                <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </label>
              <label className="flex items-start gap-2 text-[12.5px] font-semibold">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                <span>J'accepte les conditions générales et la politique de confidentialité.</span>
              </label>
              {status === "error" && error ? (
                <p className="rounded-xl bg-[var(--warning-soft)] px-3 py-2 text-[12px] text-[var(--warning)]">{error}</p>
              ) : null}
              <button type="submit" disabled={status === "submitting"} className="btn btn-primary h-10 w-full disabled:opacity-70">
                <UserPlus size={14} /> {status === "submitting" ? "Inscription…" : "Créer mon compte"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
