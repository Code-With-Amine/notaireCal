"use client";

import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  Info,
  Mail,
  ShieldCheck,
  Clock,
  Hash,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";

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
    } catch {
      setErrorMessage("Erreur réseau. Veuillez réessayer.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card p-8 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success-soft)]">
            <CheckCircle2 size={32} className="text-[var(--success)]" />
          </div>
          <h2 className="text-[24px] font-extrabold tracking-[-0.02em]">
            Demande enregistrée
          </h2>
          <p className="text-[14px] text-muted">
            Votre demande de consultation TNB a bien été transmise à
            l'administration.
          </p>
          <div className="mx-auto inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5">
            <Hash size={14} className="text-[var(--brand)]" />
            <span className="text-[13px] font-bold text-[var(--text)]">
              {reference}
            </span>
          </div>
          <div className="space-y-2 text-left text-[13px] text-muted">
            <p className="flex items-start gap-2">
              <Mail size={14} className="mt-0.5 shrink-0 text-[var(--brand)]" />
              Le résultat vous sera communiqué par e-mail à l'adresse indiquée.
            </p>
            <p className="flex items-start gap-2">
              <Clock size={14} className="mt-0.5 shrink-0 text-[var(--brand)]" />
              La vérification est effectuée manuellement par l'administration.
            </p>
            <p className="flex items-start gap-2">
              <Info size={14} className="mt-0.5 shrink-0 text-[var(--brand)]" />
              Conservez votre référence pour tout suivi ultérieur.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary h-10 text-[13px]"
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page introduction */}
      <div className="space-y-2">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em] sm:text-[32px]">
          Consultation TNB — vérification manuelle
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-muted">
          Service administratif distinct du simulateur TNB. L'administration
          vérifie manuellement les informations relatives à votre terrain non
          bâti et vous communique le résultat par e-mail.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Form column */}
        <div className="card p-6 sm:p-8 space-y-5">
          <SectionHeading
            icon={FileText}
            title="Formulaire de demande"
            description="Renseignez les informations ci-dessous. Les champs marqués d'un astérisque sont obligatoires."
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title number */}
            <div className="space-y-1.5">
              <label
                htmlFor="titleNumber"
                className="block text-[13px] font-semibold text-[var(--text)]"
              >
                Numéro du titre foncier{" "}
                <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="titleNumber"
                className="input"
                value={titleNumber}
                onChange={(e) => setTitleNumber(e.target.value)}
                placeholder="Ex. : TF-12345"
                required
              />
              <p className="text-[11.5px] text-muted">
                Numéro figurant sur votre titre foncier.
              </p>
            </div>

            {/* CNP number */}
            <div className="space-y-1.5">
              <label
                htmlFor="cnpNumber"
                className="block text-[13px] font-semibold text-[var(--text)]"
              >
                Numéro CNP{" "}
                <span className="text-[11px] font-normal text-muted">
                  (optionnel)
                </span>
              </label>
              <input
                id="cnpNumber"
                className="input"
                value={cnpNumber}
                onChange={(e) => setCnpNumber(e.target.value)}
                placeholder="Ex. : CNP-98765"
              />
              <p className="text-[11.5px] text-muted">
                Numéro CNP associé au bien, si disponible.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[13px] font-semibold text-[var(--text)]"
              >
                Adresse e-mail{" "}
                <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
              />
              <p className="text-[11.5px] text-muted">
                Le résultat vous sera communiqué à cette adresse.
              </p>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]"
              />
              <span className="text-[12.5px] leading-relaxed text-[var(--text-soft)]">
                J'accepte le traitement de mes données personnelles pour cette
                demande de consultation, conformément à la politique de
                confidentialité.
              </span>
            </label>

            {status === "error" && errorMessage ? (
              <div className="rounded-xl bg-[var(--warning-soft)] px-4 py-3 text-[12.5px] text-[var(--warning)]">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="btn btn-primary h-11 w-full text-[14px] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            >
              {status === "submitting" ? "Envoi en cours…" : "Envoyer ma demande"}
            </button>
          </form>
        </div>

        {/* Info column */}
        <aside className="space-y-4">
          <div className="card p-6 space-y-3">
            <h3 className="text-[15px] font-bold text-[var(--text)]">
              Comment ça fonctionne
            </h3>
            <ul className="space-y-2.5 text-[13px] leading-relaxed text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                Renseignez le titre foncier et, si disponible, le numéro CNP.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                Une référence unique est générée pour votre demande.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                L'administration vérifie manuellement les informations.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                Le résultat vous est communiqué par e-mail.
              </li>
            </ul>
          </div>

          <div className="card p-6 space-y-3">
            <h3 className="text-[15px] font-bold text-[var(--text)]">
              À savoir
            </h3>
            <p className="text-[12.5px] leading-relaxed text-muted">
              Daribati n'est pas connecté automatiquement à la base de données
              communale. La vérification est effectuée manuellement par
              l'administration. Conservez votre référence pour tout suivi.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
