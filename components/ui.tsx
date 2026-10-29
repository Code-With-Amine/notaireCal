"use client";

import Link from "next/link";
import { Info, ChevronLeft, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useApp } from "@/components/app-providers";
import { formatMoney } from "@/lib/format";
import { TAX_YEARS, type TrimesterSelection } from "@/lib/calculators";

export function Money({
  value,
  className = "",
  digits = 2,
}: {
  value: number;
  className?: string;
  digits?: number;
}) {
  const { language } = useApp();
  return <span className={className}>{formatMoney(value, language, digits)}</span>;
}

export function PageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  backHref,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  backHref?: string;
  children?: React.ReactNode;
}) {
  const { t } = useApp();
  return (
    <section className="container-page pt-7">
      <div className="hero-gradient relative overflow-hidden rounded-[28px] px-6 py-8 text-white shadow-[0_24px_60px_rgba(18,28,90,0.3)] sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-6 -top-10 h-40 w-40 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-white/5 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div className="max-w-2xl">
            {backHref ? (
              <Link
                href={backHref}
                className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70 transition hover:text-white"
              >
                <ChevronLeft size={14} className="rtl:rotate-180" />
                {t("common.back")}
              </Link>
            ) : null}
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
                <Icon size={21} />
              </span>
              {eyebrow ? (
                <span className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/65">
                  {eyebrow}
                </span>
              ) : null}
            </div>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-[40px]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/72 sm:text-[15px]">
                {description}
              </p>
            ) : null}
          </div>
          {children ? <div className="shrink-0">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
            <Icon size={17} />
          </span>
        ) : null}
        <div>
          <h2 className="text-[18px] font-extrabold tracking-[-0.02em]">{title}</h2>
          {description ? (
            <p className="mt-0.5 max-w-2xl text-[12.5px] leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function InfoNote({
  children,
  variant = "brand",
  icon: Icon = Info,
}: {
  children: React.ReactNode;
  variant?: "brand" | "warning" | "success";
  icon?: LucideIcon;
}) {
  const styles = {
    brand: {
      background: "var(--brand-soft)",
      color: "var(--brand)",
      border: "color-mix(in srgb, var(--brand) 18%, transparent)",
    },
    warning: {
      background: "var(--warning-soft)",
      color: "var(--warning)",
      border: "color-mix(in srgb, var(--warning) 20%, transparent)",
    },
    success: {
      background: "var(--success-soft)",
      color: "var(--success)",
      border: "color-mix(in srgb, var(--success) 20%, transparent)",
    },
  }[variant];

  return (
    <div
      className="flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-[12.5px] leading-relaxed"
      style={styles}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function RatePill({
  rate,
  label,
  tone = "brand",
}: {
  rate: string;
  label?: string;
  tone?: "brand" | "warning" | "success";
}) {
  const toneClass = {
    brand: "badge-brand",
    warning: "badge-warning",
    success: "badge-success",
  }[tone];
  return (
    <span className={`badge ${toneClass}`}>
      {label ? <span className="font-semibold normal-case tracking-normal opacity-80">{label}</span> : null}
      <span>{rate}</span>
    </span>
  );
}

export function TrimesterPicker({
  selection,
  onChange,
  compact = false,
}: {
  selection: TrimesterSelection;
  onChange: (next: TrimesterSelection) => void;
  compact?: boolean;
}) {
  const { language } = useApp();

  const toggle = (year: number, index: number) => {
    const next: TrimesterSelection = {};
    TAX_YEARS.forEach((taxYear) => {
      next[taxYear] = [...(selection[taxYear] ?? [false, false, false, false])];
    });
    next[year][index] = !next[year][index];
    onChange(next);
  };

  const labels =
    language === "ar" ? ["ر1", "ر2", "ر3", "ر4"] : ["T1", "T2", "T3", "T4"];

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {TAX_YEARS.map((year) => (
        <div key={year}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[12px] font-bold text-muted">{year}</span>
            <button
              type="button"
              className="text-[11px] font-semibold text-[var(--brand)] hover:underline"
              onClick={() => {
                const current = selection[year] ?? [false, false, false, false];
                const allSelected = current.every(Boolean);
                const next: TrimesterSelection = {};
                TAX_YEARS.forEach((taxYear) => {
                  next[taxYear] = [...(selection[taxYear] ?? [false, false, false, false])];
                });
                next[year] = current.map(() => !allSelected);
                onChange(next);
              }}
            >
              {language === "ar" ? "الكل" : "Tout"}
            </button>
          </div>
          <div className="trimester-grid">
            {labels.map((label, index) => {
              const active = selection[year]?.[index] ?? false;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={active}
                  className={`trimester-btn ${active ? "trimester-btn-active" : ""}`}
                  onClick={() => toggle(year, index)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MonthYearPicker({
  month,
  year,
  onMonthChange,
  onYearChange,
  years,
}: {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  years: number[];
}) {
  const { months, t } = useApp();
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block">
        <span className="field-label">{t("forecast.month")}</span>
        <select
          className="select-field"
          value={month}
          onChange={(event) => onMonthChange(Number(event.target.value))}
        >
          {months.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="field-label">{t("forecast.year")}</span>
        <select
          className="select-field"
          value={year}
          onChange={(event) => onYearChange(Number(event.target.value))}
        >
          {years.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function FeatureBadge() {
  const { t } = useApp();
  return (
    <span className="badge badge-white">
      <Sparkles size={11} />
      {t("tax.new")}
    </span>
  );
}

export function StatCard({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <div className="stat flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[20px] font-extrabold leading-none tracking-tight">{value}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          {label}
        </p>
      </div>
    </div>
  );
}
