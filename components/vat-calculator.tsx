"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calculator,
  FileText,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import { Money, SectionHeading } from "@/components/ui";
import { formatMoney, formatNumber, parseNumber } from "@/lib/format";
import {
  VAT_RATE_RECORDS,
  calculateSimpleVat,
  calculateVatDeclaration,
  rateForStatus,
  type VatLine,
  type VatPurchaseLine,
  type VatStatus,
} from "@/lib/vat";

const STATUS_LABELS: Record<VatStatus, string> = {
  standard: "Taux normal 20%",
  reduced: "Taux réduit 10%",
  exemptWithDeduction: "Exonéré avec droit à déduction",
  exemptWithoutDeduction: "Exonéré sans droit à déduction",
  outOfScope: "Hors champ",
};

export function VatCalculator() {
  const { t, language } = useApp();
  const [tab, setTab] = useState<"simple" | "declaration">("simple");

  return (
    <div className="space-y-5">
      <div className="card p-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("simple")}
            className={`flex-1 rounded-xl px-3 py-2 text-[13px] font-bold transition ${
              tab === "simple"
                ? "bg-[var(--brand)] text-white"
                : "text-muted hover:bg-[var(--surface-2)]"
            }`}
          >
            <Calculator size={14} className="me-1.5 inline" />
            Calculateur TVA — HT / TTC
          </button>
          <button
            type="button"
            onClick={() => setTab("declaration")}
            className={`flex-1 rounded-xl px-3 py-2 text-[13px] font-bold transition ${
              tab === "declaration"
                ? "bg-[var(--brand)] text-white"
                : "text-muted hover:bg-[var(--surface-2)]"
            }`}
          >
            <FileText size={14} className="me-1.5 inline" />
            Simulateur de déclaration TVA
          </button>
        </div>
      </div>

      {tab === "simple" ? <SimpleVat /> : <DeclarationVat />}
    </div>
  );
}

