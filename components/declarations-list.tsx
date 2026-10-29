"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Car,
  FileText,
  GlassWater,
  History,
  Hotel,
  Map as MapIcon,
  Sparkles,
} from "lucide-react";
import { useApp } from "@/components/app-providers";
import { FeatureBadge, PageHero, SectionHeading } from "@/components/ui";

const declarations = [
  {
    href: "/tnb",
    titleKey: "tax.tnb",
    descKey: "tax.tnb.desc",
    icon: MapIcon,
    gradient: "from-[#1e1b8f] to-[#0052cc]",
    new: true,
  },
  {
    href: "/taxi",
    titleKey: "tax.taxi",
    descKey: "tax.taxi.desc",
    icon: Car,
    gradient: "from-[#0f766e] to-[#22c55e]",
  },
  {
    href: "/drinks",
    titleKey: "tax.drinks",
    descKey: "tax.drinks.desc",
    icon: GlassWater,
    gradient: "from-[#7c2d12] to-[#f59e0b]",
  },
  {
    href: "/sejour",
    titleKey: "tax.sejour",
    descKey: "tax.sejour.desc",
    icon: Hotel,
    gradient: "from-[#8b4513] to-[#d2691e]",
  },
];

export function DeclarationsList() {
  const { t, language } = useApp();

  return (
    <>
      <PageHero
        eyebrow={t("nav.declarations")}
        title={t("declarations.title")}
        description={t("declarations.subtitle")}
        icon={FileText}
        backHref="/"
      >
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
            {t("declarations.available")}
          </p>
          <p className="mt-1 text-[26px] font-extrabold leading-none">4</p>
        </div>
      </PageHero>

      <section className="container-page mt-7">
        <SectionHeading
          icon={FileText}
          title={t("declarations.title")}
          description={t("declarations.subtitle")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {declarations.map((declaration) => {
            const Icon = declaration.icon;
            return (
              <Link
                key={declaration.href}
                href={declaration.href}
                className="card group relative overflow-hidden p-5 transition hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--brand)_25%,var(--border))] hover:shadow-[var(--shadow-lg)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${declaration.gradient} text-white shadow-md`}
                  >
                    <Icon size={22} />
                  </span>
                  <div className="flex items-center gap-2">
                    {declaration.new ? <FeatureBadge /> : null}
                    <span className="badge badge-success">
                      {t("declarations.available")}
                    </span>
                  </div>
                </div>
                <h3 className="mt-5 text-[18px] font-extrabold tracking-[-0.02em]">
                  {t(declaration.titleKey)}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  {t(declaration.descKey)}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-muted">
                    <History size={13} />
                    {language === "ar" ? "2023 — 2026" : "2023 — 2026"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--brand)] transition group-hover:gap-2">
                    {t("declarations.open")}
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            href="/tnb#history"
            className="card-soft group relative overflow-hidden p-5 transition hover:border-[var(--border-strong)]"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#f59e0b,#ef4444)] text-white">
                <History size={20} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-extrabold">
                    {t("dashboard.historicalTitle")}
                  </h3>
                  <FeatureBadge />
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                  {t("dashboard.historicalDesc")}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-bold text-[var(--brand)]">
                  {t("dashboard.historicalCta")}
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/forecast"
            className="card-soft group relative overflow-hidden p-5 transition hover:border-[var(--border-strong)]"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#262ee3,#0052cc)] text-white">
                <Sparkles size={20} />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-extrabold">
                    {t("dashboard.forecastTitle")}
                  </h3>
                  <FeatureBadge />
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                  {t("dashboard.forecastDesc")}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-bold text-[var(--brand)]">
                  {t("dashboard.forecastCta")}
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </>
  );
}
