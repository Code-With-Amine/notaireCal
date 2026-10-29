import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { pdfDh, pdfNumber, pdfQuantity } from "./tnb-report";
import type {
  TnbExplanationValue,
  TnbReport,
  TnbReportUnit,
  TnbReportYear,
} from "./tnb-report";

/**
 * Rendering of the TNB report.
 *
 * This module only formats the model produced by `buildTnbReport`, which in
 * turn only reads the result returned by `calculateTnb`. No tax formula is
 * duplicated here.
 */

const PAGE_WIDTH = 210;
const MARGIN = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_BOTTOM = 272;
const HEADER_HEIGHT = 13;

const COLORS = {
  navy: [16, 28, 88] as [number, number, number],
  brand: [38, 46, 227] as [number, number, number],
  text: [23, 29, 48] as [number, number, number],
  muted: [91, 100, 120] as [number, number, number],
  border: [214, 219, 234] as [number, number, number],
  soft: [244, 246, 252] as [number, number, number],
  warning: [180, 83, 9] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

/** jsPDF standard fonts use WinAnsi: replace glyphs that would render badly. */
function pdfSafe(text: string): string {
  return text
    .replace(/[\u202F\u00A0]/g, " ")
    .replace(/\s*\u2192\s*/g, " à ")
    .replace(/R\s*\u2264\s*(\d)/g, "R$1")
    .replace(/\u2212/g, "-")
    .replace(/\u2264/g, "<=")
    .replace(/\u2265/g, ">=")
    .replace(/\u03A3/g, "Somme de");
}

type PdfDoc = jsPDF & { lastAutoTable?: { finalY: number } };

export interface WriteParagraphOptions {
  size?: number;
  style?: "normal" | "bold" | "italic";
  color?: [number, number, number];
  x?: number;
  width?: number;
  gapAfter?: number;
}

export type WriteParagraph = (
  text: string,
  options?: WriteParagraphOptions,
) => void;

interface Cursor {
  y: number;
}

interface RenderContext {
  doc: PdfDoc;
  cursor: Cursor;
  writeParagraph: WriteParagraph;
  ensureSpace: (height: number) => void;
}

/** Formats one per-year value, never presenting a non-applicable zero as a charge. */
function formatValue(
  value: TnbExplanationValue,
  unit: TnbReportUnit,
): string {
  if (!value.applicable) return "non applicable";
  switch (unit) {
    case "text":
      return value.text ?? "—";
    case "m2":
      return `${pdfQuantity(value.value ?? 0)} m²`;
    case "rate":
      return `${pdfQuantity(value.value ?? 0)} DH/m²`;
    case "months":
      return `${value.value ?? 0} mois`;
    default:
      return pdfDh(value.value ?? 0);
  }
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
  }) as PdfDoc;

  const cursor: Cursor = { y: 26 };

  const writeParagraph: WriteParagraph = (text, options = {}) => {
    const size = options.size ?? 8.4;
    const x = options.x ?? MARGIN;
    const width = options.width ?? CONTENT_WIDTH;
    const lineHeight = size * 0.44;

    doc.setFont("helvetica", options.style ?? "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(options.color ?? COLORS.text));

    const lines = doc.splitTextToSize(pdfSafe(text), width) as string[];
    for (const line of lines) {
      if (cursor.y + lineHeight > CONTENT_BOTTOM) {
        doc.addPage();
        cursor.y = 22;
      }
      doc.text(line, x, cursor.y);
      cursor.y += lineHeight;
    }
    cursor.y += options.gapAfter ?? 0;
  };

  const ensureSpace = (height: number) => {
    if (cursor.y + height > CONTENT_BOTTOM) {
      doc.addPage();
      cursor.y = 22;
    }
  };

  const sectionTitle = (index: number, title: string) => {
    ensureSpace(16);
    cursor.y += 4;
    doc.setFillColor(...COLORS.brand);
    doc.rect(MARGIN, cursor.y - 3.4, 1.8, 5.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.6);
    doc.setTextColor(...COLORS.navy);
    doc.text(pdfSafe(`${index}. ${title}`), MARGIN + 4.5, cursor.y + 1.4);
    cursor.y += 4.2;
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, cursor.y, PAGE_WIDTH - MARGIN, cursor.y);
    cursor.y += 5;
  };

  const simpleTable = (
    body: string[][],
    options: {
      labelWidth?: number;
      fontSize?: number;
      alternate?: boolean;
      emphasizeLastRow?: boolean;
    } = {},
  ) => {
    autoTable(doc, {
      startY: cursor.y,
      body,
      theme: "grid",
      margin: { left: MARGIN, right: MARGIN },
      tableWidth: CONTENT_WIDTH,
      styles: {
        font: "helvetica",
        fontSize: options.fontSize ?? 8.4,
        cellPadding: 2.1,
        textColor: COLORS.text,
        lineColor: COLORS.border,
        lineWidth: 0.15,
        overflow: "linebreak",
        valign: "middle",
      },
      columnStyles: {
        0: {
          cellWidth: options.labelWidth ?? 52,
          fontStyle: "bold",
          fillColor: COLORS.soft,
        },
      },
      alternateRowStyles: options.alternate
        ? { fillColor: [250, 251, 254] }
        : undefined,
      didParseCell: (data) => {
        if (
          options.emphasizeLastRow &&
          data.row.index === body.length - 1 &&
          data.section === "body"
        ) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [232, 236, 250];
          data.cell.styles.textColor = COLORS.navy;
        }
      },
    });

    cursor.y = (doc.lastAutoTable?.finalY ?? cursor.y) + 4;
  };

  /* ----------------------------- Page 1 header ---------------------------- */

  writeParagraph("DARIBATI · TAXES LOCALES", {
    size: 7.6,
    style: "bold",
    color: COLORS.brand,
    gapAfter: 3.4,
  });
  writeParagraph(
    "Rapport de simulation de la Taxe sur les Terrains Non Bâtis (TNB)",
    { size: 16.5, style: "bold", color: COLORS.navy, gapAfter: 1.5 },
  );
  writeParagraph(
    `Référence ${report.reference} · Généré le ${formatLongDate(
      report.generatedAt,
    )}`,
    { size: 7.8, color: COLORS.muted, gapAfter: 4 },
  );

  /* --------------------------- 1. Informations ---------------------------- */

  sectionTitle(1, "Informations du calcul");

  const declarationSummary =
    report.selectedYearCount === report.resolvedYearCount
      ? `${report.declaredCount} année(s) déclarée(s) sur ${report.selectedYearCount}`
      : `${report.declaredCount} année(s) déclarée(s) · ${
          report.selectedYearCount - report.resolvedYearCount
        } année(s) non calculée(s)`;

  const zoneLegendEntries = report.rows
    .filter((row) => row.rate !== null)
    .reduce<Array<{ label: string; rate: number }>>((legend, row) => {
      if (!legend.some((entry) => entry.label === row.zoneLabel)) {
        legend.push({ label: row.zoneLabel, rate: row.rate ?? 0 });
      }
      return legend;
    }, [])
    .map((entry) => `${entry.label} (${pdfQuantity(entry.rate)} DH/m²)`);

  const zoneLegend = zoneLegendEntries.join(" · ");

  const parameterRows: string[][] = [
    ["Superficie du terrain", `${pdfQuantity(report.surfaceArea)} m²`],
    [
      "Années sélectionnées",
      `${report.selectedYearCount} année(s) · ${report.periodLabel}`,
    ],
    ["Date de calcul", report.calculationDateLabel],
    ["Statut de déclaration", declarationSummary],
    [
      "Zone(s) et tarif(s)",
      zoneLegendEntries.length > 0
        ? zoneLegendEntries.join("\n")
        : "Tarif unique, sans zone",
    ],
    [
      "Barème appliqué",
      `${report.ruleVersions.join(" · ")} — jeu de règles ${report.rules.id}`,
    ],
    [
      "Résultat",
      report.complete
        ? "Complet : toutes les années sélectionnées ont été calculées."
        : `Partiel : ${
            report.selectedYearCount - report.resolvedYearCount
          } année(s) non calculée(s), exclue(s) des totaux.`,
    ],
  ];

  simpleTable(parameterRows, { labelWidth: 48 });
  cursor.y += 1;

  /* ---------------------------- 2. Results -------------------------------- */

  sectionTitle(2, "Résultats année par année");

  const resultsHead = [
    "Année",
    "Statut",
    "Zone",
    "Tarif\nDH/m²",
    "Surface\nm²",
    "Principal\nDH",
    "DEF\nDH",
    "Maj. 10 %\nDH",
    "Maj. 5 %\nDH",
    "Mois\nretard",
    "Maj. 0,5 %\nDH",
    "Total annuel\nDH",
  ];

  const resultsBody = report.rows.map((row) => {
    if (!row.amounts) {
      return [
        String(row.taxYear),
        row.statusLabel,
        row.zoneShort,
        row.rate === null ? "—" : pdfQuantity(row.rate),
        pdfQuantity(row.surfaceArea),
        "Non calculée",
        "",
        "",
        "",
        "",
        "",
        "—",
      ];
    }
    return [
      String(row.taxYear),
      row.statusLabel,
      row.zoneShort,
      pdfQuantity(row.rate ?? 0),
      pdfQuantity(row.surfaceArea),
      pdfNumber(row.amounts.principal),
      pdfNumber(row.amounts.def),
      pdfNumber(row.amounts.majoration10),
      pdfNumber(row.amounts.majoration5),
      String(row.amounts.monthsLate),
      pdfNumber(row.amounts.majoration05),
      pdfNumber(row.amounts.annualTotal),
    ];
  });

  autoTable(doc, {
    startY: cursor.y,
    head: [resultsHead],
    body: resultsBody,
    theme: "grid",
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: CONTENT_WIDTH,
    showHead: "everyPage",
    rowPageBreak: "avoid",
    styles: {
      font: "helvetica",
      fontSize: 6.8,
      cellPadding: 1.6,
      textColor: COLORS.text,
      lineColor: COLORS.border,
      lineWidth: 0.12,
      overflow: "linebreak",
      valign: "middle",
      halign: "right",
    },
    headStyles: {
      fillColor: COLORS.navy,
      textColor: COLORS.white,
      fontSize: 6.4,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: { minCellHeight: 6 },
    alternateRowStyles: { fillColor: [247, 249, 253] },
    columnStyles: {
      0: { cellWidth: 10, halign: "left", fontStyle: "bold" },
      1: { cellWidth: 22, halign: "left" },
      2: { cellWidth: 14, halign: "left" },
      3: { cellWidth: 11 },
      4: { cellWidth: 13 },
      5: { cellWidth: 20 },
      6: { cellWidth: 15 },
      7: { cellWidth: 15 },
      8: { cellWidth: 14 },
      9: { cellWidth: 10, halign: "center" },
      10: { cellWidth: 16 },
      11: { cellWidth: 18, fontStyle: "bold", textColor: COLORS.brand },
    },
    didParseCell: (data) => {
      const row = report.rows[data.row.index];
      if (
        data.section === "body" &&
        row &&
        !row.amounts &&
        data.column.index === 5
      ) {
        data.cell.styles.textColor = COLORS.warning;
        data.cell.styles.halign = "center";
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  cursor.y = (doc.lastAutoTable?.finalY ?? cursor.y) + 3;

  if (zoneLegend) {
    writeParagraph(`Zones utilisées : ${zoneLegend}.`, {
      size: 7.4,
      color: COLORS.muted,
      gapAfter: 2,
    });
  }

  /* --------------------------- Grand total -------------------------------- */

  ensureSpace(70);
  sectionTitle(3, "Total général");

  const aggregates = report.aggregates;
  const totalRows: string[][] = [
    ["Principal", pdfDh(aggregates.principal)],
    ["DEF", pdfDh(aggregates.def)],
    ["Majoration 10 %", pdfDh(aggregates.majoration10)],
    ["Majoration 5 %", pdfDh(aggregates.majoration5)],
    ["Majoration 0,5 % (retard)", pdfDh(aggregates.majoration05)],
    ["TOTAL GÉNÉRAL", pdfDh(aggregates.annualTotal)],
  ];

  simpleTable(totalRows, {
    labelWidth: 95,
    alternate: true,
    emphasizeLastRow: true,
  });

  writeParagraph(
    report.complete
      ? "Somme exacte des totaux annuels des années calculées. Chaque ligne est arrondie à 2 décimales avant d'être additionnée."
      : "Total partiel : les années non calculées sont exclues et ne sont jamais comptées comme zéro.",
    {
      size: 7.4,
      color: report.complete ? COLORS.muted : COLORS.warning,
      gapAfter: 2,
    },
  );

  /* ------------------------- 4. Explanations ------------------------------ */

  ensureSpace(44);
  sectionTitle(4, "Explication détaillée des éléments du calcul");

  writeParagraph(
    "Chaque élément affiché dans le tableau est expliqué ci-dessous : ce qu'il représente, pourquoi il apparaît, dans quels cas il s'applique et la formule réellement utilisée par Daribati.",
    { size: 8.2, color: COLORS.muted, gapAfter: 3 },
  );

  report.explanations.forEach((explanation) => {
    ensureSpace(18);

    doc.setDrawColor(...COLORS.brand);
    doc.setLineWidth(0.6);
    const headingY = cursor.y;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.6);
    doc.setTextColor(...COLORS.navy);
    const headingLines = doc.splitTextToSize(
      pdfSafe(explanation.label),
      CONTENT_WIDTH - 4,
    ) as string[];
    headingLines.forEach((line, index) => {
      ensureSpace(5);
      doc.text(line, MARGIN + 4, cursor.y);
      cursor.y += 4.3;
      if (index === headingLines.length - 1) {
        doc.line(MARGIN, headingY - 3.2, MARGIN, cursor.y - 3.8);
      }
    });
    cursor.y += 0.4;

    writeParagraph(`Définition : ${explanation.definition}`, {
      size: 8.2,
      x: MARGIN + 4,
      width: CONTENT_WIDTH - 4,
    });
    writeParagraph(`Pourquoi : ${explanation.why}`, {
      size: 8.2,
      x: MARGIN + 4,
      width: CONTENT_WIDTH - 4,
    });
    writeParagraph(`Quand : ${explanation.when}`, {
      size: 8.2,
      x: MARGIN + 4,
      width: CONTENT_WIDTH - 4,
    });
    writeParagraph(`Méthode : ${explanation.formula}`, {
      size: 8.2,
      style: "italic",
      x: MARGIN + 4,
      width: CONTENT_WIDTH - 4,
    });

    const example = report.rows
      .map((row) => row.lines.find((line) => line.key === explanation.key))
      .find((line) => line !== undefined);
    if (example) {
      writeParagraph(`Exemple avec vos valeurs : ${example.formula}`, {
        size: 8.2,
        style: "italic",
        color: COLORS.brand,
        x: MARGIN + 4,
        width: CONTENT_WIDTH - 4,
      });
    }

    if (explanation.values.length > 0) {
      const values = explanation.values
        .map(
          (entry) =>
            `${entry.year} : ${formatValue(entry, explanation.unit)}`,
        )
        .join(" · ");
      writeParagraph(`Vos résultats par année : ${values}`, {
        size: 8.2,
        color: COLORS.navy,
        x: MARGIN + 4,
        width: CONTENT_WIDTH - 4,
      });
    }

    if (explanation.legalNote) {
      writeParagraph(`À vérifier : ${explanation.legalNote}`, {
        size: 7.6,
        style: "italic",
        color: COLORS.warning,
        x: MARGIN + 4,
        width: CONTENT_WIDTH - 4,
      });
    }

    cursor.y += 3.2;
  });

  /* ---------------------- 5. Year-by-year detail -------------------------- */

  ensureSpace(30);
  sectionTitle(5, "Détail du calcul par année");

  report.rows.forEach((row) => {
    renderYearDetail({ doc, cursor, writeParagraph, ensureSpace }, row);
  });

  /* ------------------------ 6. Notes and limits --------------------------- */

  sectionTitle(6, "Notes, limites et règles à vérifier");

  const notes = [
    "Ce document présente une simulation basée sur les paramètres et les règles de calcul configurés dans Daribati. Le montant définitif doit être confirmé auprès du service compétent.",
    "« Déclarée » signifie que le terrain a été déclaré pour l'année concernée ; cela ne signifie pas que la taxe a été payée.",
    "Chaque année est calculée indépendamment : son propre tarif, son propre statut de déclaration et ses propres majorations.",
    "Toutes les lignes monétaires sont arrondies à 2 décimales. Le total annuel est la somme des lignes arrondies ; le total général est la somme des totaux annuels.",
    "Les éléments non applicables sont signalés « non applicable » plutôt que présentés comme des charges ; un montant nul n'est jamais ajouté aux totaux.",
  ];

  notes.forEach((note) => {
    writeParagraph(`• ${note}`, {
      size: 8.2,
      x: MARGIN + 2,
      width: CONTENT_WIDTH - 2,
      gapAfter: 1.2,
    });
  });

  cursor.y += 2;
  writeParagraph("Règles à faire vérifier avant tout usage officiel :", {
    size: 8.6,
    style: "bold",
    color: COLORS.warning,
    gapAfter: 1.5,
  });

  report.verificationNotes.forEach((note) => {
    writeParagraph(`• ${note}`, {
      size: 8,
      x: MARGIN + 2,
      width: CONTENT_WIDTH - 2,
      color: COLORS.warning,
      gapAfter: 1.2,
    });
  });

  drawPageChrome(doc, report);

  doc.setProperties({
    title: "Rapport de simulation TNB — Daribati",
    subject: `Simulation TNB ${report.periodLabel}`,
    author: "Daribati",
    creator: "Daribati",
    keywords: `TNB, Daribati, ${report.periodLabel}`,
  });

  return doc;
}

function renderYearDetail({ cursor, writeParagraph, ensureSpace }: RenderContext, row: TnbReportYear) {
  // Keep one whole year block on the same page whenever it fits.
  ensureSpace(70);

  const header = `Année ${row.taxYear} · ${row.statusLabel} · ${row.zoneLabel}${
    row.rate !== null ? ` · ${pdfQuantity(row.rate)} DH/m²` : ""
  } · ${pdfQuantity(row.surfaceArea)} m²`;

  writeParagraph(header, {
    size: 9.4,
    style: "bold",
    color: COLORS.navy,
    gapAfter: 1.2,
  });

  if (!row.amounts) {
    writeParagraph(
      `Année non calculée${row.unresolvedReason ? ` : ${row.unresolvedReason}` : ""}. Elle est exclue des totaux.`,
      { size: 8.2, color: COLORS.warning, gapAfter: 4 },
    );
    return;
  }

  writeParagraph(`Surface retenue : ${pdfQuantity(row.surfaceArea)} m²`, {
    size: 8.2,
    x: MARGIN + 2,
    width: CONTENT_WIDTH - 2,
    gapAfter: 0.4,
  });
  writeParagraph(
    `Tarif applicable : ${
      row.rate === null ? "non applicable" : `${pdfQuantity(row.rate)} DH/m²`
    }`,
    {
      size: 8.2,
      x: MARGIN + 2,
      width: CONTENT_WIDTH - 2,
      gapAfter: 0.4,
    },
  );
  writeParagraph(
    `Statut de déclaration : ${row.statusLabel}`,
    {
      size: 8.2,
      x: MARGIN + 2,
      width: CONTENT_WIDTH - 2,
      gapAfter: 1.4,
    },
  );

  row.lines.forEach((line) => {
    const value =
      line.unit === "months"
        ? `${line.value} mois`
        : pdfDh(line.value);

    writeParagraph(
      `• ${line.label} : ${line.applicable ? value : "non applicable"}`,
      {
        size: 8.4,
        style: "bold",
        x: MARGIN + 2,
        width: CONTENT_WIDTH - 2,
        color: line.applicable ? COLORS.text : COLORS.muted,
        gapAfter: 0.2,
      },
    );
    writeParagraph(line.formula, {
      size: 7.8,
      style: "italic",
      x: MARGIN + 6,
      width: CONTENT_WIDTH - 6,
      color: COLORS.muted,
      gapAfter: 1,
    });
  });

  const sum = row.lines
    .filter((line) => line.key !== "monthsLate")
    .map((line) =>
      line.applicable ? pdfDh(line.value) : "0,00 DH (non applicable)",
    )
    .join(" + ");

  writeParagraph(
    `Total annuel ${row.taxYear} = ${sum} = ${pdfDh(row.amounts.annualTotal)}`,
    {
      size: 8.6,
      style: "bold",
      color: COLORS.brand,
      x: MARGIN + 2,
      width: CONTENT_WIDTH - 2,
      gapAfter: 5,
    },
  );
  cursor.y += 1;
}

function formatLongDate(value: Date): string {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${value.getFullYear()} à ${String(
    value.getHours(),
  ).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

function drawPageChrome(doc: jsPDF, report: TnbReport) {
  const total = doc.getNumberOfPages();

  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);

    doc.setFillColor(...COLORS.navy);
    doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.white);
    doc.text("Daribati", MARGIN, 8.4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.6);
    doc.setTextColor(210, 216, 238);
    doc.text(
      "Rapport de simulation TNB — Terrains non bâtis",
      PAGE_WIDTH - MARGIN,
      8.4,
      { align: "right" },
    );

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, 283, PAGE_WIDTH - MARGIN, 283);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text(
      "Document de simulation — à confirmer auprès du service compétent.",
      MARGIN,
      288,
    );
    doc.text(`Page ${page} / ${total}`, PAGE_WIDTH - MARGIN, 288, {
      align: "right",
    });
    doc.text(`Réf. ${report.reference}`, MARGIN, 291.5);
  }
}

/** Build the PDF and trigger the browser download. */
export function downloadTnbReport(report: TnbReport): string {
  const doc = createTnbReportPdf(report);
  const filename = `Daribati-${report.reference}.pdf`;
  doc.save(filename);
  return filename;
}
