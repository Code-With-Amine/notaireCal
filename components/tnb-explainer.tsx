"use client";

import { useMemo } from "react";
import { BookOpen, ChevronDown, TriangleAlert } from "lucide-react";
import { useApp } from "@/components/app-providers";
import { SectionHeading } from "@/components/ui";
import { formatMoney, formatNumber } from "@/lib/format";
import type { Language } from "@/lib/i18n";
import type { TnbCalculationResult } from "@/lib/tnb";
import { TNB_EXPLANATIONS } from "@/lib/tnb-explanations";
import { buildTnbComponentValues } from "@/lib/tnb-report";
import type {
  TnbComponentValues,
  TnbExplanationValue,
  TnbReportUnit,
} from "@/lib/tnb-report";

function formatExplanationValue(
  entry: TnbExplanationValue,
  unit: TnbReportUnit,
  language: Language,
): string {
  if (!entry.applicable) return "—";
  switch (unit) {
    case "text":
      return entry.text ?? "—";
    case "m2":
      return `${formatNumber(entry.value ?? 0, language, 2)} m²`;
    case "rate":
      return `${formatNumber(entry.value ?? 0, language, 2)} DH/m²`;
    case "months":
      return `${entry.value ?? 0}`;
    default:
      return formatMoney(entry.value ?? 0, language, 2);
  }
}

/**
 * In-app version of the PDF explanations.
 *
 * It shares `TNB_EXPLANATIONS` (wording) and `buildTnbComponentValues` (values)
 * with the PDF, so the on-screen explanation and the downloaded report can
 * never describe different rules or amounts.
 */
export function TnbCalculationExplainer({
  result,
}: {
  result: TnbCalculationResult;
}) {
  const { t, language } = useApp();

  const components = useMemo(() => {
    const map = new Map(
      buildTnbComponentValues(result).map((entry) => [entry.key, entry]),
    );
    return map;
  }, [result]);

  return (
    <div className="card p-5 sm:p-6">
      <SectionHeading
        icon={BookOpen}
        title={t("tnb.understandingTitle")}
        description={t("tnb.understandingHint")}
      />

      <div className="grid gap-2.5 lg:grid-cols-2">
        {TNB_EXPLANATIONS.map((entry, index) => {
          const component = components.get(entry.key) as
            | TnbComponentValues
            | undefined;
          const label = entry.labelKey
            ? t(entry.labelKey)
            : entry.label[language];

          return (
            <details
              key={entry.key}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 transition open:border-[color-mix(in_srgb,var(--brand)_28%,transparent)] open:bg-[var(--surface)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[11px] font-extrabold text-[var(--brand)]">
                    {index + 1}
                  </span>
                  <span className="text-[13px] font-bold">{label}</span>
                </span>
                <ChevronDown
                  size={16}
                  className="shrink-0 text-muted transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="mt-3 space-y-2.5 ps-[38px] text-[12px] leading-relaxed">
                <p>
                  <span className="font-bold text-[var(--text)]">
                    {t("tnb.explanationDefinition")} :{" "}
                  </span>
                  <span className="text-muted">{entry.definition[language]}</span>
                </p>
                <p>
                  <span className="font-bold text-[var(--text)]">
                    {t("tnb.explanationWhy")} :{" "}
                  </span>
                  <span className="text-muted">{entry.why[language]}</span>
                </p>
                <p>
                  <span className="font-bold text-[var(--text)]">
                    {t("tnb.explanationWhen")} :{" "}
                  </span>
                  <span className="text-muted">{entry.when[language]}</span>
                </p>
                <p className="rounded-xl bg-[var(--surface-2)] px-3 py-2">
                  <span className="font-bold text-[var(--brand)]">
                    {t("tnb.explanationFormula")} :{" "}
                  </span>
                  <span className="text-soft">{entry.formula[language]}</span>
                </p>

                {component && component.values.length > 0 ? (
                  <div>
                    <p className="font-bold text-[var(--text)]">
                      {t("tnb.explanationValues")}{" "}
                      <span className="font-semibold text-muted">
                        ({t("tnb.explanationPerYear")})
                      </span>
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {component.values.map((value) => (
                        <span
                          key={`${entry.key}-${value.year}`}
                          className={`badge normal-case ${
                            value.applicable ? "badge-brand" : "badge-warning"
                          }`}
                        >
                          <span className="opacity-70">{value.year}</span>
                          {value.applicable ? (
                            formatExplanationValue(
                              value,
                              component.unit,
                              language,
                            )
                          ) : (
                            <span>{t("tnb.explanationNotApplicable")}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {entry.legalNote ? (
                  <p className="flex items-start gap-1.5 rounded-xl bg-[var(--warning-soft)] px-3 py-2 text-[11.5px] text-[var(--warning)]">
                    <TriangleAlert size={13} className="mt-0.5 shrink-0" />
                    <span>
                      <span className="font-bold">
                        {t("tnb.explanationLegalNote")} :{" "}
                      </span>
                      {entry.legalNote[language]}
                    </span>
                  </p>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>

      <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-[11px] leading-relaxed text-muted">
        {t("tnb.pdfDisclaimer")}
      </p>
    </div>
  );
}
