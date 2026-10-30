"use client";

import { useState } from "react";
import {
  AlertCircle,
  Calculator,
  Coins,
  GlassWater,
  Percent,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import {
  InfoNote,
  Money,
  PageHero,
  SectionHeading,
  TrimesterPicker,
} from "@/components/ui";
import { formatMoney, parseNumber } from "@/lib/format";
import {
  BEVERAGE_RATES,
  calculateDrinks,
  emptySelection,
  type BeverageType,
  type DrinksResult,
  type TrimesterSelection,
} from "@/lib/calculators";

function initialSelection(): TrimesterSelection {
  const selection = emptySelection();
  selection[2025] = [true, true, true, true];
  return selection;
}

export function DrinksCalculator() {
  const { t, language } = useApp();
  const [revenue, setRevenue] = useState("120000");
  const [beverageType, setBeverageType] =
    useState<BeverageType>("non-alcoholic");
  const [selection, setSelection] = useState<TrimesterSelection>(initialSelection);
  const [result, setResult] = useState<DrinksResult>(() =>
    calculateDrinks({
      revenue: 120000,
      beverageType: "non-alcoholic",
      selection: initialSelection(),
    }),
  );
  const [error, setError] = useState("");

  const run = (
    nextRevenue = revenue,
    nextType = beverageType,
    nextSelection = selection,
  ) => {
    const parsed = parseNumber(nextRevenue);
    if (parsed <= 0) {
      setError(t("drinks.enterRevenue"));
      setResult(
        calculateDrinks({
          revenue: 0,
          beverageType: nextType,
          selection: nextSelection,
        }),
      );
      return;
    }
    setError("");
    setResult(
      calculateDrinks({
        revenue: parsed,
        beverageType: nextType,
        selection: nextSelection,
      }),
    );
  };

  const rate = BEVERAGE_RATES[beverageType];

  return (
    <>
      <PageHero
        eyebrow="Débits de boissons"
        title={t("tax.drinks")}
        description={t("tax.drinks.desc")}
        icon={GlassWater}
        backHref="/"
      >
        <div className="grid min-w-[230px] grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/55">
              {t("drinks.nonAlcoholic")}
            </p>
            <p className="mt-1 text-h3 font-extrabold">6 %</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/55">
              {t("drinks.alcoholic")}
            </p>
            <p className="mt-1 text-h3 font-extrabold">10 %</p>
          </div>
        </div>
      </PageHero>

      <section className="container-page mt-6">
        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.75fr]">
          <form
            className="card p-5 sm:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              run();
            }}
          >
            <SectionHeading
              icon={Calculator}
              title={t("common.calculate")}
              description={t("tax.drinks.desc")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">{t("drinks.beverageType")}</span>
                <select
                  className="select-field"
                  value={beverageType}
                  onChange={(event) => {
                    const next = event.target.value as BeverageType;
                    setBeverageType(next);
                    run(revenue, next, selection);
                  }}
                >
                  <option value="non-alcoholic">{t("drinks.nonAlcoholic")}</option>
                  <option value="alcoholic">{t("drinks.alcoholic")}</option>
                </select>
              </label>

              <label className="block">
                <span className="field-label">{t("drinks.revenueLabel")}</span>
                <div className="relative">
                  <Wallet
                    size={16}
                    className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted"
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    className="input-field ps-10"
                    placeholder={t("drinks.revenueHint")}
                    value={revenue}
                    onChange={(event) => {
                      setRevenue(event.target.value);
                      setError("");
                      const parsed = parseNumber(event.target.value);
                      if (parsed > 0) {
                        setResult(
                          calculateDrinks({
                            revenue: parsed,
                            beverageType,
                            selection,
                          }),
                        );
                      }
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="field-label mb-0">{t("drinks.trimesterSelection")}</span>
                <span className="badge badge-brand">
                  {result.rows.length} {t("common.trimester")}
                </span>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <TrimesterPicker
                  selection={selection}
                  onChange={(next) => {
                    setSelection(next);
                    run(revenue, beverageType, next);
                  }}
                />
              </div>
            </div>

            {error ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] px-3.5 py-2.5 text-[12px] font-semibold text-[var(--danger)]">
                <AlertCircle size={15} />
                {error}
              </div>
            ) : null}

            <button type="submit" className="btn btn-primary mt-5 h-11 w-full">
              <Calculator size={16} />
              {t("common.calculate")}
            </button>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
            <div className="card overflow-hidden">
              <div className="bg-[linear-gradient(135deg,#7c2d12,#c2410c_55%,#f59e0b)] p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                    {t("common.total")}
                  </p>
                  <ReceiptText size={16} className="text-white/60" />
                </div>
                <p className="mt-3 text-h1 font-extrabold leading-none tracking-[-0.045em]">
                  <Money value={result.total} />
                </p>
                <p className="mt-2 text-[11.5px] text-white/65">
                  {result.rows.length} {t("common.trimester")} · {t("drinks.feePerTrimester")}{" "}
                  {formatMoney(result.feePerTrimester, language)}
                </p>
              </div>
              <div className="p-5">
                <div className="result-row">
                  <span className="text-[12px] text-muted">{t("drinks.earned")}</span>
                  <span className="text-[12px] font-bold">
                    <Money value={result.earnedIncome} />
                  </span>
                </div>
                <div className="result-row">
                  <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
                    <Percent size={13} />
                    {t("drinks.tva")}
                  </span>
                  <span className="text-[12px] font-bold">
                    <Money value={result.tva} />
                  </span>
                </div>
                <div className="result-row">
                  <span className="text-[12px] text-muted">
                    {t("drinks.feePerTrimester")}
                  </span>
                  <span className="text-[12px] font-bold">
                    <Money value={result.feePerTrimester} />
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-3.5 py-2.5">
                  <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold text-muted">
                    <Coins size={14} />
                    {t("common.rate")}
                  </span>
                  <span className="badge badge-warning">{Math.round(rate * 100)} %</span>
                </div>
              </div>
            </div>
            <InfoNote variant="success" icon={Coins}>
              {language === "ar"
                ? "يُحسب الرسم على رقم المعاملات، بينما تُحسب الضريبة على القيمة المضافة بنسبة 20 %."
                : "Le droit est calculé sur le chiffre d'affaires, tandis que la TVA représente 20 % de ce chiffre."}
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
            />
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("drinks.tableRevenue")}</th>
                    <th>{t("drinks.tableEarned")}</th>
                    <th>{t("drinks.tva")}</th>
                    <th>{t("drinks.tableFee")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold text-[var(--text)]">
                      <Money value={result.revenue} />
                    </td>
                    <td><Money value={result.earnedIncome} /></td>
                    <td><Money value={result.tva} /></td>
                    <td className="font-bold text-[var(--brand)]">
                      <Money value={result.feePerTrimester} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {result.rows.length > 0 ? (
            <div className="table-wrap m-4 sm:m-6">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("common.year")}</th>
                    <th>{t("common.trimester")}</th>
                    <th>{t("drinks.feePerTrimester")}</th>
                    <th className="text-end">{t("common.total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={`${row.year}-${row.trimester}`}>
                      <td className="font-bold text-[var(--text)]">{row.year}</td>
                      <td>T{row.trimester}</td>
                      <td>{formatMoney(row.amount, language)}</td>
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
              {t("drinks.empty")}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 sm:px-6">
            <p className="text-[11.5px] text-muted">{t("common.disclaimer")}</p>
            <p className="text-h2 font-extrabold tracking-[-0.04em] text-[var(--brand)]">
              <Money value={result.total} />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
