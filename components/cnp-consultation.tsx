"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  Info,
  Clock,
  Hash,
  User,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";

export function CnpConsultation() {
  const { t } = useApp();
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [notaireName, setNotaireName] = useState("");
  const [titleNumber, setTitleNumber] = useState("");
  const [cnpNumber, setCnpNumber] = useState("");
  const [cin, setCin] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [reference, setReference] = useState("");
  const [accessUrl, setAccessUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/notaire/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setAuthed(true);
          setNotaireName(d.notaire.full_name);
          setCin(d.notaire.cin);
        } else {
          setAuthed(false);
        }
      })
      .catch(() => setAuthed(false));
  }, []);

  const validate = () => {
    if (!titleNumber.trim()) return "Le numéro du titre foncier est obligatoire.";
    if (!cin.trim()) return "Le CIN est obligatoire.";
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
          cin: cin.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || "L'enregistrement a échoué.");
        setStatus("error");
        return;
      }
      setReference(data.reference);
      setAccessUrl(data.accessUrl || "");
      setStatus("success");
    } catch {
      setErrorMessage("Erreur réseau. Veuillez réessayer.");
      setStatus("error");
    }
  };

  if (authed === null) {
    return (
      <div className="container-page py-8">
        <div className="card p-6 text-center text-muted">Chargement…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="container-page py-8">
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-1">
            <h1 className="text-h1 tracking-[-0.02em]">Consultation TNB</h1>
            <p className="text-[14px] text-muted">
              Vous devez être connecté en tant que notaire pour soumettre une demande.
            </p>
          </div>
          <div className="card p-6 space-y-3 text-center">
            <User size={32} className="mx-auto text-[var(--brand)]" />
            <a href="/notaire/login" className="btn btn-primary h-10">
              Se connecter
            </a>
            <p className="text-[12px] text-muted">
              Pas encore de compte ?{" "}
              <a href="/notaire/register" className="font-semibold text-[var(--brand)] hover:underline">
                Créer un compte notaire
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="container-page py-8">
        <div className="mx-auto max-w-2xl">
          <div className="card p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success-soft)]">
              <CheckCircle2 size={32} className="text-[var(--success)]" />
            </div>
            <h2 className="text-[20px] font-bold">Demande enregistrée</h2>
            <p className="text-[14px] text-muted">
              Votre demande de consultation TNB a bien été transmise à l'administration.
            </p>
            <div className="mx-auto inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-2.5">
              <Hash size={14} className="text-[var(--brand)]" />
              <span className="text-[13px] font-bold text-[var(--text)]">{reference}</span>
            </div>
            {accessUrl ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-left space-y-2">
                <p className="text-[12.5px] font-semibold text-[var(--text)]">Lien d'accès sécurisé à votre demande :</p>
                <a href={accessUrl} className="block break-all text-[12px] text-[var(--brand)] underline">
                  {typeof window !== "undefined" ? window.location.origin + accessUrl : accessUrl}
                </a>
                <p className="text-[11.5px] text-muted">
                  Conservez ce lien précieusement. Il vous permet de consulter le résultat une fois la demande traitée.
                </p>
              </div>
            ) : null}
            <div className="space-y-2 text-left text-[13px] text-muted">
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
                setConsent(false);
                setReference("");
                setAccessUrl("");
              }}
            >
              Nouvelle demande
            </button>
          </div>
        </div>
      </div>
      );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-h1 tracking-[-0.02em]">Consultation TNB</h1>
        <p className="text-[14px] text-muted">
          Soumettez une demande de vérification manuelle pour un terrain non bâti. Connecté en tant que{" "}
          <span className="font-semibold">{notaireName}</span>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-6 sm:p-8 space-y-5">
          <SectionHeading
            icon={FileText}
            title="Formulaire de demande"
            description="Renseignez les informations ci-dessous. Les champs marqués d'un astérisque sont obligatoires."
          />
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="titleNumber" className="block text-[13px] font-semibold text-[var(--text)]">
                Numéro du titre foncier <span className="text-[var(--danger)]">*</span>
              </label>
              <input id="titleNumber" className="input" value={titleNumber} onChange={(e) => setTitleNumber(e.target.value)} placeholder="Ex. : TF-12345" required />
              <p className="text-[11.5px] text-muted">Numéro figurant sur votre titre foncier.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cnpNumber" className="block text-[13px] font-semibold text-[var(--text)]">
                Numéro CNP <span className="text-[11px] font-normal text-muted">(optionnel)</span>
              </label>
              <input id="cnpNumber" className="input" value={cnpNumber} onChange={(e) => setCnpNumber(e.target.value)} placeholder="Ex. : CNP-98765" />
              <p className="text-[11.5px] text-muted">Numéro CNP associé au bien, si disponible.</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="cin" className="block text-[13px] font-semibold text-[var(--text)]">
                CIN <span className="text-[var(--danger)]">*</span>
              </label>
              <input id="cin" className="input" value={cin} onChange={(e) => setCin(e.target.value)} placeholder="Ex. : AB123456" required />
              <p className="text-[11.5px] text-muted">Votre CIN tel que figurant sur votre compte notaire.</p>
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand)]" />
              <span className="text-[12.5px] leading-relaxed text-[var(--text-soft)]">
                J'accepte le traitement de mes données personnelles pour cette demande de consultation.
              </span>
            </label>
            {status === "error" && errorMessage ? (
              <div className="rounded-xl bg-[var(--warning-soft)] px-4 py-3 text-[12.5px] text-[var(--warning)]">{errorMessage}</div>
            ) : null}
            <button type="submit" disabled={status === "submitting"} className="btn btn-primary h-11 w-full text-[14px] disabled:opacity-70 sm:w-auto">
              {status === "submitting" ? "Envoi en cours…" : "Envoyer ma demande"}
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="card p-6 space-y-3">
            <h3 className="text-[15px] font-bold text-[var(--text)]">Comment ça fonctionne</h3>
            <ul className="space-y-2.5 text-[13px] leading-relaxed text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                Renseignez le titre foncier et votre CIN.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                Une référence unique et un lien d'accès sécurisé sont générés.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                L'administration vérifie manuellement les informations.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                Le résultat est consultable depuis votre espace notaire et via le lien partageable.
              </li>
            </ul>
          </div>
          <div className="card p-6 space-y-3">
            <h3 className="text-[15px] font-bold text-[var(--text)]">À savoir</h3>
            <p className="text-[12.5px] leading-relaxed text-muted">
              Daribati n'est pas connecté automatiquement à la base de données communale. La vérification est effectuée manuellement par l'administration.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
