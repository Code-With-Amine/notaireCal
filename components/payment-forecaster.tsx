"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  AlertCircle,
  CalendarClock,
  CalendarDays,
  Car,
  Calculator,
  GlassWater,
  Hotel,
  Info,
  LineChart,
  Map as MapIcon,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import {
  InfoNote,
  Money,
  MonthYearPicker,
  PageHero,
  SectionHeading,
} from "@/components/ui";
import { formatMoney, formatPercent, parseNumber } from "@/lib/format";
import {
  calculateForecast,
  type BeverageType,
  type ForecastTaxType,
  type HotelCategory,
} from "@/lib/calculators";
import {
  DEFAULT_MODERN_RATE,
  LEGACY_ZONE_LABEL_KEYS,
  LEGACY_ZONE_RATES,
  MODERN_ZONE_LABEL_KEYS,
  MODERN_ZONES,
  TNB_2026_ZONE_RATES,
  getTnbTariffEra,
  type LegacyZone,
  type ModernZone,
} from "@/lib/rates";

const TAX_OPTIONS: {
  value: ForecastTaxType;
  icon: typeof MapIcon;
  labelKey: string;
}[] = [
  { value: "tnb", icon: MapIcon, labelKey: "tax.tnb" },
  { value: "taxi", icon: Car, labelKey: "tax.taxi" },
  { value: "drinks", icon: GlassWater, labelKey: "tax.drinks" },
  { value: "sejour", icon: Hotel, labelKey: "tax.sejour" },
];

const HOTEL_CATEGORIES: HotelCategory[] = ["1", "2", "3", "4", "5"];

