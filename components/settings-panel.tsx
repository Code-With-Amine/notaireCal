"use client";

import { Check, Languages, Moon, Palette, Settings, Sun } from "lucide-react";
import { useApp } from "@/components/app-providers";
import { InfoNote, PageHero, SectionHeading } from "@/components/ui";

export function SettingsPanel() {
  const {
    t,
    language,
    setLanguage,
    theme,
    setTheme,
  } = useApp();

  return (
    <>
      <PageHero
        eyebrow={t("nav.settings")}
        title={t("settings.title")}
        description={t("settings.subtitle")}
        icon={Settings}
        backHref="/"
      >
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-[11.5px] text-white/70 backdrop-blur">
          {t("settings.preferences")}
        </div>
      </PageHero>

      <section className="container-page mt-7 max-w-4xl">
        <div className="space-y-6">
          <div className="card p-5 sm:p-7">
            <SectionHeading
              icon={Languages}
              title={t("settings.language")}
              description={t("settings.language")}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: "fr" as const, label: t("settings.french"), hint: "FR" },
                { value: "ar" as const, label: t("settings.arabic"), hint: "AR" },
              ].map((option) => {
                const active = language === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLanguage(option.value)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-start transition ${
                      active
                        ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                        : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <div>
                      <p className="text-[14px] font-bold">{option.label}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                        {option.hint}
                      </p>
                    </div>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        active
                          ? "bg-[var(--brand)] text-white"
                          : "border border-[var(--border)] bg-[var(--surface)] text-transparent"
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-5 sm:p-7">
            <SectionHeading
              icon={Palette}
              title={t("settings.appearance")}
              description={t("settings.themeHint")}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: "light" as const,
                  label: t("settings.lightMode"),
                  icon: Sun,
                  preview: "bg-[#f4f6fc] text-[#0c1426]",
                },
                {
                  value: "dark" as const,
                  label: t("settings.darkMode"),
                  icon: Moon,
                  preview: "bg-[#070b16] text-[#f1f5f9]",
                },
              ].map((option) => {
                const Icon = option.icon;
                const active = theme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`overflow-hidden rounded-2xl border text-start transition ${
                      active
                        ? "border-[var(--brand)] shadow-[0_10px_26px_rgba(38,46,227,0.14)]"
                        : "border-[var(--border)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <div
                      className={`relative flex h-28 flex-col justify-between p-4 ${option.preview}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold">Daribati</span>
                        <Icon size={15} />
                      </div>
                      <div className="space-y-1.5">
                        <span className="block h-2 w-2/3 rounded-full bg-current opacity-25" />
                        <span className="block h-2 w-1/2 rounded-full bg-current opacity-15" />
                        <span className="block h-2 w-3/4 rounded-full bg-current opacity-10" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-[13px] font-bold">{option.label}</span>
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          active
                            ? "bg-[var(--brand)] text-white"
                            : "border border-[var(--border)] text-transparent"
                        }`}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <InfoNote variant="success">
            {t("settings.preferences")}
          </InfoNote>
        </div>
      </section>
    </>
  );
}
