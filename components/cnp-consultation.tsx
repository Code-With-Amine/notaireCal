"use client";

import { useState } from "react";
import { FileText, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";
// Email is now sent server-side via /api/consultations

export function CnpConsultation() {
  const { t } = useApp();
  const [titleNumber, setTitleNumber] = useState("");
  const [cnpNumber, setCnpNumber] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [reference, setReference] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validate = () => {
    if (!titleNumber.trim()) return "Le numéro du titre foncier est obligatoire.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "L'adresse e-mail est invalide.";
    if (!consent) return "Vous devez accepter le traitement des données.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMessage(err);
      setStatus("error");
      return;
    }
    setErrorMessage("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleNumber: titleNumber.trim(),
          cnpNumber: cnpNumber.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || "L'enregistrement a échoué.");
        setStatus("error");
        return;
      }
      setReference(data.reference);
      setStatus("success");
    } catch (e) {
      setErrorMessage("Erreur réseau. Veuillez réessayer.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="card p-6 text-center space-y-3">
        <CheckCircle2 size={40} className="mx-auto text-[var(--success)]" />
        <h2 className="text-[20px] font-extrabold">Demande enregistrée</h2>
        <p className="text-[13px] text-muted">
          Votre demande a bien été transmise. Référence :{" "}
          <span className="font-bold text-[var(--text)]">{reference}</span>
        </p>
        <p className="text-[12px] text-muted">
          Le résultat vous sera communiqué par e-mail.
        </p>
        <button
          type="button"
          className="btn btn-secondary h-9 text-[12.5px]"
          onClick={() => {
            setStatus("idle");
            setTitleNumber("");
            setCnpNumber("");
            setEmail("");
            setConsent(false);
            setReference("");
          }}
        >
          Nouvelle demande
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6">
        <SectionHeading
          icon={FileText}
          title="Consultation TNB — vérification manuelle"
          description="Service administratif distinct du simulateur TNB. Le résultat est vérifié manuellement par l'administration."
        />
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">
              Numéro du titre foncier *
            </span>
            <input
              className="input"
              value={titleNumber}
              onChange={(e) => setTitleNumber(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">
              Numéro CNP (optionnel)
            </span>
            <input
              className="input"
              value={cnpNumber}
              onChange={(e) => setCnpNumber(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">
              Adresse e-mail *
            </span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex items-start gap-2 text-[12.5px] font-semibold">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            <span>
              J'accepte le traitement de mes données pour cette demande de
              consultation.
            </span>
          </label>

          {status === "error" && errorMessage ? (
            <p className="rounded-xl bg-[var(--warning-soft)] px-3 py-2 text-[12px] text-[var(--warning)]">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="btn btn-primary h-10 disabled:cursor-wait disabled:opacity-70"
          >
            {status === "submitting" ? "Envoi en cours…" : "Envoyer la demande"}
          </button>
        </form>
      </div>

      <div className="card p-4 text-[11.5px] text-muted">
        <ShieldCheck size={13} className="me-1.5 inline" />
        Les résultats sont vérifiés manuellement. Daribati n'est pas connecté
        automatiquement à la base de données communale.
      </div>
    </div>
  );
}
