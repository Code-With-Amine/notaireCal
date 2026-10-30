"use client";

import { useState } from "react";
import {
  AlertCircle,
  BedDouble,
  Calculator,
  Hotel,
  Moon,
  ReceiptText,
  Star,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import {
  InfoNote,
  Money,
  PageHero,
  SectionHeading,
  TrimesterPicker,
} from "@/components/ui";
import { formatMoney, formatPercent, parseNumber } from "@/lib/format";
import {
  SEJOUR_RATES,
  calculateSejour,
  emptySelection,
  type HotelCategory,
  type SejourResult,
  type TrimesterSelection,
} from "@/lib/calculators";

function initialSelection(): TrimesterSelection {
  const selection = emptySelection();
  selection[2025] = [true, true, true, true];
  return selection;
}

const CATEGORIES: HotelCategory[] = ["1", "2", "3", "4", "5"];

export function SejourCalculator() {
  const { t, language } = useApp();
  const [category, setCategory] = useState<HotelCategory>("3");
  const [rooms, setRooms] = useState("50");
  const [price, setPrice] = useState("500");
  const [nights, setNights] = useState("90");
  const [selection, setSelection] = useState<TrimesterSelection>(initialSelection);
  const [result, setResult] = useState<SejourResult>(() =>
    calculateSejour({
      rooms: 50,
      price: 500,
      nights: 90,
      category: "3",
      selection: initialSelection(),
    }),
  );
  const [error, setError] = useState("");

  const run = (options?: {
    nextRooms?: string;
    nextPrice?: string;
    nextNights?: string;
    nextCategory?: HotelCategory;
    nextSelection?: TrimesterSelection;
  }) => {
    const nextRooms = options?.nextRooms ?? rooms;
    const nextPrice = options?.nextPrice ?? price;
    const nextNights = options?.nextNights ?? nights;
    const nextCategory = options?.nextCategory ?? category;
    const nextSelection = options?.nextSelection ?? selection;

    const parsedRooms = parseNumber(nextRooms);
    const parsedPrice = parseNumber(nextPrice);
    const parsedNights = parseNumber(nextNights);

    if (parsedRooms <= 0) {
      setError(t("sejour.enterRooms"));
      return;
    }
    if (parsedPrice <= 0) {
      setError(t("sejour.enterPrice"));
      return;
    }
    if (parsedNights <= 0) {
      setError(t("sejour.empty"));
      return;
    }

    setError("");
    setResult(
      calculateSejour({
        rooms: parsedRooms,
        price: parsedPrice,
        nights: parsedNights,
        category: nextCategory,
        selection: nextSelection,
      }),
    );
  };

  return (
    <>
      <PageHero
        eyebrow="Établissements hôteliers"
        title={t("tax.sejour")}
        description={t("tax.sejour.desc")}
        icon={Hotel}
        backHref="/"
      >
        <div className="min-w-[220px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/55">
            {t("sejour.rate")} · {t("sejour.category" + category)}
          </p>
          <p className="mt-2 text-h1 font-extrabold leading-none tracking-[-0.04em]">
            {formatPercent(SEJOUR_RATES[category] * 100, language)}
          </p>
          <p className="mt-2 text-[11.5px] text-white/60">{t("sejour.formula")}</p>
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
              title={t("sejour.formTitle")}
              description={t("sejour.formula")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">{t("sejour.hotelCategory")}</span>
                <select
                  className="select-field"
                  value={category}
                  onChange={(event) => {
                    const next = event.target.value as HotelCategory;
                    setCategory(next);
                    run({ nextCategory: next });
                  }}
                >
                  {CATEGORIES.map((value) => (
                    <option key={value} value={value}>
                      {t("sejour.category" + value)} · {formatPercent(SEJOUR_RATES[value] * 100, language)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="field-label">{t("sejour.rooms")}</span>
                <div className="relative">
                  <BedDouble
                    size={16}
                    className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    className="input-field ps-10"
                    placeholder={t("sejour.roomsHint")}
                    value={rooms}
                    onChange={(event) => {
                      setRooms(event.target.value);
                      setError("");
                      run({ nextRooms: event.target.value });
                    }}
                  />
                </div>
              </label>

              <label className="block">
                <span className="field-label">{t("sejour.price")}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="any"
                  className="input-field"
                  placeholder={t("sejour.priceHint")}
                  value={price}
                  onChange={(event) => {
                    setPrice(event.target.value);
                    setError("");
                    run({ nextPrice: event.target.value });
                  }}
                />
              </label>

              <label className="block">
                <span className="field-label">{t("sejour.nights")}</span>
                <div className="relative">
                  <Moon
                    size={16}
                    className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="365"
                    step="1"
                    className="input-field ps-10"
                    value={nights}
                    onChange={(event) => {
                      setNights(event.target.value);
                      setError("");
                      run({ nextNights: event.target.value });
                    }}
                  />
                </div>
              </label>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="field-label mb-0">{t("sejour.trimesterSelection")}</span>
                <span className="badge badge-brand">
                  {result.rows.length} {t("common.trimester")}
                </span>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <TrimesterPicker
                  selection={selection}
                  onChange={(next) => {
                    setSelection(next);
                    run({ nextSelection: next });
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

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setCategory(value);
                    run({ nextCategory: value });
                  }}
                  className={`chip ${category === value ? "chip-active" : ""}`}
                >
                  <Star size={12} />
                  {value}
                </button>
              ))}
              <span className="text-[11px] text-muted">{t("sejour.hotelCategory")}</span>
            </div>

            <button type="submit" className="btn btn-primary mt-5 h-11 w-full">
              <Calculator size={16} />
              {t("common.calculate")}
            </button>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
            <div className="card overflow-hidden">
              <div className="bg-[linear-gradient(135deg,#8b4513,#d2691e_58%,#f59e0b)] p-5 text-white">
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
                  {t("sejour.quarterly")} · <Money value={result.quarterly} />
                </p>
              </div>
              <div className="p-5">
                <div className="result-row">
                  <span className="text-[12px] text-muted">{t("sejour.rooms")}</span>
                  <span className="text-[12px] font-bold">{rooms}</span>
                </div>
                <div className="result-row">
                  <span className="text-[12px] text-muted">{t("sejour.price")}</span>
                  <span className="text-[12px] font-bold">
                    {formatMoney(parseNumber(price), language)}
                  </span>
                </div>
                <div className="result-row">
                  <span className="text-[12px] text-muted">{t("sejour.nights")}</span>
                  <span className="text-[12px] font-bold">{nights}</span>
                </div>
                <div className="result-row">
                  <span className="text-[12px] text-muted">{t("sejour.rate")}</span>
                  <span className="badge badge-warning">
                    {formatPercent(SEJOUR_RATES[result.category] * 100, language)}
                  </span>
                </div>
                <div className="result-row">
                  <span className="text-[12px] text-muted">{t("sejour.quarterly")}</span>
                  <span className="text-[12px] font-bold">
                    <Money value={result.quarterly} />
                  </span>
                </div>
              </div>
            </div>
            <InfoNote variant="warning" icon={Hotel}>
              {language === "ar"
                ? "اختر فئة الفندق: يزداد معدل الضريبة مع عدد النجوم."
                : "La catégorie de l'hôtel détermine le taux appliqué : plus l'hôtel est étoilé, plus le taux est élevé."}
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
              action={<span className="badge badge-brand">{result.rows.length} {t("common.trimester")}</span>}
            />
          </div>
          {result.rows.length > 0 ? (
            <div className="table-wrap m-4 sm:m-6">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("common.year")}</th>
                    <th>{t("common.trimester")}</th>
                    <th>{t("sejour.rate")}</th>
                    <th className="text-end">{t("common.total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={`${row.year}-${row.trimester}`}>
                      <td className="font-bold text-[var(--text)]">{row.year}</td>
                      <td>T{row.trimester}</td>
                      <td>{formatPercent(SEJOUR_RATES[result.category] * 100, language)}</td>
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
              {t("sejour.empty")}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 sm:px-6">
            <p className="text-[11.5px] text-muted">{t("sejour.formula")}</p>
            <p className="text-h2 font-extrabold tracking-[-0.04em] text-[#d2691e]">
              <Money value={result.total} />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
