"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  FileText,
  Save,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";
import { formatMoney, parseNumber } from "@/lib/format";
import { calculateTnb } from "@/lib/tnb";
import type { TnbCalculationResult } from "@/lib/tnb";

interface RequestDetail {
  id: number;
  reference: string;
  title_number: string;
  cnp_number: string | null;
  email: string;
  status: string;
  result_grand_total: string | null;
  admin_notes: string | null;
  ignored_reason: string | null;
  cancelled_reason: string | null;
  created_at: string;
  published_at: string | null;
  published_by: string | null;
  citizen_token: string;
}

interface YearRow {
  id: number;
  tax_year: number;
  surface_area: string;
  legacy_zone: string | null;
  modern_zone: string | null;
  modern_rate: string | null;
  is_declared: boolean;
  principal: string | null;
  def: string | null;
  majoration10: string | null;
  majoration5: string | null;
  months_late: number | null;
  majoration05: string | null;
  annual_total: string | null;
}

const LEGACY_ZONES = ["R3", "R5", "R7"] as const;

export default function AdminRequestDetailPage() {
  const { t } = useApp();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [years, setYears] = useState<YearRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // TNB calculation inputs
  const [surface, setSurface] = useState("500");
  const [legacyZone, setLegacyZone] = useState("R3");
  const [modernZone, setModernZone] = useState("A");
  const [modernRate, setModernRate] = useState("15");
  const [calcDate, setCalcDate] = useState("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [declByYear, setDeclByYear] = useState<Record<number, boolean>>({});
  const [newYear, setNewYear] = useState("");
  const [result, setResult] = useState<TnbCalculationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/requests/${id}`);
    const data = await res.json();
    if (!data.ok) { setError(data.error || "Erreur"); setLoading(false); return; }
    setRequest(data.request);
    setYears(data.years || []);
    // Pre-fill from saved years if any
    if (data.years && data.years.length > 0) {
      const sy = data.years.map((y: YearRow) => y.tax_year);
      setSelectedYears(sy);
      const decl: Record<number, boolean> = {};
      data.years.forEach((y: YearRow) => { decl[y.tax_year] = !!y.is_declared; });
      setDeclByYear(decl);
      const first = data.years[0];
      if (first.surface_area) setSurface(String(first.surface_area));
      if (first.legacy_zone) setLegacyZone(first.legacy_zone);
      if (first.modern_zone) setModernZone(first.modern_zone);
      if (first.modern_rate) setModernRate(String(first.modern_rate));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const calcDateValue = calcDate ? new Date(calcDate) : new Date();
  const calcDateStr = calcDate || new Date().toISOString().slice(0, 10);

  const handleCalculate = () => {
    const sorted = [...selectedYears].sort((a, b) => a - b);
    const decls = { ...declByYear };
    for (const y of sorted) if (decls[y] === undefined) decls[y] = false;
    const r = calculateTnb({
      surfaceArea: parseNumber(surface),
      legacyZone: legacyZone as any,
      modernZone: modernZone as any,
      modernRate: parseNumber(modernRate),
      selectedYears: sorted,
      declarationByYear: decls,
      calculationDate: calcDateStr,
    });
    setResult(r);
  };

  const addYear = () => {
    const y = parseInt(newYear, 10);
    if (!y || selectedYears.includes(y)) return;
    setSelectedYears((prev) => [...prev, y]);
    setDeclByYear((prev) => ({ ...prev, [y]: false }));
    setNewYear("");
  };

  const removeYear = (y: number) => {
    setSelectedYears((prev) => prev.filter((v) => v !== y));
    setDeclByYear((prev) => { const n = { ...prev }; delete n[y]; return n; });
  };

  const saveCalculation = async () => {
    if (!result) return;
    setSaving(true);
    setMsg("");
    const yearsPayload = result.years.map((yr) => ({
      taxYear: yr.taxYear,
      surfaceArea: parseNumber(surface),
      legacyZone,
      modernZone,
      modernRate: parseNumber(modernRate),
      isDeclared: declByYear[yr.taxYear] ?? false,
      calculationDate: calcDateStr,
      principal: yr.amounts?.principal ?? null,
      def: yr.amounts?.def ?? null,
      majoration10: yr.amounts?.majoration10 ?? null,
      majoration5: yr.amounts?.majoration5 ?? null,
      monthsLate: yr.amounts?.monthsLate ?? null,
      majoration05: yr.amounts?.majoration05 ?? null,
      annualTotal: yr.amounts?.annualTotal ?? null,
      unresolvedReason: yr.tariff.status === "unresolved" ? "unresolved" : null,
    }));
    const res = await fetch(`/api/admin/requests/${id}/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ years: yearsPayload }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.ok) {
      setMsg("Calcul enregistré.");
      load();
    } else {
      setMsg(data.error || "Erreur d'enregistrement");
    }
  };

  const publish = async () => {
    if (!result?.aggregates) return;
    setPublishing(true);
    setMsg("");
    const res = await fetch(`/api/admin/requests/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grandTotal: result.aggregates.annualTotal }),
    });
    const data = await res.json();
    setPublishing(false);
    if (data.ok) {
      setMsg("Résultat publié.");
      load();
    } else {
      setMsg(data.error || "Erreur de publication");
    }
  };

  const changeStatus = async (newStatus: string, reason?: string) => {
    const body: Record<string, unknown> = { status: newStatus };
    if (reason) {
      if (newStatus === "Ignorée") body.ignoredReason = reason;
      if (newStatus === "Annulée") body.cancelledReason = reason;
    }
    await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  };

  if (loading) return <div className="container-page py-8"><div className="card p-6 text-center text-muted">Chargement…</div></div>;
  if (error || !request) return <div className="container-page py-8"><div className="card p-6 text-center text-[var(--danger)]">{error || "Introuvable"}</div></div>;

  return (
    <div className="container-page py-8 space-y-6">
      <button type="button" onClick={() => router.push("/admin")} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand)]">
        <ArrowLeft size={14} /> Retour au tableau de bord
      </button>

      <div className="space-y-1">
        <h1 className="text-h1 tracking-[-0.02em]">Demande {request.reference}</h1>
        <p className="text-[14px] text-muted">
          Titre foncier : {request.title_number} · Statut : {request.status} · Soumise le{" "}
          {new Date(request.created_at).toLocaleString("fr-FR")}
        </p>
      </div>

      {msg ? (
        <div className="rounded-xl bg-[var(--success-soft)] px-4 py-2.5 text-[13px] text-[var(--success)]">{msg}</div>
      ) : null}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {request.status === "Nouvelle" ? (
          <button className="btn btn-primary h-9 text-[12.5px]" onClick={() => changeStatus("En cours")}>
            Commencer le traitement
          </button>
        ) : null}
        {request.status !== "Ignorée" && request.status !== "Annulée" && request.status !== "Terminée" ? (
          <>
            <button className="btn btn-secondary h-9 text-[12.5px]" onClick={() => { const r = prompt("Raison de l'ignorance :"); if (r) changeStatus("Ignorée", r); }}>
              Ignorer
            </button>
            <button className="btn btn-ghost h-9 text-[12.5px]" onClick={() => { const r = prompt("Raison de l'annulation :"); if (r) changeStatus("Annulée", r); }}>
              Annuler
            </button>
          </>
        ) : null}
      </div>

      {/* TNB Calculation */}
      <div className="card p-6 space-y-4">
        <SectionHeading icon={Calculator} title="Calcul de la TNB" description="Saisissez les informations vérifiées manuellement." />

        <div className="grid gap-3 sm:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">Superficie (m²)</span>
            <input className="input" value={surface} onChange={(e) => setSurface(e.target.value)} inputMode="decimal" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">Zone (2021–2025)</span>
            <select className="input" value={legacyZone} onChange={(e) => setLegacyZone(e.target.value)}>
              {LEGACY_ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">Zone (depuis 2026)</span>
            <select className="input" value={modernZone} onChange={(e) => setModernZone(e.target.value)}>
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">Taux (DH/m²)</span>
            <input className="input" value={modernRate} onChange={(e) => setModernRate(e.target.value)} inputMode="decimal" />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-muted">Date de calcul</span>
            <input className="input" type="date" value={calcDate} onChange={(e) => setCalcDate(e.target.value)} />
          </label>
          <div className="flex items-end gap-2">
            <input
              className="input"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="Ajouter une année"
              inputMode="numeric"
            />
            <button type="button" className="btn btn-secondary h-10 text-[12.5px]" onClick={addYear}>
              Ajouter
            </button>
          </div>
        </div>

        {selectedYears.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[12px] font-bold text-muted">Années sélectionnées</p>
            <div className="flex flex-wrap gap-2">
              {selectedYears.sort((a, b) => a - b).map((y) => (
                <div key={y} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5">
                  <span className="text-[13px] font-bold">{y}</span>
                  <label className="flex items-center gap-1 text-[11.5px]">
                    <input
                      type="checkbox"
                      checked={!!declByYear[y]}
                      onChange={(e) => setDeclByYear((p) => ({ ...p, [y]: e.target.checked }))}
                    />
                    Déclarée
                  </label>
                  <button type="button" className="text-[var(--danger)]" onClick={() => removeYear(y)} aria-label="Retirer">
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary h-10 text-[13px]" onClick={handleCalculate} disabled={selectedYears.length === 0}>
            <Calculator size={14} /> Calculer
          </button>
          {result?.aggregates ? (
            <>
              <button type="button" className="btn btn-secondary h-10 text-[13px]" onClick={saveCalculation} disabled={saving}>
                <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer le calcul"}
              </button>
              <button type="button" className="btn btn-primary h-10 text-[13px]" onClick={publish} disabled={publishing || request.status === "Terminée"}>
                <CheckCircle2 size={14} /> {publishing ? "Publication…" : "Valider et publier"}
              </button>
            </>
          ) : null}
        </div>

        {result?.aggregates ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3">
            <p className="text-[12px] font-bold text-muted">Résultat</p>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Année</th>
                    <th>Principal</th>
                    <th>DEF</th>
                    <th>Maj 10%</th>
                    <th>Maj 5%</th>
                    <th>Maj 0,5%</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.years.map((yr) => (
                    <tr key={yr.taxYear}>
                      <td className="font-bold">{yr.taxYear}</td>
                      <td>{yr.amounts ? yr.amounts.principal.toFixed(2) : "—"}</td>
                      <td>{yr.amounts ? yr.amounts.def.toFixed(2) : "—"}</td>
                      <td>{yr.amounts ? yr.amounts.majoration10.toFixed(2) : "—"}</td>
                      <td>{yr.amounts ? yr.amounts.majoration5.toFixed(2) : "—"}</td>
                      <td>{yr.amounts ? yr.amounts.majoration05.toFixed(2) : "—"}</td>
                      <td className="font-bold">{yr.amounts ? yr.amounts.annualTotal.toFixed(2) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
              <span className="text-[14px] font-bold">Total général</span>
              <span className="text-[20px] font-extrabold text-[var(--brand)]">
                {result.aggregates.annualTotal.toFixed(2)} DH
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Previously saved years */}
      {years.length > 0 ? (
        <div className="card p-6 space-y-3">
          <SectionHeading icon={FileText} title="Calcul enregistré" description="Dernier calcul sauvegardé en base." />
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Année</th>
                  <th>Principal</th>
                  <th>DEF</th>
                  <th>Maj 10%</th>
                  <th>Maj 5%</th>
                  <th>Maj 0,5%</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.id}>
                    <td className="font-bold">{y.tax_year}</td>
                    <td>{y.principal ?? "—"}</td>
                    <td>{y.def ?? "—"}</td>
                    <td>{y.majoration10 ?? "—"}</td>
                    <td>{y.majoration5 ?? "—"}</td>
                    <td>{y.majoration05 ?? "—"}</td>
                    <td className="font-bold">{y.annual_total ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {request.result_grand_total ? (
            <p className="text-[14px] font-bold">
              Total publié : {request.result_grand_total} DH
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Admin notes */}
      <div className="card p-6 space-y-3">
        <SectionHeading icon={FileText} title="Notes administratives" description="Notes internes (non visibles par le citoyen)." />
        <textarea
          className="input"
          rows={3}
          defaultValue={request.admin_notes || ""}
          onBlur={(e) => {
            fetch(`/api/admin/requests/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adminNotes: e.target.value }),
            });
          }}
        />
      </div>
    </div>
  );
}
