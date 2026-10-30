"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  Clock3,
  FileSearch,
  History,
  Receipt,
  Landmark,
  Map,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import { FeatureBadge, StatCard } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import { ZONE_RATES } from "@/lib/rates";

const taxCards = [
  {
    href: "/tva",
    titleKey: "tax.tva",
    descKey: "tax.tva.desc",
    icon: Receipt,
    className: "card-tax-tva",
    badgeKey: "tax.new",
    accent: "#0f5132",
  },
  {
    href: "/tnb",
    titleKey: "tax.tnb",
    descKey: "tax.tnb.desc",
    icon: Map,
    className: "card-tax-tnb",
    badgeKey: "tax.new",
    accent: "#8b95ff",
  },
  {
    href: "/cnp",
    titleKey: "tax.cnp",
    descKey: "tax.cnp.desc",
    icon: FileSearch,
    className: "card-tax-cnp",
    badgeKey: "tax.consultation",
    accent: "#10b981",
  },
];

export function Dashboard() {
  const { t, language, months, shortMonths } = useApp();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const targetMonth = currentMonth === 11 ? "Novembre" : months[11];
  const previewAmount = formatMoney(1850, language, 0);
  const zoneAverage = Math.round(
    (ZONE_RATES.R3 + ZONE_RATES.R5 + ZONE_RATES.R7) / 3,
  );

  return (
    <div className="pb-4">
      <section className="container-page pt-6">
        <div className="hero-gradient relative overflow-hidden rounded-[32px] px-6 py-8 text-white shadow-[0_30px_80px_rgba(18,28,90,0.34)] sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-4 -top-14 h-[280px] w-[280px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-[-180px] left-1/4 h-[340px] w-[340px] rounded-full bg-white/5 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="fade-up">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="badge badge-white">
                  <ShieldCheck size={11} />
                  {language === "ar" ? "الإدارة المحلية · المغرب" : "Régie locale · Maroc"}
                </span>
                <span className="badge badge-white">
                  <Sparkles size={11} />
                  {t("dashboard.newTools")}
                </span>
              </div>

              <p className="mt-7 text-[14px] font-medium text-white/70">
                {t("dashboard.greeting")}{" "}
                <span className="font-bold text-white">Adnane</span>
              </p>
              <h1 className="mt-2 max-w-[620px] text-[34px] font-extrabold leading-[1.06] tracking-[-0.035em] sm:text-[46px]">
                {t("dashboard.title")}
              </h1>
              <p className="mt-4 max-w-[520px] text-[14px] leading-relaxed text-white/72 sm:text-[15px]">
                {t("dashboard.subtitle")}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="#taxes" className="btn btn-secondary h-11 px-5 text-[13px]">
                  {t("dashboard.choose")}
                  <ArrowRight size={15} className="rtl:rotate-180" />
                </Link>
                <Link
                  href="/forecast"
                  className="btn h-11 border-white/20 bg-white/10 px-5 text-[13px] text-white backdrop-blur transition hover:bg-white/18"
                >
                  <CalendarClock size={15} />
                  {t("dashboard.forecastCta")}
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[11.5px] font-semibold text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ffd166]" />2 DH/m² · {t("dashboard.before2018")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#fb7185]" />4 DH/m² · {t("dashboard.years2018")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  {ZONE_RATES.R3}–{ZONE_RATES.R7} DH/m² · {t("dashboard.since2021")}
                </span>
              </div>
            </div>

            <div className="fade-up fade-up-delay-2 hidden lg:block">
              <div className="float-slow relative rounded-[26px] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
                <div className="rounded-[20px] bg-white p-5 text-[#0c1426] shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5ec] text-[#0f5132]">
                        <TrendingUp size={16} />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#64748b]">
                          {t("dashboard.forecastTitle")}
                        </p>
                        <p className="text-[12px] font-bold">{targetMonth} {currentYear}</p>
                      </div>
                    </div>
                    <span className="badge badge-success">{t("common.estimate")}</span>
                  </div>
                  <p className="mt-5 text-[11px] font-semibold text-[#64748b]">
                    {t("forecast.monthlyInstallment")}
                  </p>
                  <p className="mt-1 text-[34px] font-extrabold leading-none tracking-[-0.04em] text-[#0f5132]">
                    {previewAmount}
                  </p>
                  <div className="mt-5 flex h-24 items-end gap-2">
                    {[34, 45, 40, 58, 72, 64, 88, 76, 96, 82, 100, 90].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md"
                          style={{
                            height: `${height}%`,
                            background:
                              index >= 8
                                ? "linear-gradient(180deg,#0f5132,#198754)"
                                : "#e3e8f6",
                          }}
                        />
                      ),
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">
                    <span>{shortMonths[0]}</span>
                    <span>{shortMonths[5]}</span>
                    <span>{shortMonths[11]}</span>
                  </div>
                  <Link
                    href="/forecast"
                    className="mt-4 flex items-center justify-between rounded-xl bg-[#f4f6fc] px-3.5 py-2.5 text-[11.5px] font-bold text-[#0f5132] transition hover:bg-[#e8f5ec]"
                  >
                    {t("dashboard.forecastCta")}
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            icon={Landmark}
            value={`4`}
            label={t("dashboard.statTaxes")}
          />
          <StatCard
            icon={History}
            value={`3`}
            label={t("dashboard.statRates")}
          />
          <StatCard
            icon={CalendarClock}
            value={`${currentYear + 5}`}
            label={t("dashboard.statForecast")}
          />
        </div>
      </section>

      <section className="container-page mt-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <span className="badge badge-brand">
              <Sparkles size={11} />
              {t("dashboard.newTools")}
            </span>
            <h2 className="mt-3 text-[24px] font-extrabold tracking-[-0.03em]">
              {language === "ar"
                ? "أدوات ذكية لتدبير ضرائبك"
                : "Des outils pensés pour anticiper"}
            </h2>
          </div>
          <span className="hidden text-[12px] text-muted sm:block">
            {currentYear}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Link href="/tnb#history" className="tool-card group fade-up">
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f59e0b,#ef4444)] text-white shadow-[0_10px_24px_rgba(245,158,11,0.28)]">
                  <History size={22} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[17px] font-extrabold tracking-[-0.02em]">
                      {t("dashboard.historicalTitle")}
                    </h3>
                    <FeatureBadge />
                  </div>
                  <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted">
                    {t("dashboard.historicalDesc")}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                  {t("dashboard.before2018")}
                </p>
                <p className="mt-1 text-[18px] font-extrabold text-[#d97706]">
                  2 DH
                </p>
                <p className="text-[10px] text-muted">/ m²</p>
              </div>
              <div className="rounded-xl border border-[color-mix(in_srgb,#ef4444_18%,var(--border))] bg-[color-mix(in_srgb,#ef4444_6%,var(--surface))] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                  {t("dashboard.years2018")}
                </p>
                <p className="mt-1 text-[18px] font-extrabold text-[#ef4444]">
                  4 DH
                </p>
                <p className="text-[10px] text-muted">/ m²</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                  {t("dashboard.since2021")}
                </p>
                <p className="mt-1 text-[18px] font-extrabold text-[var(--brand)]">
                  {ZONE_RATES.R3}–{ZONE_RATES.R7} DH
                </p>
                <p className="text-[10px] text-muted">/ m²</p>
              </div>
            </div>

            <div className="relative mt-5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted">
                <Clock3 size={13} />
                {language === "ar"
                  ? "من 2015 إلى اليوم"
                  : "De 2015 à aujourd'hui"}
              </span>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--brand)] transition group-hover:gap-2">
                {t("dashboard.historicalCta")}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </Link>

          <Link href="/forecast" className="tool-card group fade-up fade-up-delay-1">
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f5132,#198754)] text-white shadow-[0_10px_24px_rgba(38,46,227,0.28)]">
                  <CalendarClock size={22} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[17px] font-extrabold tracking-[-0.02em]">
                      {t("dashboard.forecastTitle")}
                    </h3>
                    <FeatureBadge />
                  </div>
                  <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted">
                    {t("dashboard.forecastDesc")}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                    {t("forecast.selectedDate")}
                  </p>
                  <p className="mt-1 text-[15px] font-extrabold">
                    {targetMonth} {currentYear}
                  </p>
                </div>
                <span className="badge badge-brand">{t("common.monthly")}</span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-muted">
                    {t("forecast.monthlyInstallment")}
                  </p>
                  <p className="text-[26px] font-extrabold leading-none tracking-[-0.04em] text-[var(--brand)]">
                    {previewAmount}
                  </p>
                </div>
                <div className="flex h-12 items-end gap-1.5">
                  {[30, 52, 44, 66, 58, 82, 74, 95].map((height, index) => (
                    <span
                      key={index}
                      className="w-2 rounded-t-sm"
                      style={{
                        height: `${height}%`,
                        background:
                          index > 4
                            ? "linear-gradient(180deg,#0f5132,#198754)"
                            : "var(--border)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted">
                <CalendarClock size={13} />
                {language === "ar"
                  ? "توقعات حتى 5 سنوات"
                  : "Projection jusqu'à 5 ans"}
              </span>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--brand)] transition group-hover:gap-2">
                {t("dashboard.forecastCta")}
                <ArrowRight size={14} className="rtl:rotate-180" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section id="taxes" className="container-page mt-12 scroll-mt-24">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[26px] font-extrabold tracking-[-0.03em]">
              {t("dashboard.taxesTitle")}
            </h2>
            <p className="mt-1 text-[12.5px] text-muted">
              {t("dashboard.taxesHint")}
            </p>
          </div>
          <Link
            href="/declarations"
            className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--brand)] hover:gap-2"
          >
            {t("nav.declarations")}
            <ChevronRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {taxCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`tax-tile ${card.className} group`}
              >
                <div className="relative z-10 flex h-full flex-col justify-between p-6">
                  <div className="flex items-start justify-between">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/12 backdrop-blur"
                      style={{ color: card.accent }}
                    >
                      <Icon size={23} />
                    </span>
                    <span className="flex items-center gap-2">
                      {card.badgeKey ? (
                        <span className="badge badge-white">{t(card.badgeKey)}</span>
                      ) : null}
                      <span className="tax-tile-arrow">
                        <ArrowUpRight size={16} />
                      </span>
                    </span>
                  </div>
                  <div>
                    <h3 className="max-w-[300px] text-[22px] font-extrabold leading-[1.14] tracking-[-0.025em]">
                      {t(card.titleKey)}
                    </h3>
                    <p className="mt-2 max-w-[380px] text-[12.5px] leading-relaxed text-white/70">
                      {t(card.descKey)}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-white/90">
                      {t("tax.open")}
                      <ArrowRight size={14} className="rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page mt-12">
        <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(38,46,227,0.14),transparent_68%)]" />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-brand">
                  <History size={11} />
                  {t("dashboard.timelineTitle")}
                </span>
                <span className="text-[11px] text-muted">
                  {t("dashboard.timelineHint")}
                </span>
              </div>
              <div className="mt-6 timeline-line" />
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  {
                    label: t("dashboard.before2018"),
                    rate: "2 DH/m²",
                    color: "#d97706",
                  },
                  {
                    label: t("dashboard.years2018"),
                    rate: "4 DH/m²",
                    color: "#ef4444",
                  },
                  {
                    label: t("dashboard.since2021"),
                    rate: `${ZONE_RATES.R3}–${ZONE_RATES.R7} DH/m²`,
                    color: "var(--brand)",
                  },
                ].map((step) => (
                  <div key={step.label}>
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">
                      {step.label}
                    </p>
                    <p
                      className="mt-1 text-[17px] font-extrabold"
                      style={{ color: step.color }}
                    >
                      {step.rate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/tnb"
              className="btn btn-primary h-11 px-5 text-[12.5px]"
            >
              {t("dashboard.historicalCta")}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <div className="container-page mt-6 flex items-center justify-center gap-2 text-[11px] text-muted">
        <ShieldCheck size={13} />
        {t("common.disclaimer")}
      </div>
    </div>
  );
}
