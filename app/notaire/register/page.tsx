"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, UserPlus } from "lucide-react";

export default function NotaireRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [studyName, setStudyName] = useState("");
  const [cin, setCin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      setStatus("error");
      return;
    }
    if (!consent) {
      setError("Vous devez accepter les conditions d'utilisation.");
      setStatus("error");
      return;
    }
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
    <div className="page">
      <div className="container-page">
        <div className="mx-auto max-w-lg page-stack">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <UserPlus size={24} />
            </span>
            <h1 className="mt-4 text-h1 tracking-[-0.02em]">
              Inscription notaire
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
              Créez votre compte pour soumettre et suivre vos demandes de
              consultation TNB.
            </p>
          </div>

          {status === "success" ? (
            <div className="card p-6 text-center space-y-4 sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-soft)]">
                <ShieldCheck size={28} className="text-[var(--success)]" />
              </div>
              <h2 className="text-[18px] font-bold">
                Compte créé avec succès
              </h2>
              <p className="text-[13px] text-muted">
                Redirection vers la page de connexion…
              </p>
            </div>
          ) : (
            <div className="card p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="form-stack">
                <label className="field">
                  <span className="field-label">
                    Nom complet <span className="text-[var(--danger)]">*</span>
                  </span>
                  <input
                    className="input"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex. : Amina El Idrissi"
                    required
                  />
                </label>

                <label className="field">
                  <span className="field-label">
                    Nom de l&apos;étude notariale{" "}
                    <span className="font-normal text-muted">(optionnel)</span>
                  </span>
                  <input
                    className="input"
                    value={studyName}
                    onChange={(e) => setStudyName(e.target.value)}
                    placeholder="Ex. : Étude notariale El Idrissi"
                  />
                </label>

                <label className="field">
                  <span className="field-label">
                    CIN <span className="text-[var(--danger)]">*</span>
                  </span>
                  <input
                    className="input"
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    placeholder="Ex. : AB123456"
                    autoComplete="off"
                    required
                  />
                  <span className="mt-1.5 block text-[11.5px] text-muted">
                    Format marocain : 1 à 2 lettres suivies de 5 ou 6 chiffres.
                  </span>
                </label>

                <label className="field">
                  <span className="field-label">
                    Adresse e-mail{" "}
                    <span className="text-[var(--danger)]">*</span>
                  </span>
                  <input
                    className="input"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@etude.ma"
                    required
                  />
                </label>

                <div className="form-grid">
                  <label className="field">
                    <span className="field-label">
                      Mot de passe{" "}
                      <span className="text-[var(--danger)]">*</span>
                    </span>
                    <input
                      className="input"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8 caractères minimum"
                      minLength={8}
                      required
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">
                      Confirmation{" "}
                      <span className="text-[var(--danger)]">*</span>
                    </span>
                    <input
                      className="input"
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      minLength={8}
                      required
                    />
                  </label>
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
                  />
                  <span className="text-[12.5px] leading-relaxed text-[var(--text-soft)]">
                    J&apos;accepte les conditions générales et la politique de
                    confidentialité de Daribati.
                  </span>
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
                  <UserPlus size={15} />
                  {status === "submitting"
                    ? "Inscription…"
                    : "Créer mon compte"}
                </button>
              </form>

              <div className="mt-6 border-t border-[var(--border)] pt-5 text-center text-[12.5px] text-muted">
                Déjà inscrit ?{" "}
                <Link
                  href="/notaire/login"
                  className="font-bold text-[var(--brand)] hover:underline"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
