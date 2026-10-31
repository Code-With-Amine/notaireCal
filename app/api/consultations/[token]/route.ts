import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length < 32) {
    return NextResponse.json({ ok: false, error: "Token invalide" }, { status: 400 });
  }

  const sql = requireDb();
  const rows = await sql`
    SELECT id, reference, title_number, cnp_number, status, created_at, published_at, result_grand_total
    FROM consultation_requests
    WHERE citizen_token = ${token}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "Demande introuvable" }, { status: 404 });
  }

  const req = rows[0];
  // Years are only visible once published
  let years: unknown[] = [];
  if (req.status === "Terminée" || req.status === "completed") {
    years = await sql`
      SELECT tax_year, surface_area, legacy_zone, modern_zone, modern_rate, is_declared,
             principal, def, majoration10, majoration5, months_late, majoration05, annual_total, unresolved_reason
      FROM consultation_years
      WHERE request_id = ${req.id}
      ORDER BY tax_year
    `;
  }

  return NextResponse.json({
    ok: true,
    request: {
      reference: req.reference,
      titleNumber: req.title_number,
      cnpNumber: req.cnp_number,
      status: req.status,
      createdAt: req.created_at,
      publishedAt: req.published_at,
      grandTotal: req.result_grand_total,
    },
    years,
  });
}
