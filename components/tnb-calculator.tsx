"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Calculator,
  Check,
  FileDown,
  History,
  Loader2,
  Map as MapIcon,
  Ruler,
  Tag,
  X,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import { TnbCalculationExplainer } from "@/components/tnb-explainer";
import { Money, PageHero, SectionHeading, InfoNote } from "@/components/ui";
import { buildTnbReport } from "@/lib/tnb-report";
import {
  formatNumber,
  parseNumber,
  todayInputValue,
} from "@/lib/format";
import {
  DEFAULT_MODERN_RATE,
  LEGACY_ZONE_LABEL_KEYS,
  LEGACY_ZONE_RATES,
  MODERN_ZONE_LABEL_KEYS,
  MODERN_ZONES,
  TNB_2026_ZONE_RATES,
  dateFromInput,
  getTnbTariffEra,
  isModernZone,
  type LegacyZone,
  type ModernZone,
} from "@/lib/rates";
import { getRecentTaxYears, getTnbYearOptions } from "@/lib/tax-years";
import {
  calculateTnb,
  tariffUnresolvedMessageKey,
  type TnbIssue,
  type TnbYearResult,
} from "@/lib/tnb";

function buildDeclarations(years: number[]): Record<number, boolean> {
  return years.reduce<Record<number, boolean>>((status, year) => {
    status[year] = false;
    return status;
  }, {});
}

