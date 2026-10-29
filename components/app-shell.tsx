"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CalendarClock,
  FileText,
  Home,
  Languages,
  Moon,
  Percent,
  Settings,
  Sun,
} from "lucide-react";
import { useApp } from "@/components/app-providers";

const navItems = [
  { href: "/", key: "nav.home", icon: Home },
  { href: "/declarations", key: "nav.declarations", icon: FileText },
  { href: "/forecast", key: "nav.forecast", icon: CalendarClock },
  { href: "/settings", key: "nav.settings", icon: Settings },
];

const taxPaths = ["/tnb", "/taxi", "/drinks", "/sejour"];

export function Brand({ compact = false }: { compact?: boolean }) {
  const { t } = useApp();
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={t("nav.home")}>
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#101c58] via-[#262ee3] to-[#0052cc] text-white shadow-[0_8px_20px_rgba(38,46,227,0.28)]">
        <span className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_25%_20%,white,transparent_35%)]" />
        <Percent size={23} strokeWidth={2.6} className="relative" />
      </span>
      <span className={compact ? "hidden sm:block" : "block"}>
        <span className="block text-[19px] font-extrabold leading-none tracking-[-0.03em]">
          Daribati
        </span>
        <span className="mt-1 block text-[9.5px] font-semibold uppercase tracking-[0.22em] text-muted">
          Taxes locales
        </span>
      </span>
    </Link>
  );
}

function HeaderControls() {
  const { t, isDark, toggleTheme, toggleLanguage, language } = useApp();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleLanguage}
        className="btn btn-ghost h-10 gap-1.5 px-2.5 text-[12px] font-bold"
        aria-label={t("settings.language")}
        title={t("settings.language")}
      >
        <Languages size={16} />
        <span className="hidden sm:inline">{language === "fr" ? "AR" : "FR"}</span>
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="btn btn-ghost btn-icon h-10 w-10"
        aria-label={isDark ? t("settings.lightMode") : t("settings.darkMode")}
        title={isDark ? t("settings.lightMode") : t("settings.darkMode")}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
      <Link
        href="/settings"
        className="btn btn-ghost btn-icon hidden h-10 w-10 sm:inline-flex"
        aria-label={t("nav.settings")}
      >
        <Settings size={17} />
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useApp();
  const isHome =
    pathname === "/" || taxPaths.some((path) => pathname.startsWith(path));

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-50 border-b border-[var(--border)]">
        <div className="container-page flex h-[72px] items-center justify-between gap-4">
          <Brand />

          <nav className="desktop-nav flex items-center gap-1" aria-label="Main">
            <Link
              href="/"
              className={`nav-link ${isHome ? "nav-link-active" : ""}`}
            >
              <Home size={15} />
              {t("nav.home")}
            </Link>
            <Link
              href="/declarations"
              className={`nav-link ${
                pathname.startsWith("/declarations") ? "nav-link-active" : ""
              }`}
            >
              <FileText size={15} />
              {t("nav.declarations")}
            </Link>
            <Link
              href="/forecast"
              className={`nav-link ${
                pathname.startsWith("/forecast") ? "nav-link-active" : ""
              }`}
            >
              <CalendarClock size={15} />
              {t("nav.forecast")}
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <HeaderControls />
            <Link
              href="/forecast"
              className="btn btn-primary ml-1 hidden h-10 px-3.5 text-[12.5px] md:inline-flex"
            >
              {t("dashboard.forecastCta")}
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="container-page py-10">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#101c58] via-[#262ee3] to-[#0052cc] text-white">
                  <Percent size={21} strokeWidth={2.6} />
                </span>
                <div>
                  <p className="text-[17px] font-extrabold leading-none tracking-tight">
                    Daribati
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                    {t("footer.tagline")}
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-muted">
                {t("common.disclaimer")}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                {t("nav.home")}
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[13px] text-soft">
                <Link href="/declarations" className="hover:text-[var(--brand)]">
                  {t("nav.declarations")}
                </Link>
                <Link href="/tnb" className="hover:text-[var(--brand)]">
                  {t("tax.tnb")}
                </Link>
                <Link href="/forecast" className="hover:text-[var(--brand)]">
                  {t("nav.forecast")}
                </Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                {t("nav.settings")}
              </p>
              <div className="mt-3 flex flex-col gap-2 text-[13px] text-soft">
                <Link href="/settings" className="hover:text-[var(--brand)]">
                  {t("settings.language")}
                </Link>
                <Link href="/settings" className="hover:text-[var(--brand)]">
                  {t("settings.appearance")}
                </Link>
                <Link href="/tnb#history" className="hover:text-[var(--brand)]">
                  {t("nav.rates")}
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-[var(--border)] pt-5 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>{t("footer.rights", { year: new Date().getFullYear() })}</span>
            <span>{t("footer.made")}</span>
          </div>
        </div>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? isHome
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${active ? "mobile-nav-item-active" : ""}`}
            >
              <Icon size={18} />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
