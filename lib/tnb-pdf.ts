import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { pdfDh, pdfNumber, pdfQuantity } from "./tnb-report";
import type { TnbReport, TnbReportYear } from "./tnb-report";

/**
 * Compact TNB report, modelled on the Daribati reference layout:
 * logo, title, one info line, one results table, short bullet explanations,
 * then the total. No verbose sections, no repeated headers across pages.
 */
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const COLORS = {
  navy: [16, 28, 88] as [number, number, number],
  brand: [38, 46, 227] as [number, number, number],
  text: [23, 29, 48] as [number, number, number],
  muted: [91, 100, 120] as [number, number, number],
  border: [214, 219, 234] as [number, number, number],
  header: [41, 128, 186] as [number, number, number],
  soft: [244, 246, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function pdfSafe(text: string): string {
  return text
    .replace(/[\u202F\u00A0]/g, " ")
    .replace(/\u2212/g, "-")
    .replace(/\u2192/g, " à ")
    .replace(/\u2264/g, "<=")
    .replace(/\u2265/g, ">=")
    .replace(/\u03A3/g, "Somme de");
}

export function createTnbReportPdf(
  report: TnbReport,
  options: { compress?: boolean } = {},
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: options.compress ?? true,
  });

  let y = 14;

  // Logo (best effort; skipped if it cannot be loaded, e.g. in tests).
  try {
    doc.addImage("/images/logo.png", "PNG", (PAGE_WIDTH - 22) / 2, y, 22, 22);
  } catch {
    // ignore — logo is decorative
  }
  y += 26;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.navy);
  doc.text(pdfSafe("TNB - Détails du calcul et des majorations"), MARGIN, y);
  y += 8;

  // Info line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const zones = Array.from(
    new Set(report.rows.map((row) => row.zoneShort)),
  ).join(", ");
  const info = [
    `Superficie: ${pdfQuantity(report.surfaceArea)} m²`,
    `Zone: ${zones || "-"}`,
    `Période: ${report.periodLabel.replace(/\s*→\s*/, " à ")}`,
  ].join("     ");
  doc.text(pdfSafe(info), MARGIN, y);
  y += 8;

  // Results table
  const rows = [...report.rows].reverse();
  const head = [
    [
      "Annee",
      "Tarif/m2",
      "Principal",
      "Defaut",
      "Maj 10%",
      "Maj 5%",
      "Maj 0.5%/mois",
      "Mois retard",
      "Total",
    ],
  ];
  const body = rows.map((row) => {
    if (!row.amounts) {
      return [
        String(row.taxYear),
        row.rate === null ? "-" : pdfQuantity(row.rate),
        "non calculee",
        "",
        "",
        "",
        "",
        "",
        "-",
      ];
    }
    return [
      String(row.taxYear),
      pdfQuantity(row.rate ?? 0),
      pdfNumber(row.amounts.principal),
      pdfNumber(row.amounts.def),
      pdfNumber(row.amounts.majoration10),
      pdfNumber(row.amounts.majoration5),
      pdfNumber(row.amounts.majoration05),
      String(row.amounts.monthsLate),
      pdfNumber(row.amounts.annualTotal),
    ];
  });

  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: "grid",
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_WIDTH,
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2,
      textColor: COLORS.text,
      lineColor: COLORS.border,
      lineWidth: 0.15,
      overflow: "linebreak",
      valign: "middle",
      halign: "right",
    },
    headStyles: {
      fillColor: COLORS.header,
      textColor: COLORS.white,
      fontSize: 9,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: { minCellHeight: 6 },
    alternateRowStyles: { fillColor: [247, 249, 253] },
    columnStyles: {
      0: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 20 },
      2: { cellWidth: 22 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 18 },
      6: { cellWidth: 22 },
      7: { cellWidth: 16, halign: "center" },
      8: { cellWidth: 24, fontStyle: "bold", textColor: COLORS.brand },
    },
  });

  y = (doc as any).lastAutoTable?.finalY ?? y;
  y += 6;

  // Short explanations
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text(pdfSafe("Explication des majorations:"), MARGIN, y);
  y += 5;

  const bullets = [
    "Défaut (pénalité) : si non déclaré, 15% du principal ou minimum 500 DH.",
    "Majoration 10% : pénalité fixe de 10% du principal.",
    "Majoration 5% : pénalité supplémentaire de 5% du principal.",
    "Majoration 0.5% par mois : intérêts de retard de 0.5% du principal par mois de retard.",
    "Mois de retard : calculés depuis mars de l'année impayée jusqu'au mois courant.",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  for (const b of bullets) {
    doc.text(pdfSafe("- " + b), MARGIN, y);
    y += 4.5;
  }
  y += 2;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.navy);
  doc.text(
    pdfSafe(`Total à payer: ${pdfDh(report.aggregates.annualTotal)}`),
    MARGIN,
    y,
  );
  y += 6;

  // Minimal footer disclaimer
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    pdfSafe(
      "Document de simulation - montant à confirmer auprès du service compétent.",
    ),
    MARGIN,
    PAGE_HEIGHT - 10,
  );

  doc.setProperties({
    title: "TNB - Details du calcul et des majorations",
    subject: `Simulation TNB ${report.periodLabel}`,
    author: "Daribati",
    creator: "Daribati",
  });

  return doc;
}

export function downloadTnbReport(report: TnbReport): string {
  const doc = createTnbReportPdf(report);
  const filename = `Daribati-${report.reference}.pdf`;
  doc.save(filename);
  return filename;
}