export function PaymentForecaster() {
  const { t, language, months, shortMonths } = useApp();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const [taxType, setTaxType] = useState<ForecastTaxType>("tnb");
  const [targetMonth, setTargetMonth] = useState(currentMonth === 11 ? 11 : 11);
  const [targetYear, setTargetYear] = useState(currentYear);
  const [area, setArea] = useState("500");
  const [legacyZone, setLegacyZone] = useState<LegacyZone>("R3");
  const [modernZone, setModernZone] = useState<ModernZone>("A");
  const [modernRate, setModernRate] = useState<number>(DEFAULT_MODERN_RATE.A);
  const [taxiCategory, setTaxiCategory] = useState<"1" | "2">("1");
  const [drinksRevenue, setDrinksRevenue] = useState("120000");
  const [beverageType, setBeverageType] =
    useState<BeverageType>("non-alcoholic");
  const [rooms, setRooms] = useState("50");
  const [price, setPrice] = useState("500");
  const [hotelCategory, setHotelCategory] = useState<HotelCategory>("3");
  const [nights, setNights] = useState("90");

  useEffect(() => {
    if (targetYear === currentYear && targetMonth < currentMonth) {
      setTargetMonth(currentMonth);
    }
  }, [targetYear, targetMonth, currentYear, currentMonth]);

  const forecast = useMemo(
    () =>
      calculateForecast({
        taxType,
        targetYear,
        targetMonth,
        area: parseNumber(area),
        legacyZone,
        modernZone,
        modernRate,
        taxiCategory,
        drinksRevenue: parseNumber(drinksRevenue),
        beverageType,
        rooms: parseNumber(rooms),
        price: parseNumber(price),
        hotelCategory,
        nightsPerQuarter: parseNumber(nights),
      }),
    [
      taxType,
      targetYear,
      targetMonth,
      area,
      legacyZone,
      modernZone,
      modernRate,
      taxiCategory,
      drinksRevenue,
      beverageType,
      rooms,
      price,
      hotelCategory,
      nights,
    ],
  );

  const years = Array.from({ length: 6 }, (_, index) => currentYear + index);
  const selectedTaxLabel = t(
    TAX_OPTIONS.find((option) => option.value === taxType)?.labelKey ??
      "forecast.selectTax",
  );
  const targetLabel = `${months[targetMonth]} ${targetYear}`;
  const forecastEra = getTnbTariffEra(targetYear);
  const tnbUnavailable = taxType === "tnb" && !forecast.rateResolved;

  const rateDisplay = (() => {
    if (tnbUnavailable) return t("forecast.rateUnavailable");
    switch (taxType) {
      case "tnb":
        return `${forecast.rateValue} DH/m²`;
      case "drinks":
      case "sejour":
        return formatPercent(forecast.rateValue, language);
      case "taxi":
        return formatMoney(forecast.rateValue, language);
      default:
        return "—";
    }
  })();

  return (
    <>
      <PageHero
        eyebrow={t("dashboard.newTools")}
        title={t("forecast.heroTitle")}
        description={t("forecast.heroDesc")}
        icon={CalendarClock}
        backHref="/"
      >
        <div className="min-w-[240px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
              {t("forecast.selectedDate")}
            </p>
            <CalendarDays size={14} className="text-white/60" />
          </div>
          <p className="mt-2 text-[24px] font-extrabold leading-tight tracking-[-0.03em]">
            {targetLabel}
          </p>
          <p className="mt-1 text-[11px] text-white/60">
            {forecast.monthsUntil + 1} {t("forecast.monthsCount")} · {selectedTaxLabel}
          </p>
        </div>
      </PageHero>

      <section className="container-page mt-6">
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="card p-5 sm:p-7">
            <SectionHeading
              icon={Calculator}
              title={t("forecast.formTitle")}
              description={t("forecast.monthlyHint")}
            />

            <div>
              <span className="field-label">{t("forecast.taxType")}</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {TAX_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = taxType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTaxType(option.value)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-start transition ${
                        active
                          ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)] shadow-[0_8px_20px_rgba(38,46,227,0.12)]"
                          : "border-[var(--border)] bg-[var(--surface-2)] text-soft hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? "bg-[var(--brand)] text-white"
                            : "bg-[var(--surface)] text-muted"
                        }`}
                      >
                        <Icon size={17} />
                      </span>
                      <span className="text-[12.5px] font-bold leading-tight">
                        {t(option.labelKey)}
                      </span>
                      {active ? (
                        <BadgeCheck size={15} className="ms-auto shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <MonthYearPicker
                month={targetMonth}
                year={targetYear}
                onMonthChange={(nextMonth) => {
                  if (targetYear === currentYear && nextMonth < currentMonth) {
                    setTargetMonth(currentMonth);
                    return;
                  }
                  setTargetMonth(nextMonth);
                }}
                onYearChange={(nextYear) => {
                  setTargetYear(nextYear);
                  if (nextYear === currentYear && targetMonth < currentMonth) {
                    setTargetMonth(currentMonth);
                  }
                }}
                years={years}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  {t("tnb.quick")}
                </span>
                {[
                  { label: months[11], year: currentYear },
                  { label: months[11], year: currentYear + 1 },
                  { label: months[5], year: currentYear + 2 },
                ].map((quick) => (
                  <button
                    key={`${quick.label}-${quick.year}`}
                    type="button"
                    onClick={() => {
                      setTargetMonth(
                        quick.year === currentYear && months.indexOf(quick.label) < currentMonth
                          ? currentMonth
                          : months.indexOf(quick.label),
                      );
                      setTargetYear(quick.year);
                    }}
                    className={`chip ${
                      targetMonth === months.indexOf(quick.label) &&
                      targetYear === quick.year
                        ? "chip-active"
                        : ""
                    }`}
                  >
                    {quick.label} {quick.year}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="field-label">{t("forecast.included")}</span>
              {taxType === "tnb" ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="field-label">{t("forecast.tnbArea")}</span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        inputMode="decimal"
                        className="input-field"
                        value={area}
                        onChange={(event) => setArea(event.target.value)}
                      />
                    </label>

                    {forecastEra === "legacy-zone" ? (
                      <label className="block">
                        <span className="field-label">
                          {t("forecast.tnbLegacyZone")}
                        </span>
                        <select
                          className="select-field"
                          value={legacyZone}
                          onChange={(event) =>
                            setLegacyZone(event.target.value as LegacyZone)
                          }
                        >
                          {(Object.keys(LEGACY_ZONE_RATES) as LegacyZone[]).map(
                            (value) => (
                              <option key={value} value={value}>
                                {t(LEGACY_ZONE_LABEL_KEYS[value])} ·{" "}
                                {LEGACY_ZONE_RATES[value]} DH/m²
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                    ) : null}

                    {forecastEra === "modern-zone" ? (
                      <>
                        <label className="block">
                          <span className="field-label">
                            {t("forecast.tnbModernZone")}
                          </span>
                          <select
                            className="select-field"
                            value={modernZone}
                            onChange={(event) => {
                              const zone = event.target.value as ModernZone;
                              setModernZone(zone);
                              setModernRate(DEFAULT_MODERN_RATE[zone]);
                            }}
                          >
                            {MODERN_ZONES.map((value) => (
                              <option key={value} value={value}>
                                {t(MODERN_ZONE_LABEL_KEYS[value])}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="field-label">
                            {t("forecast.tnbRate")}
                          </span>
                          <select
                            className="select-field"
                            value={modernRate}
                            onChange={(event) =>
                              setModernRate(Number(event.target.value))
                            }
                          >
                            {TNB_2026_ZONE_RATES[modernZone].map((rate) => (
                              <option key={rate} value={rate}>
                                {rate} DH/m²
                              </option>
                            ))}
                          </select>
                        </label>
                      </>
                    ) : null}
                  </div>

                  {forecastEra === "flat" ? (
                    <p className="mt-3 text-[11px] text-muted">
                      {t("forecast.tnbNoZoneNeeded")}
                    </p>
                  ) : null}

                  {tnbUnavailable ? (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] px-3.5 py-2.5 text-[12px] font-semibold text-[var(--warning)]">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p>{t("forecast.rateUnavailable")}</p>
                        <p className="text-[11px] font-medium">
                          {t("forecast.rateUnavailableHint")}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              {taxType === "taxi" ? (
                <label className="block">
                  <span className="field-label">{t("forecast.taxiCategory")}</span>
                  <select
                    className="select-field"
                    value={taxiCategory}
                    onChange={(event) =>
                      setTaxiCategory(event.target.value as "1" | "2")
                    }
                  >
                    <option value="1">{t("taxi.cat1")}</option>
                    <option value="2">{t("taxi.cat2")}</option>
                  </select>
                </label>
              ) : null}

              {taxType === "drinks" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">{t("forecast.drinksRevenue")}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      inputMode="decimal"
                      className="input-field"
                      value={drinksRevenue}
                      onChange={(event) => setDrinksRevenue(event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">{t("forecast.drinksType")}</span>
                    <select
                      className="select-field"
                      value={beverageType}
                      onChange={(event) =>
                        setBeverageType(event.target.value as BeverageType)
                      }
                    >
                      <option value="non-alcoholic">{t("drinks.nonAlcoholic")}</option>
                      <option value="alcoholic">{t("drinks.alcoholic")}</option>
                    </select>
                  </label>
                </div>
              ) : null}

              {taxType === "sejour" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="field-label">{t("forecast.sejourCategory")}</span>
                    <select
                      className="select-field"
                      value={hotelCategory}
                      onChange={(event) =>
                        setHotelCategory(event.target.value as HotelCategory)
                      }
                    >
                      {HOTEL_CATEGORIES.map((value) => (
                        <option key={value} value={value}>
                          {t("sejour.category" + value)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="field-label">{t("forecast.sejourRooms")}</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      className="input-field"
                      value={rooms}
                      onChange={(event) => setRooms(event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">{t("forecast.sejourPrice")}</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      inputMode="decimal"
                      className="input-field"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                    />
                  </label>
                  <label className="block">
                    <span className="field-label">{t("forecast.sejourNights")}</span>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      step="1"
                      inputMode="numeric"
                      className="input-field"
                      value={nights}
                      onChange={(event) => setNights(event.target.value)}
                    />
                  </label>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--brand)]">
                <TrendingUp size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                  {t("forecast.rateForYear")}
                </p>
                <p className="text-[12px] font-semibold text-soft">
                  {forecast.targetYear} · {selectedTaxLabel}
                </p>
              </div>
              <span className="badge badge-brand">{rateDisplay}</span>
            </div>

            <InfoNote>{t("forecast.info")}</InfoNote>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
            <div className="card overflow-hidden">
              <div className="bg-[linear-gradient(135deg,#101c58,#262ee3_58%,#0052cc)] p-5 text-white">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                    {t("forecast.estimateFor")} · {targetLabel}
                  </p>
                  <Wallet size={16} className="text-white/60" />
                </div>
                <p className="mt-3 text-[40px] font-extrabold leading-none tracking-[-0.05em]">
                  {tnbUnavailable ? (
                    "—"
                  ) : (
                    <Money value={forecast.monthlyAmount} />
                  )}
                </p>
                <p className="mt-2 text-[11.5px] text-white/65">
                  {tnbUnavailable
                    ? t("forecast.rateUnavailableHint")
                    : t("forecast.monthlyHint")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-white">{selectedTaxLabel}</span>
                  <span className="badge badge-white">{t("common.monthly")}</span>
                </div>
              </div>

              <div className="p-5">
                <div className="result-row">
                  <span className="text-[12px] text-muted">
                    {t("forecast.annualEstimate")}
                  </span>
                  <span className="text-[12px] font-bold">
                    {tnbUnavailable ? "—" : <Money value={forecast.annualEstimate} />}
                  </span>
                </div>
                <div className="result-row">
                  <span className="text-[12px] text-muted">
                    {t("forecast.quarterlyEstimate")}
                  </span>
                  <span className="text-[12px] font-bold">
                    {tnbUnavailable ? (
                      "—"
                    ) : (
                      <Money value={forecast.quarterlyEstimate} />
                    )}
                  </span>
                </div>
                <div className="result-row">
                  <span className="text-[12px] text-muted">
                    {t("forecast.monthUntil")}
                  </span>
                  <span className="text-[12px] font-bold">
                    {forecast.monthsUntil}
                  </span>
                </div>
                <div className="result-row">
                  <span className="text-[12px] text-muted">
                    {tnbUnavailable && forecast.rateErrorKey
                      ? t(forecast.rateErrorKey, {
                          year: forecast.targetYear,
                        })
                      : forecast.rateLabel.startsWith("forecast.")
                        ? t(forecast.rateLabel)
                        : forecast.rateLabel}
                  </span>
                  <span className="text-[12px] font-bold">{rateDisplay}</span>
                </div>

                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                    {t("forecast.cumulative")}
                  </p>
                  <p className="mt-1 text-[26px] font-extrabold tracking-[-0.04em] text-[var(--brand)]">
                    {tnbUnavailable ? "—" : <Money value={forecast.cumulative} />}
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-muted">
                    {forecast.monthsUntil + 1} {t("forecast.monthsCount")} ·{" "}
                    {t("forecast.cumulativeHint")}
                  </p>
                </div>
              </div>
            </div>

            <InfoNote variant="success" icon={BadgeCheck}>
              {language === "ar"
                ? "يمكنك تغيير الشهر والسنة لمعاينة المبلغ المطلوب في أي تاريخ مستقبلي."
                : "Changez le mois et l'année pour prévisualiser le montant à prévoir à n'importe quelle date future."}
            </InfoNote>
          </aside>
        </div>
      </section>

      <section className="container-page mt-8">
        <div className="card p-5 sm:p-7">
          <SectionHeading
            icon={LineChart}
            title={t("forecast.projection")}
            description={t("forecast.cumulativeHint")}
            action={
              <span className="badge badge-brand">
                {tnbUnavailable ? (
                  t("forecast.rateUnavailable")
                ) : (
                  <>
                    {t("common.monthly")} ·{" "}
                    <Money value={forecast.monthlyAmount} />
                  </>
                )}
              </span>
            }
          />

          {tnbUnavailable ? (
            <div className="mt-6 rounded-2xl border border-[color-mix(in_srgb,var(--warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] p-8 text-center">
              <p className="text-[14px] font-extrabold text-[var(--warning)]">
                {t("forecast.rateUnavailable")}
              </p>
              <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-muted">
                {t("forecast.rateUnavailableHint")}
              </p>
            </div>
          ) : (
            <>
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-6">
            <div className="flex h-56 items-end gap-1.5 sm:gap-3">
              {forecast.projection.map((month, index) => {
                const maxCumulative =
                  forecast.projection[forecast.projection.length - 1].cumulative || 1;
                const height = Math.max(
                  6,
                  (month.cumulative / maxCumulative) * 100,
                );
                return (
                  <div
                    key={`${month.year}-${month.month}`}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                    title={`${months[month.month]} ${month.year} · ${formatMoney(
                      month.cumulative,
                      language,
                    )}`}
                  >
                    <span
                      className={`w-full rounded-t-md transition-all group-hover:opacity-80 ${
                        month.isTarget ? "ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-[var(--surface-2)]" : ""
                      }`}
                      style={{
                        height: `${height}%`,
                        background: month.isTarget
                          ? "linear-gradient(180deg,#262ee3,#0052cc)"
                          : index < 6
                            ? "color-mix(in srgb, var(--brand) 38%, var(--surface-3))"
                            : "color-mix(in srgb, var(--brand) 68%, var(--surface-3))",
                        minHeight: 8,
                      }}
                    />
                    <span
                      className={`text-[9.5px] font-bold uppercase tracking-[0.02em] ${
                        month.isTarget ? "text-[var(--brand)]" : "text-muted"
                      }`}
                    >
                      {shortMonths[month.month]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
              <div className="flex items-center gap-3 text-[10.5px] text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[var(--brand)]" />
                  {t("common.estimate")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[var(--brand)] opacity-40" />
                  {t("common.months")}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-soft">
                {t("forecast.selectedDate")} · <strong>{targetLabel}</strong>
              </span>
            </div>
          </div>

          <div className="mt-5 table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("common.month")}</th>
                  <th>{t("common.year")}</th>
                  <th>{t("common.monthly")}</th>
                  <th className="text-end">{t("forecast.cumulative")}</th>
                </tr>
              </thead>
              <tbody>
                {forecast.projection.slice(0, 6).map((month) => (
                  <tr
                    key={`${month.year}-${month.month}`}
                    className={month.isTarget ? "bg-[var(--brand-soft)]" : ""}
                  >
                    <td className="font-bold text-[var(--text)]">
                      {months[month.month]}
                      {month.isTarget ? (
                        <span className="badge badge-brand ms-2">
                          {t("forecast.selected")}
                        </span>
                      ) : null}
                    </td>
                    <td>{month.year}</td>
                    <td><Money value={month.amount} /></td>
                    <td className="text-end font-bold text-[var(--text)]">
                      <Money value={month.cumulative} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