function SimpleVat() {
  const { language } = useApp();
  const [direction, setDirection] = useState<
    "htToTtc" | "ttcToHt" | "vatToHtTtc"
  >("htToTtc");
  const [amount, setAmount] = useState("1000");
  const [status, setStatus] = useState<VatStatus>("standard");

  const result = useMemo(() => {
    return calculateSimpleVat({
      direction,
      amount: parseNumber(amount),
      status,
    });
  }, [direction, amount, status]);

  const rateRecord = VAT_RATE_RECORDS.find((r) => r.status === status);

  return (
    <div className="card p-5 sm:p-6 space-y-4">
      <SectionHeading
        icon={Calculator}
        title="Calculateur TVA — HT / TTC"
        description="Calculez le TTC à partir du HT, le HT à partir du TTC, ou le HT/TTC à partir du montant de TVA."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {(
          [
            ["htToTtc", "TTC à partir du HT"],
            ["ttcToHt", "HT à partir du TTC"],
            ["vatToHtTtc", "HT et TTC à partir de la TVA"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setDirection(key)}
            className={`rounded-xl border px-3 py-2 text-[12.5px] font-bold transition ${
              direction === key
                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                : "border-[var(--border)] text-muted hover:bg-[var(--surface-2)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-bold text-muted">
            {direction === "htToTtc"
              ? "Montant HT (DH)"
              : direction === "ttcToHt"
                ? "Montant TTC (DH)"
                : "Montant TVA (DH)"}
          </span>
          <input
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-bold text-muted">
            Taux / statut
          </span>
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as VatStatus)}
          >
            {VAT_RATE_RECORDS.map((r) => (
              <option key={r.status} value={r.status}>
                {STATUS_LABELS[r.status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
              Montant HT
            </p>
            <p className="mt-1 text-h3 font-extrabold">
              <Money value={result.ht} />
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
              TVA
            </p>
            <p className="mt-1 text-h3 font-extrabold text-[var(--brand)]">
              <Money value={result.vat} />
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
              Montant TTC
            </p>
            <p className="mt-1 text-h3 font-extrabold">
              <Money value={result.ttc} />
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] text-muted">
          Taux appliqué : {(result.rate * 100).toFixed(0)}% ·{" "}
          {rateRecord?.legalReference}
        </p>
        <p className="mt-1 rounded-xl bg-[var(--surface)] px-3 py-2 text-[11.5px] font-mono text-soft">
          {result.formula}
        </p>
      </div>

      <p className="text-[11px] text-muted">
        Les taux réduits et exonérations ne s'appliquent qu'aux opérations
        visées par la loi. En cas de doute sur la classification, confirmez
        auprès de l'administration fiscale.
      </p>
    </div>
  );
}

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

function DeclarationVat() {
  const [sales, setSales] = useState<VatLine[]>([
    { id: newId(), description: "Vente 1", amountHt: 1000, status: "standard" },
  ]);
  const [purchases, setPurchases] = useState<VatPurchaseLine[]>([
    { id: newId(), description: "Achat 1", amountHt: 400, status: "standard", deductible: true },
  ]);
  const [previousCredit, setPreviousCredit] = useState("0");
  const [applyProRata, setApplyProRata] = useState(false);
  const [proRata, setProRata] = useState("1");

  const result = useMemo(() => {
    return calculateVatDeclaration({
      periodLabel: "Période",
      sales,
      purchases,
      previousCredit: parseNumber(previousCredit),
      proRata: parseNumber(proRata),
      applyProRata,
    });
  }, [sales, purchases, previousCredit, proRata, applyProRata]);

  const updateSale = (id: string, patch: Partial<VatLine>) => {
    setSales((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };
  const updatePurchase = (id: string, patch: Partial<VatPurchaseLine>) => {
    setPurchases((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6 space-y-3">
        <SectionHeading
          icon={Receipt}
          title="Ventes — TVA collectée"
          description="Ajoutez vos ventes par ligne. Chaque ligne peut avoir un taux différent."
        />
        {sales.map((line) => (
          <div key={line.id} className="grid gap-2 sm:grid-cols-[1fr_120px_150px_40px]">
            <input
              className="input"
              value={line.description}
              onChange={(e) => updateSale(line.id, { description: e.target.value })}
              placeholder="Description"
            />
            <input
              className="input"
              value={line.amountHt}
              onChange={(e) =>
                updateSale(line.id, { amountHt: parseNumber(e.target.value) })
              }
              inputMode="decimal"
              placeholder="HT"
            />
            <select
              className="input"
              value={line.status}
              onChange={(e) => updateSale(line.id, { status: e.target.value as VatStatus })}
            >
              {VAT_RATE_RECORDS.map((r) => (
                <option key={r.status} value={r.status}>
                  {STATUS_LABELS[r.status]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-ghost btn-icon h-10 w-10"
              onClick={() => setSales((prev) => prev.filter((l) => l.id !== line.id))}
              aria-label="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary h-9 text-[12.5px]"
          onClick={() =>
            setSales((prev) => [
              ...prev,
              { id: newId(), description: `Vente ${prev.length + 1}`, amountHt: 0, status: "standard" },
            ])
          }
        >
          <Plus size={14} /> Ajouter une vente
        </button>
      </div>

      <div className="card p-5 sm:p-6 space-y-3">
        <SectionHeading
          icon={Receipt}
          title="Achats — TVA déductible"
          description="Seuls les achats donnant droit à déduction sont pris en compte."
        />
        {purchases.map((line) => (
          <div key={line.id} className="grid gap-2 sm:grid-cols-[1fr_120px_150px_110px_40px]">
            <input
              className="input"
              value={line.description}
              onChange={(e) =>
                updatePurchase(line.id, { description: e.target.value })
              }
              placeholder="Description"
            />
            <input
              className="input"
              value={line.amountHt}
              onChange={(e) =>
                updatePurchase(line.id, { amountHt: parseNumber(e.target.value) })
              }
              inputMode="decimal"
              placeholder="HT"
            />
            <select
              className="input"
              value={line.status}
              onChange={(e) =>
                updatePurchase(line.id, { status: e.target.value as VatStatus })
              }
            >
              {VAT_RATE_RECORDS.map((r) => (
                <option key={r.status} value={r.status}>
                  {STATUS_LABELS[r.status]}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-[12px] font-semibold">
              <input
                type="checkbox"
                checked={line.deductible}
                onChange={(e) =>
                  updatePurchase(line.id, { deductible: e.target.checked })
                }
              />
              Déductible
            </label>
            <button
              type="button"
              className="btn btn-ghost btn-icon h-10 w-10"
              onClick={() =>
                setPurchases((prev) => prev.filter((l) => l.id !== line.id))
              }
              aria-label="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary h-9 text-[12.5px]"
          onClick={() =>
            setPurchases((prev) => [
              ...prev,
              { id: newId(), description: `Achat ${prev.length + 1}`, amountHt: 0, status: "standard", deductible: true },
            ])
          }
        >
          <Plus size={14} /> Ajouter un achat
        </button>
      </div>

      <div className="card p-5 sm:p-6 space-y-3">
        <SectionHeading
          icon={Calculator}
          title="Paramètres avancés"
          description="Crédit antérieur et pro rata de déduction."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">
              Crédit de TVA antérieur (DH)
            </span>
            <input
              className="input"
              value={previousCredit}
              onChange={(e) => setPreviousCredit(e.target.value)}
              inputMode="decimal"
            />
          </label>
          <label className="flex items-center gap-2 text-[12.5px] font-semibold sm:col-span-1">
            <input
              type="checkbox"
              checked={applyProRata}
              onChange={(e) => setApplyProRata(e.target.checked)}
            />
            Appliquer un pro rata
          </label>
          {applyProRata ? (
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-bold text-muted">
                Pro rata (0 à 1)
              </span>
              <input
                className="input"
                value={proRata}
                onChange={(e) => setProRata(e.target.value)}
                inputMode="decimal"
              />
            </label>
          ) : null}
        </div>
        <p className="text-[11px] text-muted">
          Le pro rata ne s'applique qu'aux contribuables dont les opérations
          ouvrent partiellement droit à déduction. Laissez décoché si non
          applicable.
        </p>
      </div>

      <div className="card p-5 sm:p-6">
        <SectionHeading
          icon={Calculator}
          title="Résultat de la déclaration"
          description="Estimation de la TVA à payer ou du crédit à reporter."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
              Total ventes HT
            </p>
            <p className="mt-1 text-h4 font-extrabold">
              <Money value={result.totalSalesHt} />
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
              TVA collectée
            </p>
            <p className="mt-1 text-h4 font-extrabold text-[var(--brand)]">
              <Money value={result.vatCollected} />
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
              TVA déductible
            </p>
            <p className="mt-1 text-h4 font-extrabold">
              <Money value={result.vatDeductible} />
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
              TVA non déductible
            </p>
            <p className="mt-1 text-h4 font-extrabold text-muted">
              <Money value={result.vatNonDeductible} />
            </p>
          </div>
        </div>

        {result.vatCollectedByRate.length > 0 ? (
          <div className="mt-4">
            <p className="text-[11px] font-bold text-muted">
              Détail par taux
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {result.vatCollectedByRate.map((r, i) => (
                <span key={i} className="badge badge-brand">
                  {(r.rate * 100).toFixed(0)}% · <Money value={r.amount} />
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <p className="text-[11.5px] font-mono text-soft">{result.formula}</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            {result.netVat >= 0 ? (
              <>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                    TVA estimée à payer
                  </p>
                  <p className="mt-1 text-h1 font-extrabold tracking-[-0.04em] text-[var(--brand)]">
                    <Money value={result.payable} />
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                    Crédit de TVA à reporter
                  </p>
                  <p className="mt-1 text-h1 font-extrabold tracking-[-0.04em] text-[#10b981]">
                    <Money value={result.credit} />
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted">
          Un solde négatif correspond à un crédit de TVA à reporter. Il ne
          constitue pas automatiquement un remboursement en espèces : les
          conditions de remboursement doivent être vérifiées selon la
          réglementation applicable.
        </p>
      </div>
    </div>
  );
}
