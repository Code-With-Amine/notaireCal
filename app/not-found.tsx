"use client";

import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { useApp } from "@/components/app-providers";

export default function NotFound() {
  const { t } = useApp();
  return (
    <div className="container-page flex min-h-[65vh] items-center justify-center py-16">
      <div className="card w-full max-w-xl p-8 text-center sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
          <FileQuestion size={30} />
        </span>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          404
        </p>
        <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.03em]">
          {t("notfound.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-muted">
          {t("notfound.desc")}
        </p>
        <Link href="/" className="btn btn-primary mx-auto mt-6 h-11 px-5">
          <ArrowLeft size={15} className="rtl:rotate-180" />
          {t("notfound.cta")}
        </Link>
      </div>
    </div>
  );
}
