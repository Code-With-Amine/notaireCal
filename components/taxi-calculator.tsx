"use client";

import { useMemo, useState } from "react";
import {
  Car,
  Calculator,
  CircleDollarSign,
  Info,
  Percent,
  ReceiptText,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import {
  InfoNote,
  Money,
  PageHero,
  SectionHeading,
  TrimesterPicker,
} from "@/components/ui";
import {
  calculateTaxi,
  emptySelection,
  selectedCount,
  type TaxiResult,
  type TrimesterSelection,
} from "@/lib/calculators";

function initialSelection(): TrimesterSelection {
  const selection = emptySelection();
  selection[2025] = [true, true, true, true];
  selection[2026] = [true, true, true, true];
  return selection;
}

export function TaxiCalculator() {
  const { t, language } = useApp();
  const [category, setCategory] = useState<"1" | "2">("1");
  const [selection, setSelection] = useState<TrimesterSelection>(initialSelection);
  const [result, setResult] = useState<TaxiResult>(() =>
    calculateTaxi("1", initialSelection()),
  );

  const count = useMemo(() => selectedCount(selection), [selection]);

  const calculate = (nextCategory = category, nextSelection = selection) => {
    setResult(calculateTaxi(nextCategory, nextSelection));
  };

  const base = category === "1" ? { transport: 150, stationnement: 100 } : { transport: 150, stationnement: 70 };

  return (
    <>
      <PageHero
        eyebrow="Transport public"
        title={t("tax.taxi")}
        description={t("tax.taxi.desc")}
        icon={Car}
        backHref="/"
      >
        <div className="grid min-w-[230px] grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/55">
              {t("taxi.stationnement")}
            </p>
            <p className="mt-1 text-h3 font-extrabold">
              {base.stationnement}
              <span className="ms-1 text-[10px] font-semibold text-white/55">DH</span>
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/55">
              {t("taxi.transport")}
            </p>
            <p className="mt-1 text-h3 font-extrabold">
              {base.transport}
              <span className="ms-1 text-[10px] font-semibold text-white/55">DH</span>
            </p>
          </div>
        </div>
      </PageHero>

      <section className="container-page mt-6">
        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.75fr]">
          <form
            className="card p-5 sm:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              calculate();
            }}
          >
            <SectionHeading
              icon={Calculator}
              title={t("taxi.formTitle")}
              description={t("taxi.calcNote")}
            />

            <label className="block">
              <span className="field-label">{t("taxi.category")}</span>
              <select
                className="select-field"
                value={category}
                onChange={(event) => {
                  const next = event.target.value as "1" | "2";
                  setCategory(next);
                  calculate(next, selection);
                }}
              >
                <option value="1">{t("taxi.cat1")}</option>
                <option value="2">{t("taxi.cat2")}</option>
              </select>
            </label>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="field-label mb-0">{t("taxi.trimesterSelection")}</span>
                <span className="badge badge-brand">
                  {count} {t("common.trimester")}
                </span>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <TrimesterPicker
                  selection={selection}
                  onChange={(next) => {
                    setSelection(next);
                    setResult(calculateTaxi(category, next));
                  }}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="card-soft p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                  {t("taxi.stationnement")}
                </p>
                <p className="mt-1 text-h3 font-extrabold">
                  {base.stationnement} <span className="text-[11px] text-muted">DH</span>
                </p>
              </div>
              <div className="card-soft p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                  {t("taxi.transport")}
                </p>
                <p className="mt-1 text-h3 font-extrabold">
                  {base.transport} <span className="text-[11px] text-muted">DH</span>
                </p>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-5 h-11 w-full">
              <Calculator size={16} />
              {t("common.calculate")}
            </button>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
            <div className="card overflow-hidden">
              <div className="bg-[linear-gradient(135deg,#0f766e,#0d9488_55%,#22c55e)] p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                    {t("common.total")} · {t("taxi.yearTotal")}
                  </p>
                  <ReceiptText size={16} className="text-white/60" />
                </div>
                <p className="mt-3 text-h1 font-extrabold leading-none tracking-[-0.045em]">
                  <Money value={result.total} />
                </p>
                <p className="mt-2 text-[11.5px] text-white/65">
                  {count} {t("common.trimester")} · {t("taxi.cat" + category)}
                </p>
              </div>
              <div className="p-5">
                <div className="result-row">
                  <span className="inline-flex items-center gap-2 text-[12px] text-muted">
                    <CircleDollarSign size={14} />
                    {t("taxi.stationnement")}
                  </span>
                  <span className="text-[12px] font-bold">
                    {result.stationnement} DH
                  </span>
                </div>
                <div className="result-row">
                  <span className="inline-flex items-center gap-2 text-[12px] text-muted">
                    <CircleDollarSign size={14} />
                    {t("taxi.transport")}
                  </span>
                  <span className="text-[12px] font-bold">
                    {result.transport} DH
                  </span>
                </div>
                <div className="result-row">
                  <span className="inline-flex items-center gap-2 text-[12px] text-muted">
                    <Percent size={14} />
                    {t("taxi.majoration")}
                  </span>
                  <span className="text-[12px] font-bold">
                    <Money
                      value={result.rows.reduce(
                        (sum, row) => sum + row.majorationAmount,
                        0,
                      )}
                    />
                  </span>
                </div>
                <div className="mt-4 rounded-xl bg-[var(--surface-2)] p-3 text-[11px] leading-relaxed text-muted">
                  {t("taxi.calcNote")}
                </div>
              </div>
            </div>
            <InfoNote variant="warning" icon={Info}>
              {language === "ar"
                ? "تُحسب الزيادة على أساس 150 درهماً للنقل، ثم تُضاف ضريبة التوقف."
                : "La majoration est calculée sur la taxe de transport de 150 DH, puis la taxe de stationnement est ajoutée."}
            </InfoNote>
          </aside>
        </div>
      </section>

      <section className="container-page mt-8">
        <div className="card overflow-hidden">
          <div className="border-b border-[var(--border)] p-5 sm:p-6">
            <SectionHeading
              icon={ReceiptText}
              title={t("common.results")}
              description={t("common.details")}
              action={<span className="badge badge-brand">{count} {t("common.trimester")}</span>}
            />
          </div>
          {result.rows.length > 0 ? (
            <div className="table-wrap m-4 sm:m-6">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("common.year")}</th>
                    <th>{t("common.trimester")}</th>
                    <th>{t("taxi.stationnement")}</th>
                    <th>{t("taxi.transport")}</th>
                    <th>{t("taxi.majoration")}</th>
                    <th className="text-end">{t("common.total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={`${row.year}-${row.trimester}`}>
                      <td className="font-bold text-[var(--text)]">{row.year}</td>
                      <td>T{row.trimester}</td>
                      <td>{row.stationnement} DH</td>
                      <td>{row.transport} DH</td>
                      <td>
                        {row.majorationRate > 0 ? (
                          <span className="font-semibold text-[var(--warning)]">
                            {row.majorationRate} % · <Money value={row.majorationAmount} />
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-end font-bold text-[var(--text)]">
                        <Money value={row.amount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-[13px] text-muted">
              {t("taxi.empty")}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 sm:px-6">
            <p className="text-[11.5px] text-muted">{t("taxi.calcNote")}</p>
            <p className="text-h2 font-extrabold tracking-[-0.04em] text-[var(--brand)]">
              <Money value={result.total} />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