export function TnbCalculator() {
  const { t, language } = useApp();
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [declarationByYear, setDeclarationByYear] = useState<
    Record<number, boolean>
  >({});
  const [area, setArea] = useState("500");
  const [legacyZone, setLegacyZone] = useState<LegacyZone>("R3");
  const [modernZone, setModernZone] = useState<ModernZone>("A");
  const [modernRate, setModernRate] = useState<number>(DEFAULT_MODERN_RATE.A);
  const [calcDate, setCalcDate] = useState("");
  const [pdfState, setPdfState] = useState<"idle" | "working" | "error">(
    "idle",
  );

  /**
   * Dates and rolling year windows are client-only defaults. Reading them
   * during SSR would make the statically rendered HTML disagree with the
   * browser on every day after the build, causing a hydration mismatch.
   */
  useEffect(() => {
    const value = todayInputValue();
    setToday(value);
    setCalcDate((current) => current || value);
    setSelectedYears((current) =>
      current.length > 0 ? current : getRecentTaxYears(4),
    );
    setMounted(true);
  }, []);

  const parsedArea = parseNumber(area);
  const sortedYears = useMemo(
    () => [...selectedYears].sort((a, b) => a - b),
    [selectedYears],
  );

  /**
   * Every selected year must have an explicit status. New years are stored
   * with `false` in `addYear`; this fallback only protects the first render and
   * any restored state, never another year's status.
   */
  const declarationsForCalculation = useMemo(() => {
    const next = { ...declarationByYear };
    for (const year of sortedYears) {
      if (!Object.prototype.hasOwnProperty.call(next, year)) next[year] = false;
    }
    return next;
  }, [declarationByYear, sortedYears]);

  const result = useMemo(
    () =>
      calculateTnb({
        surfaceArea: parsedArea,
        legacyZone,
        modernZone,
        modernRate,
        selectedYears: sortedYears,
        declarationByYear: declarationsForCalculation,
        calculationDate: calcDate,
      }),
    [
      parsedArea,
      legacyZone,
      modernZone,
      modernRate,
      sortedYears,
      declarationsForCalculation,
      calcDate,
    ],
  );

  const calcDateValue = dateFromInput(calcDate);
  const calcDateValid = !Number.isNaN(calcDateValue.getTime());
  const calcDateInFuture = calcDateValid && calcDate > today;
  const visibleResult =
    mounted && calcDateValid && !calcDateInFuture ? result : null;

  const resolvedRows = result.years.filter((year) => year.amounts);
  const unresolvedYears = result.years.filter((year) => !year.amounts);
  const declaredCount = sortedYears.filter(
    (year) => declarationsForCalculation[year],
  ).length;

  const hasLegacyYears = sortedYears.some(
    (year) => getTnbTariffEra(year) === "legacy-zone",
  );
  const hasModernYears = sortedYears.some(
    (year) => getTnbTariffEra(year) === "modern-zone",
  );
  const zoneBadgeLabel = hasModernYears
    ? `${t(MODERN_ZONE_LABEL_KEYS[modernZone])} · ${modernRate} DH/m²`
    : hasLegacyYears
      ? t(LEGACY_ZONE_LABEL_KEYS[legacyZone])
      : t("tnb.allZones");

  const yearOptions = useMemo(
    () => (mounted ? getTnbYearOptions() : []),
    [mounted],
  );
  const earliestYear = yearOptions[yearOptions.length - 1];
  const latestYear = yearOptions[0];

  const availableYears = useMemo(
    () => yearOptions.filter((year) => !selectedYears.includes(year)),
    [yearOptions, selectedYears],
  );

  const resolvedRates = resolvedRows.map((row) =>
    row.tariff.status === "resolved" ? row.tariff.rate : 0,
  );
  const minRate = resolvedRates.length ? Math.min(...resolvedRates) : null;
  const maxRate = resolvedRates.length ? Math.max(...resolvedRates) : null;
  const rateLabel =
    minRate === null || maxRate === null
      ? unresolvedYears.length > 0
        ? t("tnb.unresolvedShort")
        : "—"
      : minRate === maxRate
        ? formatNumber(minRate, language, 0)
        : `${formatNumber(minRate, language, 0)} – ${formatNumber(
            maxRate,
            language,
            0,
          )}`;

  const periodLabel = sortedYears.length
    ? `${sortedYears[0]} → ${sortedYears[sortedYears.length - 1]}`
    : "—";

  const addYear = (year: number) => {
    if (!Number.isFinite(year)) return;
    setSelectedYears((previous) =>
      previous.includes(year)
        ? previous
        : [...previous, year].sort((a, b) => a - b),
    );
    setDeclarationByYear((previous) =>
      Object.prototype.hasOwnProperty.call(previous, year)
        ? previous
        : { ...previous, [year]: false },
    );
  };

  const removeYear = (year: number) => {
    setSelectedYears((previous) => previous.filter((value) => value !== year));
    setDeclarationByYear((previous) => {
      const next = { ...previous };
      delete next[year];
      return next;
    });
  };

  const toggleDeclaration = (year: number) => {
    setDeclarationByYear((previous) => ({
      ...previous,
      [year]: !previous[year],
    }));
  };

  const setZoneDefaults = () => {
    setLegacyZone("R3");
    setModernZone("A");
    setModernRate(DEFAULT_MODERN_RATE.A);
  };

  const reset = () => {
    const defaults = getRecentTaxYears(4);
    const freshToday = todayInputValue();
    setSelectedYears(defaults);
    setDeclarationByYear(buildDeclarations(defaults));
    setArea("500");
    setZoneDefaults();
    setToday(freshToday);
    setCalcDate(freshToday);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    document
      .getElementById("tnb-breakdown")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /**
   * The PDF is built from the exact same `visibleResult` object rendered in the
   * table; no amount is recalculated. jsPDF is loaded on demand so it never
   * weighs on the initial page bundle.
   */
  const handleDownloadPdf = async () => {
    if (!visibleResult?.aggregates) return;
    const report = buildTnbReport({
      result: visibleResult,
      surfaceArea: parsedArea,
    });
    if (!report) {
      setPdfState("error");
      return;
    }

    setPdfState("working");
    try {
      const { downloadTnbReport } = await import("@/lib/tnb-pdf");
      downloadTnbReport(report);
      setPdfState("idle");
    } catch (error) {
      console.error("TNB PDF generation failed", error);
      setPdfState("error");
    }
  };

  const issueMessage = (issue: TnbIssue): string => {
    switch (issue.code) {
      case "no-years":
        return t("tnb.noYears");
      case "invalid-area":
        return t("tnb.enterArea");
      case "invalid-zone":
        return t("tnb.invalidZoneField");
      case "invalid-rate":
        return t("tnb.invalidRateField");
      case "invalid-date":
        return t("tnb.invalidDate");
      case "invalid-year":
        return t("tnb.invalidYear", { year: issue.year ?? "—" });
      case "year-in-future":
        return t("tnb.yearFuture", { year: issue.year ?? "—" });
      case "missing-declaration":
        return t("tnb.missingDeclaration", { year: issue.year ?? "—" });
      case "unresolved-tariff": {
        const row = result.years.find(
          (value) => value.taxYear === issue.year,
        );
        const reason =
          row && row.tariff.status === "unresolved"
            ? row.tariff.reason
            : "no-rule";
        return t(tariffUnresolvedMessageKey(reason), {
          year: issue.year ?? "—",
        });
      }
      default:
        return t("common.disclaimer");
    }
  };

  const alerts = useMemo(() => {
    if (!mounted) return [];
    const messages = result.issues.map(issueMessage);
    if (calcDateInFuture) messages.push(t("tnb.dateWarning"));
    return Array.from(new Set(messages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, calcDateInFuture, language, mounted]);

  return (
    <>
      <PageHero
        eyebrow="TNB · Taxe foncière"
        title={t("tax.tnb")}
        description={t("tax.tnb.desc")}
        icon={MapIcon}
        backHref="/"
      >
        <div className="min-w-[210px] rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
            {t("tnb.rateSummaryLabel")}
          </p>
          <p className="mt-2 text-[34px] font-extrabold leading-none tracking-[-0.04em]">
            {minRate === null ? (
              <span className="text-[19px] text-white/80">{rateLabel}</span>
            ) : (
              <>
                {rateLabel}{" "}
                <span className="text-[15px] font-bold text-white/65">
                  DH/m²
                </span>
              </>
            )}
          </p>
          <p className="mt-2 text-[11.5px] font-semibold text-white/65">
            {sortedYears.length} {t("tnb.yearsCount")} · {periodLabel}
          </p>
          {unresolvedYears.length > 0 ? (
            <p className="mt-1 text-[10.5px] font-bold text-[#ffd166]">
              {t("tnb.unresolvedShort")} · {unresolvedYears.length}
            </p>
          ) : null}
        </div>
      </PageHero>

      <section className="container-page mt-6">
        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.75fr]">
          <div>
            <form onSubmit={handleSubmit} className="card p-5 sm:p-7">
              <SectionHeading
                icon={Calculator}
                title={t("tnb.formTitle")}
                description={t("tnb.formHint")}
              />

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                      <History size={17} />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold">
                        {t("tnb.yearsTitle")}
                      </p>
                      <p className="text-[11px] text-muted">
                        {t("tnb.yearsHint", {
                          from: earliestYear ?? "—",
                          to: latestYear ?? "—",
                        })}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-brand">
                    {sortedYears.length} {t("tnb.yearsSelected")}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {sortedYears.map((year) => (
                    <button
                      key={year}
                      type="button"
                      className="chip chip-active gap-1.5"
                      onClick={() => removeYear(year)}
                      title={t("tnb.removeYear")}
                      aria-label={`${t("tnb.removeYear")} ${year}`}
                    >
                      {year}
                      <X size={12} />
                    </button>
                  ))}
                  {sortedYears.length === 0 ? (
                    <span className="text-[12px] font-semibold text-[var(--danger)]">
                      {t("tnb.noYears")}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="block">
                    <span className="field-label">{t("tnb.addYear")}</span>
                    <select
                      className="select-field"
                      value=""
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        if (Number.isFinite(value) && value > 0) addYear(value);
                      }}
                      disabled={availableYears.length === 0}
                    >
                      <option value="" disabled>
                        {availableYears.length === 0
                          ? t("tnb.allYearsSelected")
                          : t("tnb.chooseYear")}
                      </option>
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>
                  {sortedYears.length > 0 ? (
                    <span className="badge badge-warning h-[46px] justify-center">
                      {declaredCount} {t("tnb.declaredShort")}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-[var(--border)] p-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                    <Check size={17} />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold">
                      {t("tnb.declarationsTitle")}
                    </p>
                    <p className="text-[11px] text-muted">
                      {t("tnb.declarationsHint")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {sortedYears.map((year) => {
                    const declared = Boolean(declarationsForCalculation[year]);
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => toggleDeclaration(year)}
                        aria-pressed={declared}
                        className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-start transition ${
                          declared
                            ? "border-[color-mix(in_srgb,var(--success)_30%,transparent)] bg-[var(--success-soft)]"
                            : "border-[var(--border)] bg-[var(--surface-2)]"
                        }`}
                      >
                        <span className="text-[12.5px] font-bold">{year}</span>
                        <span
                          className={`badge ${
                            declared ? "badge-success" : "badge-warning"
                          }`}
                        >
                          {declared ? t("tnb.declared") : t("tnb.notDeclared")}
                        </span>
                      </button>
                    );
                  })}
                  {sortedYears.length === 0 ? (
                    <p className="text-[12px] text-muted">
                      {t("tnb.noYears")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <label className="block">
                  <span className="field-label">{t("tnb.areaLabel")}</span>
                  <div className="relative">
                    <Ruler
                      size={16}
                      className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted"
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="any"
                      className="input-field ps-10"
                      placeholder={t("tnb.areaHint")}
                      value={area}
                      onChange={(event) => setArea(event.target.value)}
                    />
                  </div>
                </label>

                {hasLegacyYears ? (
                  <label className="block">
                    <span className="field-label">
                      {t("tnb.legacyZoneLabel")}
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

                {hasModernYears ? (
                  <label className="block">
                    <span className="field-label">
                      {t("tnb.modernZoneLabel")}
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
                ) : null}

                {hasModernYears ? (
                  <label className="block">
                    <span className="field-label">
                      {t("tnb.modernRateLabel")}
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
                ) : null}

                <label className="block">
                  <span className="field-label">{t("tnb.calcDate")}</span>
                  <div className="relative">
                    <CalendarDays
                      size={16}
                      className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted rtl:hidden"
                    />
                    <input
                      type="date"
                      className="input-field ps-10 rtl:ps-4"
                      value={calcDate}
                      max={today}
                      onChange={(event) => setCalcDate(event.target.value)}
                    />
                  </div>
                  <span className="mt-1 block text-[10.5px] text-muted">
                    {t("tnb.calcDateHint")}
                  </span>
                </label>
              </div>

              {hasModernYears ? (
                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
                  {t("tnb.zoneScheduleHint")}
                </div>
              ) : null}

              {alerts.length > 0 ? (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--danger)_22%,transparent)] bg-[color-mix(in_srgb,var(--danger)_7%,transparent)] px-3.5 py-2.5 text-[12px] font-semibold text-[var(--danger)]">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    {alerts.map((message) => (
                      <p key={message}>{message}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="btn btn-primary h-11 flex-1">
                  <Calculator size={16} />
                  {t("tnb.viewBreakdown")}
                  <ArrowRight size={15} className="rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  className="btn btn-secondary h-11"
                  onClick={reset}
                >
                  {t("common.reset")}
                </button>
              </div>
            </form>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: t("tnb.rateRule1"),
                  value: "2 DH/m²",
                  color: "#d97706",
                },
                {
                  label: t("tnb.rateRule2"),
                  value: "4 DH/m²",
                  color: "#ef4444",
                },
                {
                  label: t("tnb.rateRule3"),
                  value: "6 / 8 / 10 DH/m²",
                  color: "var(--brand)",
                },
                {
                  label: t("tnb.rateRule4"),
                  value: "15 / 20 · 6 / 10 DH/m²",
                  color: "#0ea5e9",
                },
              ].map((rule) => (
                <div key={rule.label} className="card-soft p-4">
                  <p className="text-[10.5px] font-bold uppercase leading-relaxed tracking-[0.06em] text-muted">
                    {rule.label}
                  </p>
                  <p
                    className="mt-2 text-[19px] font-extrabold tracking-[-0.02em]"
                    style={{ color: rule.color }}
                  >
                    {rule.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
            <div className="card overflow-hidden">
              <div className="bg-[linear-gradient(135deg,#0F172A,#2563EB_58%,#1D4ED8)] p-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                  {t("tnb.grandTotal")}
                </p>
                <div className="mt-3">
                  {visibleResult?.aggregates ? (
                    <p className="text-[38px] font-extrabold leading-none tracking-[-0.05em]">
                      <Money value={visibleResult.aggregates.annualTotal} />
                    </p>
                  ) : (
                    <p className="text-[38px] font-extrabold leading-none tracking-[-0.05em] text-white/45">
                      —
                    </p>
                  )}
                </div>
                <p className="mt-2 text-[11.5px] text-white/65">
                  {visibleResult?.complete
                    ? t("tnb.totalComplete")
                    : t("tnb.totalPartial")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="badge badge-white">
                    {sortedYears.length} {t("tnb.yearsCount")}
                  </span>
                  <span className="badge badge-white">{zoneBadgeLabel}</span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold text-muted">
                    {t("tnb.period")}
                  </span>
                  <Tag size={15} className="text-[var(--brand)]" />
                </div>
                <p className="mt-2 text-[22px] font-extrabold leading-none tracking-[-0.03em] text-[var(--brand)]">
                  {periodLabel}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[var(--surface-2)] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                      {t("tnb.rateSummaryLabel")}
                    </p>
                    <p className="mt-1 text-[12.5px] font-bold">
                      {minRate === null ? rateLabel : `${rateLabel} DH/m²`}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[var(--surface-2)] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                      {t("tnb.areaLabel")}
                    </p>
                    <p className="mt-1 text-[12.5px] font-bold">
                      {Number.isFinite(parsedArea) && parsedArea > 0
                        ? `${formatNumber(parsedArea, language, 2)} m²`
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 result-row">
                  <span className="text-[12px] text-muted">
                    {t("tnb.declaredShort")}
                  </span>
                  <span className="text-[12px] font-bold">
                    {declaredCount} / {sortedYears.length}
                  </span>
                </div>
                <div className="result-row">
                  <span className="text-[12px] text-muted">
                    {t("tnb.calcDate")}
                  </span>
                  <span className="text-[12px] font-bold">
                    {calcDateValid ? calcDate : "—"}
                  </span>
                </div>
                {unresolvedYears.length > 0 ? (
                  <div className="result-row">
                    <span className="text-[12px] text-muted">
                      {t("tnb.unresolvedShort")}
                    </span>
                    <span className="text-[12px] font-bold text-[var(--warning)]">
                      {unresolvedYears.length}
                    </span>
                  </div>
                ) : null}

                <a href="#tnb-breakdown" className="btn btn-secondary mt-4 h-10 w-full">
                  {t("tnb.viewBreakdown")}
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </a>
              </div>
            </div>

            <InfoNote>{t("tnb.arreasNotice")}</InfoNote>
          </aside>
        </div>
      </section>

      <section
        id="tnb-breakdown"
        className="container-page mt-8 scroll-mt-24"
      >
        <div className="card overflow-hidden">
          <div className="border-b border-[var(--border)] p-5 sm:p-6">
            <SectionHeading
              icon={History}
              title={t("tnb.breakdownTitle")}
              description={t("tnb.breakdownHint")}
              action={
                sortedYears.length > 0 ? (
                  <span className="badge badge-brand">
                    {sortedYears.length} {t("tnb.yearsCount")}
                  </span>
                ) : null
              }
            />
          </div>

          {visibleResult && visibleResult.years.length > 0 ? (
            <>
              <div className="table-wrap m-4 sm:m-6">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t("tnb.yearCol")}</th>
                      <th>{t("tnb.declarationCol")}</th>
                      <th>{t("tnb.zoneCol")}</th>
                      <th>{t("tnb.tariffCol")}</th>
                      <th className="text-end">{t("tnb.surfaceCol")}</th>
                      <th className="text-end">{t("tnb.principal")}</th>
                      <th className="text-end">{t("tnb.def")}</th>
                      <th className="text-end">{t("tnb.maj10")}</th>
                      <th className="text-end">{t("tnb.maj5")}</th>
                      <th className="text-end">{t("tnb.monthsLate")}</th>
                      <th className="text-end">{t("tnb.maj05")}</th>
                      <th className="text-end">{t("tnb.annualTotal")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleResult.years.map((row: TnbYearResult) => {
                      const tariff = row.tariff;
                      const zone = tariff.zone;
                      const modern = isModernZone(zone);
                      const zoneBased = zone !== null;
                      const ruleId =
                        tariff.status === "resolved" ? tariff.rule.id : "";
                      const zoneLabel =
                        zone === null
                          ? t("tnb.allZones")
                          : modern
                            ? t(MODERN_ZONE_LABEL_KEYS[zone])
                            : t(LEGACY_ZONE_LABEL_KEYS[zone]);
                      return (
                        <tr key={row.taxYear}>
                          <td className="font-bold text-[var(--text)]">
                            {row.taxYear}
                          </td>
                          <td>
                            {row.isDeclared === null ? (
                              <span className="badge badge-warning">
                                {t("tnb.unresolvedShort")}
                              </span>
                            ) : (
                              <span
                                className={`badge ${
                                  row.isDeclared
                                    ? "badge-success"
                                    : "badge-warning"
                                }`}
                              >
                                {row.isDeclared
                                  ? t("tnb.declared")
                                  : t("tnb.notDeclared")}
                              </span>
                            )}
                          </td>
                          <td className="text-[12px] font-semibold">
                            {zoneLabel}
                          </td>
                          <td>
                            {tariff.status === "resolved" ? (
                              <span className="inline-flex flex-col gap-1">
                                <span className="inline-flex items-center gap-2 font-semibold">
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                      background: modern
                                        ? "#0ea5e9"
                                        : zoneBased
                                          ? "var(--brand)"
                                          : ruleId === "tnb-2018-2020"
                                            ? "#ef4444"
                                            : "#f59e0b",
                                    }}
                                  />
                                  {formatNumber(tariff.rate, language, 2)} DH/m²
                                </span>
                                <span
                                  className={`badge ${
                                    modern || zoneBased
                                      ? "badge-brand"
                                      : "badge-warning"
                                  }`}
                                >
                                  {modern
                                    ? t("tnb.modernBadge")
                                    : zoneBased
                                      ? t("tnb.currentBadge")
                                      : t("tnb.historicalBadge")}
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex flex-col gap-1">
                                <span className="badge badge-warning">
                                  {tariff.reason === "unconfirmed-rule"
                                    ? t("tnb.unconfirmedShort")
                                    : t("tnb.unresolvedShort")}
                                </span>
                                <span className="text-[10.5px] leading-snug text-[var(--warning)]">
                                  {t(tariffUnresolvedMessageKey(tariff.reason), {
                                    year: row.taxYear,
                                  })}
                                </span>
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            {formatNumber(row.surfaceArea, language, 2)} m²
                          </td>
                          {row.amounts ? (
                            <>
                              <td className="text-end">
                                <Money value={row.amounts.principal} />
                              </td>
                              <td className="text-end">
                                <Money value={row.amounts.def} />
                              </td>
                              <td className="text-end">
                                <Money value={row.amounts.majoration10} />
                              </td>
                              <td className="text-end">
                                <Money value={row.amounts.majoration5} />
                              </td>
                              <td className="text-end">
                                {row.amounts.monthsLate}
                              </td>
                              <td className="text-end">
                                <Money value={row.amounts.majoration05} />
                              </td>
                              <td className="text-end font-bold text-[var(--brand)]">
                                <Money value={row.amounts.annualTotal} />
                              </td>
                            </>
                          ) : (
                            <td
                              colSpan={9}
                              className="text-end text-[11.5px] font-semibold text-muted"
                            >
                              {t("tnb.unresolvedShort")}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
                    {t("tnb.grandTotal")}
                  </p>
                  <p className="text-[11.5px] text-muted">
                    {visibleResult.complete
                      ? t("tnb.totalComplete")
                      : t("tnb.totalPartial")}
                    {" · "}
                    {t("tnb.roundingNote")}
                  </p>
                </div>

                {visibleResult.aggregates ? (
                  <>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                      {[
                        {
                          label: t("tnb.principal"),
                          value: visibleResult.aggregates.principal,
                        },
                        {
                          label: t("tnb.def"),
                          value: visibleResult.aggregates.def,
                        },
                        {
                          label: t("tnb.maj10"),
                          value: visibleResult.aggregates.majoration10,
                        },
                        {
                          label: t("tnb.maj5"),
                          value: visibleResult.aggregates.majoration5,
                        },
                        {
                          label: t("tnb.maj05"),
                          value: visibleResult.aggregates.majoration05,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl bg-[var(--surface)] px-3 py-2.5"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                            {item.label}
                          </p>
                          <p className="mt-1 text-[13px] font-bold">
                            <Money value={item.value} />
                          </p>
                        </div>
                      ))}
                      <div className="rounded-xl bg-[var(--surface)] px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                          {t("tnb.grandTotal")}
                        </p>
                        <p className="mt-1 text-[15px] font-extrabold text-[var(--brand)]">
                          <Money value={visibleResult.aggregates.annualTotal} />
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                      <p className="text-[11.5px] text-muted">{periodLabel}</p>
                      <p className="text-[28px] font-extrabold tracking-[-0.04em] text-[var(--brand)]">
                        <Money value={visibleResult.aggregates.annualTotal} />
                      </p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-xl text-[11px] leading-relaxed text-muted">
                        {t("tnb.pdfHint")}
                      </p>
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={pdfState === "working"}
                        className="btn btn-primary h-10 shrink-0 disabled:cursor-wait disabled:opacity-70"
                      >
                        {pdfState === "working" ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <FileDown size={16} />
                        )}
                        {pdfState === "working"
                          ? t("tnb.preparingPdf")
                          : t("tnb.downloadPdf")}
                      </button>
                    </div>
                    {pdfState === "error" ? (
                      <p className="mt-2 text-[11.5px] font-semibold text-[var(--danger)]">
                        {t("tnb.pdfError")}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-3 text-[13px] font-semibold text-muted">
                    {t("tnb.noResult")}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-[13px] text-muted">
              {t("tnb.noResult")}
            </div>
          )}
        </div>

        {visibleResult && visibleResult.years.length > 0 ? (
          <div className="mt-5">
            <TnbCalculationExplainer result={visibleResult} />
          </div>
        ) : null}
      </section>

      <section id="history" className="container-page mt-10 scroll-mt-24">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="card p-6">
            <SectionHeading
              icon={History}
              title={t("dashboard.timelineTitle")}
              description={t("tnb.timelineHint")}
            />
            <div className="timeline-line" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: t("dashboard.before2018"),
                  rate: "2 DH/m²",
                  hint: language === "ar" ? "قبل 2018" : "Date < 01/01/2018",
                  color: "#d97706",
                },
                {
                  label: t("dashboard.years2018"),
                  rate: "4 DH/m²",
                  hint: "2018 · 2019 · 2020",
                  color: "#ef4444",
                },
                {
                  label: t("dashboard.since2021"),
                  rate: "6–10 DH/m²",
                  hint: "2021 · 2025",
                  color: "var(--brand)",
                },
                {
                  label: t("tnb.modernBadge"),
                  rate: "15/20 · 6/10",
                  hint: "2026+",
                  color: "#0ea5e9",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
                >
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                    {item.label}
                  </p>
                  <p
                    className="mt-2 text-[24px] font-extrabold tracking-[-0.03em]"
                    style={{ color: item.color }}
                  >
                    {item.rate}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Tag size={17} />
              </span>
              <h3 className="text-[15px] font-extrabold">
                {t("tnb.rateCardTitle")}
              </h3>
            </div>
            <div className="mt-4 space-y-3">
              {[
                t("tnb.rateRule1"),
                t("tnb.rateRule2"),
                t("tnb.rateRule3"),
                t("tnb.rateRule4"),
              ].map((rule) => (
                <div key={rule} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                  <p className="text-[12px] leading-relaxed text-soft">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-[11.5px] leading-relaxed text-muted">
              {t("tnb.historyNote")}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
